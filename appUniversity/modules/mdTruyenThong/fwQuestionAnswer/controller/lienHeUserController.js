const dateformat = require('dateformat');
module.exports = app => {
    const lienHeMenu = {
        parentMenu: app.parentMenu.user,
        menus: {
            4503: { title: 'Hộp thư Q&A', link: '/user/tt/lien-he/home', icon: 'fa fa-envelope-o', pin: true },
        },
    };

    // Constant
    const { MdTruyenThong } = require('../constant');

    // Config
    const { userPermission, messageMaxLen } = require('./config')(app);

    // Socket event emitter
    const { emitFwQaRefreshUser, emitFwQaRefreshHopThuDen, emitFwQaBlackboxNotiEvent } = require('./emitSocketEvent')(app);

    // Util method
    const { getUserTtLienUploadFolder, getFwQaMessageUploadFolder } = require('./util')(app);

    app.permission.add({
        name: userPermission, menu: lienHeMenu
    });

    app.get('/user/tt/lien-he/home', app.permission.check(userPermission), app.templates.admin);

    // User APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/user/page/:pageNumber/:pageSize', app.permission.check(userPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 0;
            const user = req.session.user;
            let email = user.email;
            let page = await app.model.fwQuestionAnswer.searchUserPage(_pageNumber, _pageSize, email, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/new-qa-box', app.permission.check(userPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const { dmChuDe: maChuDe, chuDe, noiDung, phone } = req.body.data;
            let loaiDoiTuong = user.isStudent ? 2 : (user.isStaff ? 1 : 0);
            let maDoiTuong = user.isStudent ? user.mssv : (user.isStaff ? user.shcc : null);
            if (!maDoiTuong) throw 'Invalid User';
            if (noiDung.length > messageMaxLen) throw `Độ dài tin nhắn vượt quá giới hạn cho phép (${messageMaxLen} ký tự)`;
            const tenChuDe = (await app.model.dmChuDe.get({ id: maChuDe }, 'ten')).ten;
            const now = Date.now();

            const fwQAItem = await app.model.fwQuestionAnswer.create({ maChuDe, noiDung: chuDe == '' ? `${user.lastName} ${user.firstName}: ${tenChuDe} (Tạo lúc ${dateformat(Date(now), 'HH:MM dd/mm/yyyy')}) ` : chuDe, maDoiTuong, loaiDoiTuong, creatorEmail: user.email, createdAt: Date.now(), isActive: 1, isBlackBox: 0, latestChatTime: Date.now(), chatBoxType: 'Q&A', phone });
            const fwQAMessageItem = await app.model.fwQuestionAnswerMessage.create({ senderId: maDoiTuong, noiDung: noiDung, ho: user.lastName, ten: user.firstName, email: user.email, maQa: fwQAItem.id, createdAt: now });
            await app.model.fwQuestionAnswerMember.create({ ho: user.lastName, ten: user.firstName, email: user.email, maQa: fwQAItem.id, maMember: maDoiTuong, ngayThamGia: now, role: 'QUESTIONER' });

            // Lưu file hình
            const fwQaMessageId = fwQAMessageItem.id;
            const folderImageUser = getUserTtLienUploadFolder(user);
            const imageFiles = app.fs.existsSync(folderImageUser) && app.fs.readdirSync(folderImageUser);
            imageFiles && imageFiles.length && await Promise.all(imageFiles.map(async img => {
                return await app.fs.rename(app.path.join(folderImageUser, img), app.path.join(getFwQaMessageUploadFolder(fwQAItem.id, fwQaMessageId), img));
            }));

            res.send({ fwQAItem, fwQAMessageItem });

            createQANotifyActivity(fwQAItem.id, user);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/cancelled-fw-qa-box', app.permission.check(userPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const fwQaId = req.body.fwQaId;
            if (!fwQaId) throw 'Vui lòng gửi kèm fwQaId để hủy';
            let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(fwQaId)).rows[0];
            if (fwQaItem.creatorEmail != user.email) throw 'Chỉ có thể hủy box do mình tạo';
            await app.model.fwQuestionAnswer.update({ id: fwQaId }, { isCancelled: 1, isActive: 0 });
            res.end();

            fwQaItem = { ...fwQaItem, isCancelled: 1, isActive: 0 };
            emitFwQaRefreshHopThuDen({ maChuDe: fwQaItem.maChuDe });
            emitFwQaRefreshUser({ email: user.email });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const createQANotifyActivity = async (fwQAId, user) => {
        const fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(fwQAId)).rows[0];
        const listAssigned = await app.model.fwQuestionAnswerAssignChuDe.getAll({ maChuDe: fwQaItem.maChuDe }, 'maDonVi,tenDonVi,emailCanBo');
        emitFwQaRefreshUser({ email: user.email }); // Gửi socket cho người dùng
        if (listAssigned && listAssigned.length) {
            const listEmail = listAssigned.map(item => item.emailCanBo),
                title = `Hộp thư mới chủ đề: ${fwQaItem.tenChuDe}`,
                subTitle = `Tiêu đề: ${fwQaItem.noiDung.length < 100 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 100) + '...'}`;

            await Promise.all(listEmail.map(async email => {
                const fwQaNotificationItem = await app.model.fwQuestionAnswerNotification.create({ email, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: '/user/tt/lien-he/quan-ly', sendTime: Date.now(), mobilePath: MdTruyenThong.qaHopThuDen, });
                if (fwQaNotificationItem.mobileArguments) fwQaNotificationItem.mobileArguments = app.utils.parse(fwQaNotificationItem.mobileArguments);
                emitFwQaBlackboxNotiEvent({ email, fwQaNotificationItem: { ...fwQaNotificationItem, notiType: 1 } });
            }));

            app.firebase.sendToEmails({ listEmail: listEmail, title, body: subTitle });
            emitFwQaRefreshHopThuDen({ maChuDe: fwQaItem.maChuDe }); //TODO Gửi socket cho cán bộ phụ trách chủ đề
        }
    };
};
