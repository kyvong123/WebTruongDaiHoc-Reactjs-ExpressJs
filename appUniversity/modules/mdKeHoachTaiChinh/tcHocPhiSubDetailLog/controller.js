module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5015: { title: 'Lịch sử thay đổi học phần', link: '/user/finance/sub-detail/log', icon: 'fa fa-history', backgroundColor: '#FFEB3B', color: '#000', groupIndex: 0 } },
    };

    app.permission.add(
        { name: 'tcSubDetaiLog:read', menu },
        { name: 'tcSubDetaiLog:write' },
        { name: 'tcSubDetaiLog:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcSubDetailLog', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcSubDetaiLog:read', 'tcSubDetaiLog:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/sub-detail/log', app.permission.check('tcSubDetaiLog:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/sub-detail/log/page/search/:pageNumber/:pageSize', app.permission.check('tcSubDetaiLog:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};

            const filterData = app.utils.stringify(filter);
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcHocPhiSubDetailLog.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter }
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/sub-detail/log/get-sinh-vien', app.permission.check('tcSubDetaiLog:read'), async (req, res) => {
        try {
            const { mssv } = req.query;
            const dataSinhVien = await app.model.tcHocPhiSubDetailLog.getAll({ mssv, sync: 0 }, '*', 'timeModified DESC');
            res.send({ dataSinhVien });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/sync-hoc-phi/preview', app.permission.check('tcSubDetaiLog:read'), async (req, res) => {
        try {
            const filter = req.query?.filter || '';
            let { mssv } = filter;

            let { listSinhVienPreview: listSinhVienAll, listHocPhi } = await app.model.tcDotDong.dongBoHocPhi(null, null, mssv, null, 1);

            res.send({ listSinhVienAll, listHocPhi });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/sync-hoc-phi/ap-dung', app.permission.check('tcSubDetaiLog:write'), async (req, res) => {
        try {
            const data = req.body?.data || '';
            const user = req.session?.user?.email;

            if (!data) {
                throw ('Không thể xem trước danh sách áp dụng!');
            }
            let { mssv } = data;

            let { apDungLength } = await app.model.tcDotDong.dongBoHocPhi(null, null, mssv, user, 1, 1);
            res.send({ length: apDungLength });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};