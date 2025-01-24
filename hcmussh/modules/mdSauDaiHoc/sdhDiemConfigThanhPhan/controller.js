module.exports = app => {
    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/config-thanh-phan/semester', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            let semester = req.query || {},
                { namHoc, hocKy } = semester;
            let items = await app.model.sdhDiemConfigThanhPhan.getAll({ namHoc, hocKy }, '*', '');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-config/thanh-phan/all', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            let semester = req.query.semester,
                { namHoc, hocKy } = semester;
            let [items, loaiDiem] = await Promise.all([
                app.model.sdhDiemConfigThanhPhan.getAll({ namHoc, hocKy }, '*', 'namHoc DESC, hocKy DESC'),
                app.model.sdhDmLoaiDiem.getAll({}),
            ]);
            items = items.map(item => {
                let diem = loaiDiem.find(i => i.ma == item.ma);
                return { ...item, loaiDiem: diem ? diem.ten : '' };
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-config/thanh-phan/item', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            let item = await app.model.sdhDiemConfigThanhPhan.update({ id }, { ...changes, modifier, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/diem-config/thanh-phan', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            await app.model.sdhDiemConfigThanhPhan.create({ ...data, modifier, timeModified });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/diem-config/thanh-phan', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.sdhDiemConfigThanhPhan.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};