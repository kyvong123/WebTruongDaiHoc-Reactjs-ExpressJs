module.exports = app => {

    app.get('/api/dt/diem/diem-config-dat', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { idSemester, namHoc, hocKy } = req.query.data,
                [diemSemester, configDiemDat] = await Promise.all([
                    app.model.dtDiemSemester.get({ id: idSemester }, 'diemDat'),
                    app.model.dtDiemConfigDiemDat.getAll({ namHoc, hocKy }),
                ]);

            const dataDiemData = await Promise.all(configDiemDat.map(async item => {
                const monHoc = await app.model.dmMonHoc.get({ ma: item.maMonHoc }, 'ten');
                return { ...item, tenMonHoc: monHoc.tenMonHoc };
            }));
            res.send({ diemSemester: diemSemester.diemDat, configDiemDat: dataDiemData });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/semester-config-dat', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { id, diemDat = '' } = req.body;
            await app.model.dtDiemSemester.update({ id }, { diemDat });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/diem-config-dat', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { semester, data } = req.body;
            await app.model.dtDiemConfigDiemDat.create({ ...semester, ...data });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/diem-config-dat', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.dtDiemConfigDiemDat.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem/diem-config-dat', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.dtDiemConfigDiemDat.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};