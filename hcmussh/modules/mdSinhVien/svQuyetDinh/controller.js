module.exports = app => {
    const PERMISSION = app.isDebug ? 'student:login' : 'student:test';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.congTacSinhVien,
            menus: {
                7820: { title: 'Lịch sử quyết định', link: '/user/lich-su-quyet-dinh' },
            }
        }
    });

    app.get('/user/lich-su-quyet-dinh', app.permission.check(PERMISSION), app.templates.admin);

    // API ------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sv/manage-quyet-dinh/page/:pageNumber/:pageSize', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = req.session.user.email ? req.session.user.email : '';
            const page = await app.model.svManageQuyetDinh.searchPage(_pageNumber, _pageSize, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sv/danh-sach-khen-thuong/page/:pageNumber/:pageSize', app.permission.orCheck(PERMISSION), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = req.session.user.mssv ? req.session.user.mssv : '',
                filter = req.query.filter;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.svKhenThuongDanhSach.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });
};


