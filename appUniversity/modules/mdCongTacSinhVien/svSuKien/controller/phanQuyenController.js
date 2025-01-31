module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6189: { title: 'Phân quyền', parentKey: 6156, icon: 'fa-users', link: '/user/ctsv/phan-quyen-su-kien', backgroundColor: '#fcba03', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvSuKien:phanQuyen', menu: menuCtsv },
    );

    app.get('/api/ctsv/phan-quyen-duyet-su-kien/page', app.permission.check('ctsvSuKien:phanQuyen'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, pageCondition, filter = {} } = req.query;
            const _page = await app.model.svSuKienQuyenDuyet.suKienQuyenDuyetSearchPage(parseInt(_pageNumber), parseInt(_pageSize), pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/phan-quyen-duyet-su-kien', app.permission.check('ctsvSuKien:phanQuyen'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svSuKienQuyenDuyet.create(data);
            res.send(item);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/phan-quyen-duyet-su-kien/delete', app.permission.check('ctsvSuKien:phanQuyen'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svSuKienQuyenDuyet.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};