module.exports = app => {
    const hopDenMenu = {
        parentMenu: app.parentMenu.user,
        menus: {
            4505: { title: 'Hộp thư Blackbox', link: '/user/tt/lien-he/blackbox/home', icon: 'fa fa-envelope-o', pin: true, backgroundColor: '#5a5a5a' }
        }
    };

    // Constant
    const { MdTruyenThong } = require('../constant');

    // Config
    const { userPermission, messageMaxLen } = require('./config')(app);

    // Socket emit
    const { emitFwBlackboxRefreshUser, emitFwQaBlackboxNotiEvent, emitFwBlackboxRefreshHopThuDen, emitFwBlackboxRefreshAdmin } = require('./emitSocketEvent')(app);

    // Util method
    const { getUserTtLienUploadFolder, getFwQaMessageUploadFolder } = require('./util')(app);

    app.permission.add({ name: userPermission, menu: hopDenMenu });

    app.get('/user/tt/lien-he/blackbox/home', app.permission.check(userPermission), app.templates.admin);

    // User APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/an-danh/user/page/:pageNumber/:pageSize', app.permission.check(userPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 1;
            const user = req.session.user;
            let email = user.email;
            let page = await app.model.fwQuestionAnswer.searchUserPage(_pageNumber, _pageSize, email, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            list = list.map(item => ({ ...item, maNguoiPhuTrach: null, emailNguoiPhuTrach: null, hoNguoiPhuTrach: null, tenNguoiPhuTrach: null }));
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/an-danh/new-qa-box', app.permission.check(userPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const { dmChuDe: maChuDe, chuDe, noiDung, incognito } = req.body.data;
            let loaiDoiTuong = user.isStudent ? 2 : (user.isStaff ? 1 : 0);
            let maDoiTuong = user.isStudent ? user.mssv : (user.isStaff ? user.shcc : null);
            if (!maDoiTuong) throw 'Invalid User';
            if (noiDung.length > messageMaxLen) throw `Độ dài tin nhắn vượt quá giới hạn cho phép (${messageMaxLen} ký tự)`;

            const fwQAItem = await app.model.fwQuestionAnswer.create({ maChuDe, noiDung: chuDe, maDoiTuong, loaiDoiTuong, creatorEmail: user.email, createdAt: Date.now(), isActive: 1, isBlackBox: incognito == 'true' ? 1 : 2, latestChatTime: Date.now(), chatBoxType: incognito == 'true' ? 'BLACKBOX' : 'TRANSPARENT_BLACKBOX' });
            const fwQAMessageItem = await app.model.fwQuestionAnswerMessage.create({ senderId: maDoiTuong, noiDung: noiDung, ho: user.lastName, ten: user.firstName, email: user.email, maQa: fwQAItem.id, createdAt: Date.now() });
            await app.model.fwQuestionAnswerMember.create({ ho: user.lastName, ten: user.firstName, email: user.email, maQa: fwQAItem.id, maMember: maDoiTuong, ngayThamGia: Date.now(), role: 'QUESTIONER' });

            const folderImageUser = getUserTtLienUploadFolder(user);
            const imageFiles = app.fs.existsSync(folderImageUser) && app.fs.readdirSync(folderImageUser);
            imageFiles && imageFiles.length && await Promise.all(imageFiles.map(async img => {
                return await app.fs.rename(app.path.join(folderImageUser, img), app.path.join(getFwQaMessageUploadFolder(fwQAItem.id, fwQAMessageItem.id), img));
            }));

            res.send({ fwQAItem, fwQAMessageItem });
            createBlackboxNotifyActivity(fwQAItem, chuDe, user);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const createBlackboxNotifyActivity = async (fwQAItem, chuDe, user) => {
        let detailFwQaItem = (await app.model.fwQuestionAnswer.getDetailById(fwQAItem.id)).rows[0];

        emitFwBlackboxRefreshUser({ email: user.email });
        emitFwBlackboxRefreshHopThuDen({ maDonVi: detailFwQaItem.maDonVi });
        emitFwBlackboxRefreshAdmin();

        const listBlackboxAdminEmail = (await app.model.tchcCanBo.getAll({ statement: `maDonVi = ${detailFwQaItem.maDonVi}`, parameter: {} }, 'email')).map(item => item.email);
        if (listBlackboxAdminEmail && listBlackboxAdminEmail.length) {
            const title = 'Hộp thư Blackbox mới', subTitle = `Tiêu đề: '${chuDe.length < 100 ? chuDe : chuDe.substring(0, 100) + '...'}'`;

            await Promise.all(listBlackboxAdminEmail.map(async email => {
                const fwQaNotificationItem = await app.model.fwQuestionAnswerNotification.create({ email, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: '/user/tt/lien-he/blackbox/phan-quyen/quan-ly', sendTime: Date.now(), mobilePath: MdTruyenThong.blackboxHopThuDen });
                if (fwQaNotificationItem.mobileArguments) fwQaNotificationItem.mobileArguments = app.utils.parse(fwQaNotificationItem.mobileArguments);
                emitFwQaBlackboxNotiEvent({ email });
            }));

            app.firebase.sendToEmails({ listEmail: listBlackboxAdminEmail, title, body: subTitle });
        }
    };
};