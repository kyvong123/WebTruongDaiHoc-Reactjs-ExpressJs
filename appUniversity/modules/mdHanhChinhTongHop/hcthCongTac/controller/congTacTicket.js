module.exports = app => {

    const { getUserAvailableDepartments, trangThaiCongTacItemDict, trangThaiCongTacTicketDict, staffRequestNotification, userApproveOrDeclineRegisterNotification, getEmailFromShcc } = require('../tools')(app);
    const { CongTacTicketPermission } = require('../permissionClasses')(app);

    app.post('/api/hcth/cong-tac/ticket', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const shcc = req.session.user?.staff?.shcc;
            const thoiGian = Date.now();
            const chainItem = await app.model.hcthChainItem.createCongTacTicket({ ...data, shcc }, shcc, thoiGian);
            const item = await app.model.hcthCongTacTicket.create({ ...data, id: chainItem.id, nguoiTao: shcc, thoiGian, trangThai: trangThaiCongTacTicketDict.KHOI_TAO.id });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/ticket', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.hcthCongTacTicket.getItem(id);
            if (!new CongTacTicketPermission(item, req.session.user).isEditable()) {
                throw 'Permission denied';
            }
            await app.model.hcthCongTacTicket.update({ id: item.id }, changes);
            res.send({});
        } catch (error) {
            app.consolError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/ticket/status', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, trangThai } = req.body;
            const item = await app.model.hcthCongTacTicket.getItem(id);
            //TODO: check valid permission
            if (trangThai == trangThaiCongTacTicketDict.DA_GUI.id) {
                if (item.congTacItems.find(i => i.trangThai != 'TU_CHOI' && i.phongHopTicketId && i.trangThaiPhongHopTicket != 'DA_DUYET')) {
                    throw 'Bạn có công tác đăng ký phòng họp không hợp lệ';
                }
                const donVi = await app.model.dmDonVi.get({ ma: item.donVi });
                const emails = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff('29', 'hcthCongTac:manage', Date.now()).then(({ rows: items }) => items.map(i => i.email));
                staffRequestNotification(item, `${req.session.user.lastName} ${req.session.user.firstName}`.normalizedName(), donVi.ten, emails);
                await app.model.hcthCongTacTicket.update({ id: item.id }, { trangThai });
                await app.model.hcthCongTacItem.update({ congTacTicketId: item.id }, { trangThai: trangThaiCongTacItemDict.DANG_KY.id });
            }

            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/ticket/add', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const ticket = await app.model.hcthCongTacTicket.getItem(req.body.ticketId);
            if (!new CongTacTicketPermission(ticket, req.session.user).isEditable()) {
                throw 'Permission denied';
            }
            const filterData = { isOrphan: 1, isCreator: 1, batDau: Number(ticket.batDau) || null, ketThuc: Number(ticket.ketThuc) || null, userShcc: req.session.user?.staff?.shcc };
            const page = await app.model.hcthCongTacItem.searchPage(1, 1000, app.utils.stringify(filterData), '');
            const list = req.body.list;
            if (list.difference(page.rows, (a, b) => a == b.id).length) {
                throw 'Bạn có sư kiện không hợp lệ để thêm vào phiếu';
            }
            await app.model.hcthCongTacItem.update({
                statement: 'id in (:idList)',
                parameter: { idList: list }
            }, { congTacTicketId: ticket.id, trangThai: trangThaiCongTacItemDict.KHOI_TAO.id });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/ticket', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacTicket.getItem(req.body.id);
            if (!new CongTacTicketPermission(item, req.session.user).isDeletable()) {
                throw 'Permission denied';
            }
            await app.model.hcthCongTacTicket.deleteItem(item.id);
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/ticket/:id', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacTicket.getItem(req.params.id);
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-tac/ticket/items/:id', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacTicket.getItem(req.params.id);
            res.send({ items: item.congTacItems });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/cong-tac/ticket/censor', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            let item = await app.model.hcthCongTacTicket.getItem(req.body.id);
            const { approve, decline, lyDo } = req.body;
            if (item.trangThai != 'DA_GUI') {
                throw 'Lịch họp không hợp lệ';
            } else if (Number(approve)) {
                item = await app.model.hcthCongTacTicket.update({ id: item.id }, { trangThai: 'DA_NHAN' });
            } else if (Number(decline)) {
                item = await app.model.hcthCongTacTicket.update({ id: item.id }, { trangThai: 'TU_CHOI' });
            } else {
                throw 'Thông số không hợp lệ';
            }
            userApproveOrDeclineRegisterNotification(item, `${req.session.user.lastName} ${req.session.user.firstName}`.normalizedName(), item.trangThai, await getEmailFromShcc([item.nguoiTao]), lyDo);
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-tac/ticket/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthCongTac:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            let filterData = req.query.filter || {};
            filterData = { ...filterData, batDau: Number(filterData.batDau) || null, ketThuc: Number(filterData.ketThuc) || null };
            const pageCondition = req.query.condition;
            const page = await app.model.hcthCongTacTicket.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/ticket/user/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            let filterData = req.query.filter || {};
            filterData = { ...filterData, batDau: Number(filterData.batDau) || null, ketThuc: Number(filterData.ketThuc) || null, userDepartments: getUserAvailableDepartments(req.session?.user), userShcc: req.session.user?.staff?.shcc };
            const pageCondition = req.query.condition;
            if (!filterData.userDepartments.length) {
                return res.send({ page: { totalItem: 0, pageSize: _pageSize, pageTotal: 0, pageNumber: _pageNumber, pageCondition, list: [] } });
            }
            const page = await app.model.hcthCongTacTicket.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });



};