module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7606: {
                title: 'Biểu mẫu đăng ký', parentKey: 7544, link: '/user/sau-dai-hoc/tuyen-sinh/thong-tin-bieu-mau',
                icon: 'fa-cog', backgroundColor: '#f5b842', groupIndex: 1
            }
        }
    };
    app.permission.add(
        { name: 'sdhTsThongTinBieuMau:manage', menu }, 'sdhTsThongTinBieuMau:write', 'sdhTsThongTinBieuMau:delete'
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/thong-tin-bieu-mau', app.permission.check('sdhTsThongTinBieuMau:manage'), app.templates.admin);

    app.get('/api/sdh/tuyen-sinh/thong-tin-bieu-mau', async (req, res) => {
        try {
            const phanHe = req.query.maPhanHe;
            let item = await app.model.sdhTsThongTinBieuMau.get({ phanHe });
            if (item) {
                res.send({ item });
            }
            else {
                res.send({ error: 'Không tìm thấy thông tin biểu mẫu!' });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/tuyen-sinh/thong-tin-bieu-mau/all', app.permission.check('sdhTsThongTinBieuMau:manage'), async (req, res) => {
        try {
            let [items, phanHe] = await Promise.all([
                app.model.sdhTsThongTinBieuMau.getAll({}, '*', 'phanHe'),
                app.model.dmHocSdh.getAll({})
            ]);
            items = items.map(item => ({ ...item, tenPhanHe: phanHe?.find(_item => _item.ma == item.phanHe)?.ten }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });
    app.put('/api/sdh/tuyen-sinh/thong-tin-bieu-mau', app.permission.check('sdhTsThongTinBieuMau:write'), async (req, res) => {
        try {
            let { phanHe, data } = req.body;
            const item = await app.model.sdhTsThongTinBieuMau.update({ phanHe }, data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/tuyen-sinh/thong-tin-bieu-mau', app.permission.check('sdhTsThongTinBieuMau:write'), async (req, res) => {
        try {
            let { data } = req.body;
            const item = await app.model.sdhTsThongTinBieuMau.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/tuyen-sinh/thong-tin-bieu-mau', app.permission.check('sdhTsThongTinBieuMau:delete'), async (req, res) => {
        try {
            let { phanHe } = req.body;
            await app.model.sdhTsThongTinBieuMau.delete({ phanHe });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};