module.exports = app => {
    app.get('/user/dao-tao/diem-config/diem-thanh-phan', app.permission.check('dtDiemConfig:read'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/diem-config/diem-thanh-phan', app.permission.orCheck('dtDiemConfig:read', 'staff:login'), async (req, res) => {
        try {
            let filter = req.query.filter,
                { namHoc, hocKy } = filter;
            let [items, loaiDiem] = await Promise.all([
                app.model.dtDiemConfigThanhPhan.getAll({ namHoc, hocKy }, '*', 'namHoc DESC, hocKy DESC'),
                app.model.dtDiemDmLoaiDiem.getAll({}),
            ]);
            items = items.map(item => {
                let diem = loaiDiem.find(i => i.ma == item.ma);
                return { ...item, loaiDiem: diem ? diem.ten : '', priority: diem?.priority };
            });
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/dt/diem-config/diem-thanh-phan', app.permission.orCheck('dtDiemConfig:write', 'staff:teacher'), async (req, res) => {
        try {
            const { semester, data = [] } = req.body;
            let { idSemester, namHoc, hocKy } = semester;

            await app.model.dtDiemConfigThanhPhan.delete({ idSemester });

            for (let item of data) {
                item.loaiLamTron = item.loaiLamTron || '0.5';
                await app.model.dtDiemConfigThanhPhan.create({ ...item, namHoc, hocKy, idSemester });
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/dt/diem-config/diem-thanh-phan/item', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let userModified = req.session.user.email, timeModified = Date.now();
            const item = await app.model.dtDiemConfigThanhPhan.update({ id }, { ...changes, userModified, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-config/diem-thanh-phan', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { semester, data } = req.body;
            let { idSemester, namHoc, hocKy } = semester;
            let userModified = req.session.user.email, timeModified = Date.now();
            await app.model.dtDiemConfigThanhPhan.create({ ...data, namHoc, hocKy, idSemester, userModified, timeModified });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-config/diem-thanh-phan/item', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDiemConfigThanhPhan.delete({ id });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-config/thanh-phan-diem/filter', app.permission.orCheck('dtDiemConfig:read', 'staff:login', 'staff:teacher'), async (req, res) => {
        try {
            let { ma, filter } = req.query,
                { namHoc, hocKy } = filter,
                condition = { namHoc, hocKy };
            if (ma) condition.ma = ma;
            let [items, loaiDiem] = await Promise.all([
                app.model.dtDiemConfigThanhPhan.getAll(condition, 'ma, phanTramMacDinh, phanTramMin, phanTramMax, loaiLamTron', 'phanTramMacDinh'),
                app.model.dtDiemDmLoaiDiem.getAll({}, 'ma, ten'),
            ]);

            items = items.map(item => {
                let tp = loaiDiem.find(i => i.ma == item.ma);
                return { ...item, ten: tp.ten };
            });
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};