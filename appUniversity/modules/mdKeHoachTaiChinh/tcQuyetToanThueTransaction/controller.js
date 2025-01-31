module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5027: { title: 'Quản lý giao dịch quyết toán', link: '/user/finance/quyet-toan-thue/giao-dich', icon: 'fa fa-tasks', color: '#000', groupIndex: 3, backgroundColor: '#FFA07A' } },
    };

    app.permission.add(
        { name: 'tcQuyetToanThueGiaoDich:read', menu },
        { name: 'tcQuyetToanThueGiaoDich:write' },
        { name: 'tcQuyetToanThueGiaoDich:delete' },
        { name: 'tcQuyetToanThueGiaoDich:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcQuyetToanThueGiaoDich', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcQuyetToanThueGiaoDich:read', 'tcQuyetToanThueGiaoDich:write', 'tcQuyetToanThueGiaoDich:delete', 'tcQuyetToanThueGiaoDich:export');
        }
    });

    app.get('/user/finance/quyet-toan-thue/giao-dich', app.permission.check('tcQuyetToanThueGiaoDich:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/quyet-toan-thue/giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcQuyetToanThueGiaoDich:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcTncnQuyetToanThueTransaction.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, JSON.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, totalmoney: totalMoney, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, totalMoney, list }
            });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/quyet-toan-thue/giao-dich/item', app.permission.check('tcQuyetToanThueGiaoDich:read'), async (req, res) => {
        try {
            let { shcc, nam } = req.query;
            const item = await app.model.tcTncnQuyetToanThueDetail.get({ shcc, tinhTrang: 'CHUA_DONG', nam }, '*', 'dot ASC');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/quyet-toan-thue/giao-dich', app.permission.check('tcQuyetToanThueGiaoDich:write'), async (req, res) => {
        try {
            const { shcc, nam, soTien, ghiChu, pttt, thoiGianSoPhu } = req.body;
            const current = await app.model.tcTncnQuyetToanThueDetail.get({ shcc, tinhTrang: 'CHUA_DONG', nam }, '*', 'dot ASC');
            const currentCongNo = await app.model.tcTncnQuyetToanThue.get({ shcc, nam });
            if (!current || !currentCongNo) {
                throw 'Không tìm thấy thông tin quyết toán thuế!';
            }
            if (parseInt(current.soTienThanhToan) < parseInt(soTien)) {
                throw 'Số tiền không hợp lệ!';
            }
            await app.model.tcTncnQuyetToanThueDetail.update({ shcc, nam, dot: current.dot }, { tinhTrang: 'DA_DONG' });
            const updateValue = await app.model.tcTncnQuyetToanThue.update({ shcc, nam }, { congNo: parseInt(currentCongNo.congNo) - parseInt(soTien), ngayUpdate: Date.now() });
            await app.model.tcQuyetToanThueLog.create({
                mscb: shcc, nam, thaoTac: 'U', userId: req.session.user.email,
                duLieuCu: app.utils.stringify(current), duLieuMoi: app.utils.stringify(updateValue), ngayUpdate: Date.now()
            });
            await app.model.tcTncnQuyetToanThueTransaction.create({
                customerId: shcc,
                amount: soTien,
                ghiChu: ghiChu,
                thoiGianSoPhu: thoiGianSoPhu,
                transDate: thoiGianSoPhu,
                serviceId: pttt,
                nam,
                transId: `${shcc}-${thoiGianSoPhu}-${pttt}`
            });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};