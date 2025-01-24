module.exports = app => {
    app.get('/api/sdh/ts-info/phan-he/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoPhanHe.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phan-he/:idDot', async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoPhanHe.getData(req.params.idDot);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phan-he/item/:id', app.permission.orCheck('sdhTsInfoTime:manage', 'sdhTsThongKe:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            let item = await app.model.sdhTsInfoPhanHe.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/phan-he', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { maPhanHe, idDot } = req.body.data;
            const item = await app.model.sdhTsInfoPhanHe.get({ maPhanHe, idDot }),
                idPhanHe = item.id;
            let listNganh = await app.model.sdhTsInfoNganh.getAll({ idPhanHe }), listNganhId = listNganh.map(item => item.id);
            idPhanHe && await Promise.all([
                app.model.sdhTsInfoPhanHe.delete({ maPhanHe, idDot }),
                app.model.sdhTsInfoHinhThuc.delete({ idPhanHe }),
                app.model.sdhTsInfoNganh.delete({ idPhanHe }),
                app.model.sdhTsInfoToHopThi.delete({ idPhanHe }),
                listNganhId.length ? app.model.sdhTsInfoMonThi.delete({
                    statement: 'idNganh IN (:listNganh)',
                    parameter: { listNganh: listNganhId }
                }) : null,
            ]);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/phan-he', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let data = req.body.data;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            data.isOpen = 1;//default=1
            const { maInfoTs, maPhanHe, idDot } = data;
            const stored = await app.model.sdhTsInfoPhanHe.get({ maInfoTs, maPhanHe, idDot });
            if (!stored) {
                let item = await app.model.sdhTsInfoPhanHe.create(data);
                res.send({ item });
            } else {
                throw 'Lỗi thao tác, phân hệ đã được lưu, vui lòng kiểm tra lại!';
            }

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/phan-he', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { data, changes } = req.body;
            changes.modifier = req.session.user.email;
            changes.timeModified = Date.now();
            let updated = await app.model.sdhTsInfoPhanHe.update(data, { ...changes, isOpen: Number(changes.isOpen) });
            res.send({ item: updated });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/phan-he/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const { idDot, searchTerm } = req.query;
            let data = await app.model.sdhTsInfoPhanHe.getByIdDot(idDot, searchTerm);
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/phan-he/is-open', app.permission.check('user:login'), async (req, res) => {
        try {
            const { idDot, searchTerm } = req.query;
            let [ts, dm] = await Promise.all([
                app.model.sdhTsInfoPhanHe.getAll({ idDot, isOpen: 1 }),
                app.model.dmHocSdh.getAll({})
            ]);
            for (const phanHe of ts) {
                if (dm.find(item => item.ma == phanHe.maPhanHe))
                    phanHe.tenPhanHe = dm.find(item => item.ma == phanHe.maPhanHe).ten;
            }
            ts = ts.filter(item => (searchTerm && item.tenPhanHe.toLowerCase().includes(searchTerm.toLowerCase()) || (!searchTerm && item)));
            const items = ts.sort((a, b) => a.maPhanHe < b.maPhanHe ? -1 : 1);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/phan-he/register', app.permission.check('user:login'), async (req, res) => {
        try {
            const { idDot, email, searchTerm } = req.query;
            let [ts, dm, listThiSinh] = await Promise.all([
                app.model.sdhTsInfoPhanHe.getAll({ idDot, isOpen: 1 }),
                app.model.dmHocSdh.getAll({}),
                app.model.sdhTsThongTinCoBan.getAll({ email, idDot })
            ]);
            const listPhanHe = listThiSinh.length ? listThiSinh.map(item => item.phanHe) : [];

            for (const phanHe of ts) {
                if (dm.find(item => item.ma == phanHe.maPhanHe))
                    phanHe.tenPhanHe = dm.find(item => item.ma == phanHe.maPhanHe).ten;
            }
            ts = ts.filter(item => !listPhanHe.includes(item.maPhanHe));
            ts = ts.filter(item => (searchTerm && item.tenPhanHe.toLowerCase().includes(searchTerm.toLowerCase()) || (!searchTerm && item)));
            const items = ts;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-info/phan-he-all-detail', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoPhanHe.searchAll(null, '');
            res.send({ items: items && items.rows ? items.rows : '' });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/phan-he/item/:ma', app.permission.orCheck('user:login'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let item = await app.model.dmHocSdh.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-info/phan-he/detail/:id', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            let item = await app.model.sdhTsInfoPhanHe.searchAll(id, '');
            res.send({ item: item && item.rows ? item.rows[0] : '' });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};