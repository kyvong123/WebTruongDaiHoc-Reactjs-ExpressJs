module.exports = app => {
    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/config-quy-che/semester', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            let semester = req.query || {},
                { namHoc, hocKy } = semester;
            let items = await app.model.sdhDiemConfigQuyChe.getAll({ namHoc: namHoc, hocKy: hocKy }, '*', '');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-config/quy-che/all', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            let semester = req.query.semester,
                { hocKy, namHoc } = semester;

            let [items, diemDacBiet] = await Promise.all([
                app.model.sdhDiemConfigQuyChe.getAll({ hocKy, namHoc }, '*', 'namHoc DESC, hocKy DESC'),
                app.model.sdhDiemDacBiet.getAll({ kichHoat: 1 }),
            ]);
            items = items.map(item => {
                let diem = diemDacBiet.find(i => i.ma == item.ma);
                return { ...item, moTa: diem ? diem.moTa : '', tinhTongKet: diem ? diem.tinhTongKet : '' };
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });
    app.put('/api/sdh/diem-config/quy-che/item', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            let item = await app.model.sdhDiemConfigQuyChe.update({ id }, { ...changes, modifier, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/diem-config/quy-che', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { semester, data } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            await app.model.sdhDiemConfigQuyChe.create({ ...data, modifier, timeModified, hocKy: semester.hocKy, namHoc: semester.namHoc });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/diem-config/quy-che', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.sdhDiemConfigQuyChe.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


};

