module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7602: {
                title: 'Hình thức tuyển sinh', parentKey: 7544, link: '/user/sau-dai-hoc/tuyen-sinh/hinh-thuc-tuyen-sinh', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'sdhHinhThucTuyenSinh:write', menu },
        { name: 'sdhHinhThucTuyenSinh:read' },
        { name: 'sdhHinhThucTuyenSinh:delete' }
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/hinh-thuc-tuyen-sinh', app.permission.check('sdhHinhThucTuyenSinh:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/hinh-thuc-tuyen-sinh/all', app.permission.orCheck('sdhHinhThucTuyenSinh:read', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { searchTerm = '' } = req.query;
            let items = await app.model.sdhTsHinhThuc.getAll({}, '*', 'ma');
            res.send({ items, searchTerm });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/hinh-thuc-tuyen-sinh/item/:ma', app.permission.check('sdhHinhThucTuyenSinh:read'), async (req, res) => {
        try {
            let item = await app.model.sdhTsHinhThuc.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/hinh-thuc/all', app.permission.orCheck('sdhDsTs:read', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { idPhanHe } = req.query;
            let data = await app.model.sdhTsHinhThuc.getByIdPhanHe(idPhanHe);
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/hinh-thuc/item/:ma', app.permission.orCheck('sdhDsTs:read', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let item = await app.model.sdhTsHinhThuc.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/hinh-thuc-tuyen-sinh', app.permission.check('sdhHinhThucTuyenSinh:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhTsHinhThuc.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/hinh-thuc-tuyen-sinh', app.permission.check('sdhHinhThucTuyenSinh:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhTsHinhThuc.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/hinh-thuc-tuyen-sinh', app.permission.check('sdhHinhThucTuyenSinh:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            const listId = await app.model.sdhTsInfoHinhThuc.getAll({ maHinhThuc: ma });
            await Promise.all[
                app.model.sdhTsInfoHinhThuc.delete({ maHinhThuc: ma }),
                app.model.sdhTsHinhThuc.delete({ ma }),
                app.model.sdhTsInfoToHopThi.delete({
                    statement: 'idHinhThuc IN (:listId)',
                    parameter: { listId }
                })
            ];
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};