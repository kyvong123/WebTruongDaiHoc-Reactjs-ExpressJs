module.exports = app => {
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7725: { title: 'Lịch sử đăng ký', link: '/user/lich-su-dang-ky' },
            }
        }
    });

    app.get('/user/lich-su-dang-ky', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sv/lich-su-dang-ky/page/:pageNumber/:pageSize', app.permission.orCheck(PERMISSION, 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1], isStu: '1' }));
            let page = await app.model.dtLichSuDkhp.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows } = page;
            const pageCondition = searchTerm;
            const list = rows.filter(i => i.thaoTac != 'U');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });
};
