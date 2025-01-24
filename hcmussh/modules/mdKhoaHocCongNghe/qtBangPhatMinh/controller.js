module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9503: { title: 'Bằng phát minh', link: '/user/khcn/qua-trinh/bang-phat-minh', icon: 'fa fa-cogs', color: '#000000', backgroundColor: '#FFE47A' },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1005: { title: 'Bằng phát minh', link: '/user/bang-phat-minh', icon: 'fa fa-cogs', backgroundColor: '#FFE47A', color: '#000000', groupIndex: 7 },
        },
    };

    const menuTCCB = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3014: { title: 'Bằng phát minh', link: '/user/tccb/qua-trinh/bang-phat-minh', icon: 'fa fa-cogs', backgroundColor: '#FFE47A', color: '#000000', groupIndex: 7 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBangPhatMinh:readOnly', menu: menuTCCB },
        { name: 'qtBangPhatMinh:read', menu },
        { name: 'qtBangPhatMinh:write' },
        { name: 'qtBangPhatMinh:delete' },
    );
    app.get('/user/tccb/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:readOnly'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bang-phat-minh/group/:shcc', app.permission.check('qtBangPhatMinh:readOnly'), app.templates.admin);
    app.get('/user/khcn/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:read'), app.templates.admin);
    app.get('/user/khcn/qua-trinh/bang-phat-minh/group/:shcc', app.permission.check('qtBangPhatMinh:read'), app.templates.admin);
    app.get('/user/bang-phat-minh', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.get('/api/khcn/user/qua-trinh/bang-phat-minh/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.qtBangPhatMinh.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    ///END USER ACTIONS
    app.get('/api/khcn/qua-trinh/bang-phat-minh/page/:pageNumber/:pageSize', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.qtBangPhatMinh.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khcn/qua-trinh/bang-phat-minh/group/page/:pageNumber/:pageSize', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.qtBangPhatMinh.groupPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khcn/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), async (req, res) => {
        try {
            let item = await app.model.qtBangPhatMinh.create(req.body.data);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Bằng phát minh');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khcn/qua-trinh/bang-phat-minh/create-multiple', app.permission.check('qtBangPhatMinh:write'), async (req, res) => {
        try {
            const { listShcc, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = req.body.data;
            const solve = async (index = 0) => {
                if (index == listShcc.length) {
                    app.tccbSaveCRUD(req.session.user.email, 'C', 'Bằng phát minh');
                    res.end();
                    return;
                }
                const shcc = listShcc[index];
                const dataAdd = {
                    shcc, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang
                };
                await app.model.qtBangPhatMinh.create(dataAdd);
                solve(index + 1);
            };
            solve();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/khcn/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), async (req, res) => {
        try {
            let item = await app.model.qtBangPhatMinh.update({ id: req.body.id }, req.body.changes);
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Bằng phát minh');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/khcn/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), async (req, res) => {
        try {
            await app.model.qtBangPhatMinh.delete({ id: req.body.id });
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Bằng phát minh');
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};