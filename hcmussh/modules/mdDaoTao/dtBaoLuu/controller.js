module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7100: {
                title: 'Sinh viên bảo lưu', link: '/user/dao-tao/bao-luu',
                groupIndex: 1, parentKey: 7029,
                icon: 'fa-hourglass-end', backgroundColor: '#CD43F7'
            }
        }
    };
    app.permission.add(
        { name: 'dtBaoLuu:manage', menu },
        { name: 'dtBaoLuu:write' },
        { name: 'dtBaoLuu:delete' },
    );

    app.get('/user/dao-tao/bao-luu', app.permission.check('dtBaoLuu:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtBaoLuu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '80') {
            app.permissionHooks.pushUserPermission(user, 'dtBaoLuu:manage', 'dtBaoLuu:write', 'dtBaoLuu:delete');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/sinh-vien-bao-luu/page/:pageNumber/:pageSize', app.permission.check('dtBaoLuu:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { filter, sortTerm = 'mssv_ASC' } = req.query;
            filter.sortKey = sortTerm.split('_')[0];
            filter.sortMode = sortTerm.split('_')[1];

            let page = await app.model.dtDangKyHocPhan.getSinhVienBaoLuuSearchPage(_pageNumber, _pageSize, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: '', list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};