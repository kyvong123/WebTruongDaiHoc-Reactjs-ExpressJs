
module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7613: {
                title: 'Quản lý kỷ luật',
                link: '/user/sau-dai-hoc/tuyen-sinh/ky-luat',
                parentKey: 7544,
                icon: 'fa-warning',
                backgroundColor: '#F7C04A'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsKyLuat:manage', menu },
        'sdhTsKyLuat:read',
        'sdhTsKyLuat:write',
        'sdhTsKyLuat:delete',
    );


    app.get('/user/sau-dai-hoc/tuyen-sinh/ky-luat', app.permission.orCheck('sdhTsKyLuat:manage', 'sdhTsKyLuat:write', 'sdhTsKyLuat:read', 'sdhTsKyLuat:delete'), app.templates.admin);

    //------API--------------s

    app.get('/api/sdh/ts/ky-luat/page/:pageNumber/:pageSize', app.permission.check('sdhTsKyLuat:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let { filter } = req.query;
            const sort = filter && filter.sort ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.kyLuatSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/ts/ky-luat', app.permission.check('sdhTsKyLuat:write'), async (req, res) => {
        try {
            const { id, data } = req.body;
            let changes = {};
            if (data.type == 'vang') changes = { vang: data.value };
            else if (data.type == 'kyLuat') changes = { kyLuat: data.value };
            else changes = { ghiChu: data.value };
            await app.model.sdhTsInfoCaThiThiSinh.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.get('/api/sdh/ts/ky-luat/items', app.permission.check('sdhTsKyLuat:read'), async (req, res) => {
        try {
            let items = await app.model.sdhTsDmKyLuat.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ky-luat/item/:ma', app.permission.check('sdhTsKyLuat:read'), async (req, res) => {
        try {
            const item = await app.model.sdhTsDmKyLuat.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};

