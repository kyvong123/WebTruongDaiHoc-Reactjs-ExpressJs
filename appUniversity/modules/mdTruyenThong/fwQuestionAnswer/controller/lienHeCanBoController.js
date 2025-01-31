module.exports = app => {
    const quanLyMenu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4501: { title: 'Trả lời Q&A', link: '/user/tt/lien-he/quan-ly', icon: 'fa fa-envelope-o', groupIndex: 0 },
        },
    };

    // Constant
    const { MdTruyenThong } = require('../constant');

    // Config
    const { staffPermission, isTtLienHeBeta } = require('./config')(app);

    // Socket event emitter
    const { emitFwQaRefreshHopThuDen, emitFwQaRefreshPhuTrach, emitFwQaRefreshUser, emitFwQaBlackboxNotiEvent, emitFwChatboxRefreshEvent } = require('./emitSocketEvent')(app);

    app.permission.add(
        { name: staffPermission, menu: quanLyMenu }
    );

    app.get('/user/tt/lien-he/quan-ly', app.permission.check(staffPermission), app.templates.admin);

    app.readyHooks.add('addSocketListener:DmChuDeListener', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('fwQACanBoDmChuDe', async (socket) => {
            const user = app.io.getSessionUser(socket);
            const maChuDeList = (await app.model.fwQuestionAnswerAssignChuDe.getAll({ emailCanBo: user?.email }, 'maChuDe')).map(item => item.maChuDe);
            if (!isTtLienHeBeta || (user && user.permissions.exists(['fwQuestionAnswer:userTest', 'fwQuestionAnswer:staffTest']))) {
                maChuDeList.map((maChuDe) => {
                    user && user.isStaff && socket.join(`fwQAChuDe:${maChuDe}`);
                });
            }
        })
    });

    // Admin APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/quan-ly/page/:pageNumber/:pageSize', app.permission.check(staffPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 0;
            let page = await app.model.fwQuestionAnswer.searchPage(_pageNumber, _pageSize, req.session.user.maDonVi, req.session.user.email, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/quan-ly/phu-trach/page/:pageNumber/:pageSize', app.permission.check(staffPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 0;
            let page = await app.model.fwQuestionAnswer.searchPhuTrachPage(_pageNumber, _pageSize, req.session.user.email, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/quan-ly/item/:ma', app.permission.check(staffPermission), async (req, res) => {
        try {
            let item = await app.model.fwQuestionAnswer.get({ id: req.params.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/quan-ly', app.permission.check(staffPermission), async (req, res) => {
        try {
            const changes = req.body.changes;
            let item = await app.model.fwQuestionAnswer.update({ id: req.body.id }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/lien-he/quan-ly', app.permission.check(staffPermission), async (req, res) => {
        try {
            let item = await app.model.fwQuestionAnswer.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/nhan-qa-box', app.permission.check(staffPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const idQa = req.body.id;
            if (user.isStaff) {
                let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(idQa)).rows[0];
                if (fwQaItem.emailNguoiPhuTrach) throw 'Đã có người nhận box này';
                if (fwQaItem && fwQaItem.creatorEmail == user.email) throw 'Không được phép nhận phụ trách box do chính mình tạo';

                let fwQANguoiPhuTrach = await app.model.fwQuestionAnswerMember.create({ ho: user.lastName, ten: user.firstName, email: user.email, maQa: idQa, maMember: user.shcc, ngayThamGia: Date.now(), role: 'ANSWERER' });
                await app.model.fwQuestionAnswer.update({ id: idQa }, { isAssigned: 1 });
                fwQaItem = { ...fwQaItem, isAssigned: 1, hoNguoiPhuTrach: user.lastName, tenNguoiPhuTrach: user.firstName, emailNguoiPhuTrach: user.email, maNguoiPhuTrach: user.shcc };
                res.send({ fwQANguoiPhuTrach, fwQA: fwQaItem });

                acceptQANotifyActivity(fwQaItem, user);
            } else {
                throw 'Sinh viên không có quyền phụ trách hộp thư liên hệ';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/close-box', app.permission.check(staffPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const { id } = req.body;
            const now = Date.now();

            let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(id)).rows[0];
            const { email: emailNguoiPhuTrach } = await app.model.fwQuestionAnswerMember.get({ maQa: id, role: 'ANSWERER' });
            if (emailNguoiPhuTrach != user.email) throw 'Không cho phép đóng box QA ngoại trừ người phụ trách box!';
            await app.model.fwQuestionAnswer.update({ id }, { isActive: 0, closedAt: now });
            fwQaItem = { ...fwQaItem, isActive: 0, closedAt: now };
            res.send();

            closeQANotifyActivity(fwQaItem);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const acceptQANotifyActivity = async (fwQaItem, user) => {
        // Thông báo cho toàn đơn vị
        emitFwQaRefreshHopThuDen({ maChuDe: fwQaItem.maChuDe });
        emitFwQaRefreshPhuTrach({ email: fwQaItem.emailNguoiPhuTrach });

        // Thông báo cho người tạo box
        const title = 'Hộp thư của bạn được nhận phụ trách', subTitle = `Cán bộ ${user.lastName} ${user.firstName} (${user.email}) nhận phụ trách hộp thư: ${fwQaItem.noiDung.length < 100 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 100) + '...'}.`,
            pathArguments = `{"id":${fwQaItem.id}}`;
        const fwQaNotificationItem = await app.model.fwQuestionAnswerNotification.create({ email: fwQaItem.creatorEmail, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.id}`, sendTime: Date.now(), mobilePath: MdTruyenThong.chatQaDetail, mobileArguments: pathArguments });
        if (fwQaNotificationItem.mobileArguments) {
            fwQaNotificationItem.mobileArguments = app.utils.parse(fwQaNotificationItem.mobileArguments);
        }
        emitFwQaRefreshUser({ email: fwQaItem.creatorEmail });
        emitFwQaBlackboxNotiEvent({ email: fwQaItem.creatorEmail });
        app.firebase.sendToEmails({ listEmail: [fwQaItem.creatorEmail], title, body: subTitle });
    };

    const closeQANotifyActivity = async (fwQaItem) => {
        const title = 'Hộp thư đã được đóng lại!', subTitle = `Tiêu đề: ${fwQaItem.noiDung.length < 100 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 100) + '...'}.`,
            pathArguments = `{"id": ${fwQaItem.id}}`;
        const fwQaNotificationItem = await app.model.fwQuestionAnswerNotification.create({ email: fwQaItem.creatorEmail, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.id}`, sendTime: Date.now(), mobilePath: MdTruyenThong.chatQaDetail, mobileArguments: pathArguments });
        if (fwQaNotificationItem.mobileArguments) fwQaNotificationItem.mobileArguments = app.utils.parse(fwQaNotificationItem.mobileArguments);

        emitFwQaRefreshUser({ email: fwQaItem.creatorEmail });
        emitFwChatboxRefreshEvent({ email: fwQaItem.creatorEmail, maChatBox: fwQaItem.id });
        emitFwChatboxRefreshEvent({ email: fwQaItem.emailNguoiPhuTrach, maChatBox: fwQaItem.id });

        emitFwQaRefreshHopThuDen({ maChuDe: fwQaItem.maChuDe });
        emitFwQaRefreshPhuTrach({ email: fwQaItem.emailNguoiPhuTrach });
        emitFwQaBlackboxNotiEvent({ email: fwQaItem.creatorEmail });
        app.firebase.sendToEmails({ listEmail: [fwQaItem.creatorEmail], title, body: subTitle });
    };
};