module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            438: { title: 'Danh bạ cán bộ', link: '/user/vpdt/danh-ba', icon: 'fa-envelope-o', backgroundColor: '#00aa00' },
        },
    };

    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthDanhBa:read', menu }, 'hcthDanhBa:write', 'hcthDanhBa:delete');

    app.get('/user/vpdt/danh-ba', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), app.templates.admin);
    app.get('/user/vpdt/danh-ba/:ma', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), app.templates.admin);

    /**
     * CRUD DANH_BA, DANH_BA_ITEM API
     */
    app.get('/api/hcth/vpdt/danh-ba/user/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            if (!sessionShcc) {
                throw new Error('Vui lòng đăng nhập tài khoản cán bộ!');
            }
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.hcthDanhBa.searchDanhBaUserPage(sessionShcc, _pageNumber, _pageSize, filter, searchTerm);
            list = await Promise.all(list.map(async (item) => {
                const danhBaItems = await app.model.hcthDanhBaItem.getAll({ maDanhBa: item.ma });
                const danhBaItemShccs = danhBaItems.map(item => item.shcc);
                return { ...item, danhBaItemShccs };
            }));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/public/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.hcthDanhBa.searchDanhBaPublicPage(_pageNumber, _pageSize, filter, searchTerm);
            list = await Promise.all(list.map(async (item) => {
                const danhBaItems = await app.model.hcthDanhBaItem.getAll({ maDanhBa: item.ma });
                const danhBaItemShccs = danhBaItems.map(item => item.shcc);
                return { ...item, danhBaItemShccs };
            }));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.hcthDanhBa.searchDanhBaPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/select-adapter/all', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const danhBaList = await app.model.hcthDanhBa.getAll({
                statement: 'KICH_HOAT = 1 AND (OWNER_SHCC = :shcc OR IS_PUBLIC = 1) AND TRIM(LOWER(TEN)) LIKE lower(\'%\'|| :searchTerm ||\'%\')',
                parameter: { shcc: sessionShcc, searchTerm: searchTerm.trim() }
            });
            res.send({ items: danhBaList });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/:maDanhBa', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const { maDanhBa } = parseInt(req.params.maDanhBa);
            const danhBa = await app.model.hcthDanhBa.get({ ma: maDanhBa });
            res.send({ item: danhBa });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/detail/:maDanhBa/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const maDanhBa = parseInt(req.params.maDanhBa);
            const filter = app.utils.stringify(req.query.filter || {});
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.hcthDanhBaItem.hcthDanhBaItemSearchPage(maDanhBa, _pageNumber, _pageSize, filter, searchTerm);
            const danhBaInfo = await app.model.hcthDanhBa.get({ ma: maDanhBa });
            const danhBaOwner = await app.model.tchcCanBo.get({ shcc: danhBaInfo.ownerShcc });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list, danhBaInfo, danhBaOwner } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.get('/api/hcth/vpdt/danh-ba/detail/:maDanhBa/all',  app.permission.orCheck('staff:login', 'hcthDanhBa:read'), async (req, res) => {
        try {
            const maDanhBa = parseInt(req.params.maDanhBa);
            const items = await app.model.hcthDanhBaItem.getAll({maDanhBa}, 'shcc');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.post('/api/hcth/vpdt/danh-ba', app.permission.orCheck('staff:login', 'hcthDanhBa:write'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            if (!sessionShcc) {
                throw new Error('Vui lòng đăng nhập tài khoản cán bộ!');
            }
            const { data } = req.body;
            const danhBaTrungTen = await app.model.hcthDanhBa.get({
                statement: 'TRIM(LOWER(OWNER_SHCC)) = :shcc AND TRIM(LOWER(TEN)) = :ten',
                parameter: {
                    shcc: sessionShcc.trim().toLowerCase(),
                    ten: data.ten.trim().toLowerCase()
                }
            });
            if (danhBaTrungTen) {
                throw new Error('Bạn đã có một danh bạ khác trùng tên, vui lòng sử dụng tên khác');
            }
            const item = await app.model.hcthDanhBa.create({ ...data, ownerShcc: sessionShcc });
            let { canBoList } = data;
            canBoList = canBoList || [];
            for (let shcc of canBoList) {
                await app.model.hcthDanhBaItem.create({ maDanhBa: item.ma, shcc });
            }
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.put('/api/hcth/vpdt/danh-ba', app.permission.orCheck('staff:login', 'hcthDanhBa:write'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            let { changes, ma } = req.body;
            changes = app.utils.parse(changes);
            const updatingDanhBa = await app.model.hcthDanhBa.get({ ma });
            if (sessionShcc != updatingDanhBa.ownerShcc) {
                throw new Error('Bạn không được quyền chỉnh sửa danh bạ này!');
            }
            const { canBoList: newShccList } = changes;
            if (Array.isArray(newShccList)) {
                const oldShccList = (await app.model.hcthDanhBaItem.getAll({ maDanhBa: ma }, 'shcc')).map(item => item.shcc);
                const addShccList = newShccList.difference(oldShccList);
                const removeShccList = oldShccList.difference(newShccList);

                for (const shcc of addShccList) {
                    await app.model.hcthDanhBaItem.create({ maDanhBa: ma, shcc });
                }
                for (const shcc of removeShccList) {
                    await app.model.hcthDanhBaItem.delete({ maDanhBa: ma, shcc });
                }
            }
            const updatedDanhBa = await app.model.hcthDanhBa.update({ ma }, changes);
            res.send({ item: updatedDanhBa });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.delete('/api/hcth/vpdt/danh-ba', app.permission.orCheck('staff:login', 'hcthDanhBa:delete'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            const { ma } = req.body;
            const updatingDanhBa = await app.model.hcthDanhBa.get({ ma });
            if (sessionShcc != updatingDanhBa.ownerShcc) {
                throw new Error('Bạn không được quyền chỉnh sửa danh bạ này!');
            }
            await app.model.hcthDanhBaItem.delete({ maDanhBa: ma });
            await app.model.hcthDanhBa.delete({ ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });

    app.delete('/api/hcth/vpdt/danh-ba-item', app.permission.orCheck('staff:login', 'hcthDanhBa:delete'), async (req, res) => {
        try {
            const { shcc: sessionShcc } = req.session.user?.staff || {};
            const { maDanhBa, shcc } = req.body;
            const updatingDanhBa = await app.model.hcthDanhBa.get({ ma: maDanhBa });
            if (sessionShcc != updatingDanhBa.ownerShcc) {
                throw new Error('Bạn không được quyền chỉnh sửa danh bạ này!');
            }
            await app.model.hcthDanhBaItem.delete({ maDanhBa, shcc });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error: error.message });
        }
    });
};