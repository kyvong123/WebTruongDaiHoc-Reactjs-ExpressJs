module.exports = app => {
    const quanLyHopDenMenu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4506: { title: 'Quản lý Blackbox đơn vị', link: '/user/tt/lien-he/blackbox/quan-ly', icon: 'fa fa-envelope-o', backgroundColor: '#5a5a5a', groupIndex: 1 },
        },
    };

    // Constant
    const { MdTruyenThong } = require('../constant');

    // Config
    const { staffPermission, isTtLienHeBeta, blackBoxManagePermission } = require('./config')(app);

    // Socket emit
    const { emitFwBlackboxRefreshUser, emitFwQaBlackboxNotiEvent, emitFwBlackboxRefreshPhuTrach, emitFwBlackboxRefreshHopThuDen, emitFwBlackboxRefreshAdmin } = require('./emitSocketEvent')(app);

    // app.permissionHooks.add(...) xài chung với adminController
    app.permission.add({ name: blackBoxManagePermission, menu: quanLyHopDenMenu });

    app.get('/user/tt/lien-he/blackbox/quan-ly', app.permission.check(blackBoxManagePermission), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleManageBlackbox', (user, staff) => new Promise(resolve => {
        if (!isTtLienHeBeta && staff.maDonVi && ['70', '71'].includes(staff.maDonVi)) {
            app.permissionHooks.pushUserPermission(user, blackBoxManagePermission);
        }
        resolve();
    }));

    app.readyHooks.add('addSocketListener:BlackBoxDonViListener', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('fwQABlackBoxDonVi', async (socket) => {
            const user = app.io.getSessionUser(socket);
            if ((!isTtLienHeBeta && user && user.maDonVi && ['70', '71'].includes(user.maDonVi)) || (user && user.permissions && user.permissions.exists(['fwQuestionAnswer:blackBoxManageTest']))) {
                socket.join(`fwBlackboxDonVi:${user.maDonVi}`);
            }
        })
    });

    // Admin Blackbox APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/an-danh/quan-ly/page/:pageNumber/:pageSize', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 1;
            if (req.session.user.maDonVi == null) throw 'Bạn không thuộc đơn vị nào';
            const page = await app.model.fwQuestionAnswer.searchBlackBoxPage(_pageNumber, _pageSize, req.session.user?.maDonVi, app.utils.stringify(filter), searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            for (let i = 0; i < list.length; i++) {
                if (list[i].isBlackBox == 1) {
                    list[i] = { ...list[i], maDoiTuong: null, creatorEmail: null, hoNguoiTao: null, tenNguoiTao: null };
                }
            }
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/an-danh/quan-ly/phu-trach/page/:pageNumber/:pageSize', app.permission.check(staffPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 1;
            const page = await app.model.fwQuestionAnswer.searchPhuTrachPage(_pageNumber, _pageSize, req.session.user.email, app.utils.stringify(filter), searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            for (let i = 0; i < list.length; i++) {
                if (list[i].isBlackBox == 1) list[i] = { ...list[i], maDoiTuong: null, creatorEmail: null, hoNguoiTao: null, tenNguoiTao: null };
            }
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Admin Blackbox có quyền gán hộp thư cho bất kỳ ai
    app.put('/api/tt/lien-he/an-danh/assign-qa-box', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const user = req.session.user;
            const idQa = req.body.id;
            const email = req.body.email;
            if (user.isStaff) {
                let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(idQa)).rows[0];
                if (fwQaItem.emailNguoiPhuTrach) throw 'Đã có người nhận box này';
                if (fwQaItem && fwQaItem.creatorEmail == user.email) throw 'Không được phép nhận phụ trách box do chính mình tạo';

                let { email: emailNguoiPhuTrach, shcc: maNguoiPhuTrach, ho, ten } = await app.model.tchcCanBo.get({ email });
                let fwQANguoiPhuTrach = await app.model.fwQuestionAnswerMember.create({ ho, ten, email: emailNguoiPhuTrach, maQa: idQa, maMember: maNguoiPhuTrach, ngayThamGia: Date.now(), role: 'ANSWERER' });
                await app.model.fwQuestionAnswer.update({ id: idQa }, { isAssigned: 1 });
                fwQaItem = { ...fwQaItem, maNguoiPhuTrach, tenNguoiPhuTrach: ten, hoNguoiPhuTrach: ho, emailNguoiPhuTrach, isAssigned: 1 };
                res.send({ fwQANguoiPhuTrach, fwQaItem });

                assignBlackboxNotifyActivity(fwQaItem, emailNguoiPhuTrach, user);
            } else {
                throw 'Sinh viên không có quyền phân bổ hộp thư Blackbox';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Cán bộ đơn vị 71, 70 có quyền nhận phụ trách trả lời hộp thư
    app.post('/api/tt/lien-he/an-danh/nhan-black-box', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const user = req.session.user;
            const idQa = req.body.id;
            if (user.isStaff) {
                let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(idQa)).rows[0];
                console.log('fwQaItem', fwQaItem);
                if (fwQaItem.emailNguoiPhuTrach) throw 'Đã có người nhận box này';
                if (fwQaItem && fwQaItem.creatorEmail == user.email) throw 'Không được phép nhận phụ trách box do chính mình tạo';

                let fwQANguoiPhuTrach = await app.model.fwQuestionAnswerMember.create({ ho: user.lastName, ten: user.firstName, email: user.email, maQa: idQa, maMember: user.shcc, ngayThamGia: Date.now(), role: 'ANSWERER' });
                await app.model.fwQuestionAnswer.update({ id: idQa }, { isAssigned: 1 });
                fwQaItem = { ...fwQaItem, isAssigned: 1, hoNguoiPhuTrach: null, tenNguoiPhuTrach: null, emailNguoiPhuTrach: null, maNguoiPhuTrach: null };
                res.send({ fwQANguoiPhuTrach, fwQA: fwQaItem });

                acceptBlackboxNotifyActivity(fwQaItem);
            } else {
                throw 'Sinh viên không có quyền phụ trách hộp thư liên hệ';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/an-danh/get-university-staff/:pageNumber/:pageSize', app.permission.check(staffPermission), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'maDonVi = 70 OR maDonVi = 71 AND (lower(shcc) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText OR email LIKE :searchText)',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.tchcCanBo.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const assignBlackboxNotifyActivity = async (fwQaItem, emailNguoiPhuTrach, user) => {
        emitFwBlackboxRefreshUser({ email: fwQaItem.creatorEmail });
        emitFwBlackboxRefreshPhuTrach({ email: emailNguoiPhuTrach });
        emitFwBlackboxRefreshHopThuDen({ maDonVi: fwQaItem.maDonVi });
        emitFwBlackboxRefreshAdmin();

        // Thông báo cho người tạo box
        const title = 'Hộp thư Blackbox đã có cán bộ nhận trả lời', subTitle = `Cán bộ phòng ACSS đã nhận trả lời hộp thư: ${fwQaItem.noiDung.length < 80 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 80) + '...'}.`, pathArguments = `{"id":${fwQaItem.idQa}}`;
        const fwQaNotificationItem = await app.model.fwQuestionAnswerNotification.create({ email: fwQaItem.creatorEmail, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.idQa}`, sendTime: Date.now(), mobilePath: MdTruyenThong.chatBlackboxDetail, mobileArguments: pathArguments });
        if (fwQaNotificationItem.mobileArguments) fwQaNotificationItem.mobileArguments = app.utils.parse(fwQaNotificationItem.mobileArguments);
        emitFwQaBlackboxNotiEvent({ email: fwQaItem.creatorEmail });
        app.firebase.sendToEmails({ listEmail: [fwQaItem.creatorEmail], title, body: subTitle });

        // Thông báo cho cán bộ được phân công hộp thư
        const canBoPhuTrachTitle = 'Bạn được phân công phụ trách 1 hộp thư Blackbox', canBoPhuTrachsubTitle = `${user.lastName} ${user.firstName} (${user.email}) đã phân cho bạn hộp thư: ${fwQaItem.noiDung.length < 80 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 80) + '...'}.`;
        await app.model.fwQuestionAnswerNotification.create({ email: emailNguoiPhuTrach, title: canBoPhuTrachTitle, subTitle: canBoPhuTrachsubTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.idQa}`, sendTime: Date.now(), mobilePath: MdTruyenThong.chatBlackboxDetail, mobileArguments: pathArguments });
        emitFwQaBlackboxNotiEvent({ email: emailNguoiPhuTrach });
        app.firebase.sendToEmails({ listEmail: [emailNguoiPhuTrach], title: canBoPhuTrachTitle, body: canBoPhuTrachsubTitle });
    };

    const acceptBlackboxNotifyActivity = async (fwQaItem) => {
        emitFwBlackboxRefreshUser({ email: fwQaItem.creatorEmail });
        emitFwBlackboxRefreshHopThuDen({ maDonVi: fwQaItem.maDonVi });
        emitFwBlackboxRefreshPhuTrach({ email: fwQaItem.emailNguoiPhuTrach });
        emitFwBlackboxRefreshAdmin();

        // Thông báo cho người tạo
        const title = 'Hộp thư Blackbox của bạn được nhận phụ trách', subTitle = `Cán bộ ACSS đã nhận phụ trách hộp thư: ${fwQaItem.noiDung.length < 100 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 100) + '...'}.`, pathArguments = `{"id":${fwQaItem.id}}`;
        await app.model.fwQuestionAnswerNotification.create({ email: fwQaItem.creatorEmail, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.id}`, sendTime: Date.now(), mobilePath: MdTruyenThong.chatBlackboxDetail, mobileArguments: pathArguments });
        emitFwQaBlackboxNotiEvent({ email: fwQaItem.creatorEmail });
        app.firebase.sendToEmails({ listEmail: [fwQaItem.creatorEmail], title, body: subTitle });
    };
};