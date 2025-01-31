module.exports = app => {
    app.get('/user/dao-tao/diem-config/diem-quy-che', app.permission.check('dtDiemConfigQuyChe:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/diem-config/diem-quy-che', app.permission.check('dtDiemConfig:read'), async (req, res) => {
        try {
            let filter = req.query.filter,
                { idSemester } = filter;

            let [items, diemDacBiet] = await Promise.all([
                app.model.dtDiemConfigQuyChe.getAll({ idSemester }, '*', 'namHoc DESC, hocKy DESC'),
                app.model.dtDiemDacBiet.getAll({ kichHoat: 1 }),
            ]);
            items = items.map(item => {
                let diem = diemDacBiet.find(i => i.ma == item.ma);
                return { ...item, moTa: diem ? diem.moTa : '' };
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-config/diem-quy-che', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { semester, data = [] } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            let { idSemester, namHoc, hocKy } = semester;

            let isExist = await app.model.dtDiemConfigQuyChe.get({ namHoc, hocKy, ma: data.ma });
            if (isExist) {
                throw `Mã ${data.ma} đã tồn tại!`;
            } else {
                await app.model.dtDiemConfigQuyChe.create({ modifier, timeModified, ...data, namHoc, hocKy, idSemester });
            }

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem-config/diem-quy-che/item', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let modifier = req.session.user.email, timeModified = Date.now();
            const item = await app.model.dtDiemConfigQuyChe.update({ id }, { ...changes, modifier, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-config/diem-quy-che/item', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDiemConfigQuyChe.delete({ id });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};