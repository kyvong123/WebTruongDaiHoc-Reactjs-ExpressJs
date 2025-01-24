module.exports = app => {
    const menu = { parentMenu: { index: 8000, title: 'Đăng ký phúc khảo', icon: 'fa-envira', link: '/user/sdh/ts/thi-sinh/phuc-khao' } };
    app.permission.add(
        { name: 'sdhTsThiSinh:login', menu },
    );

    app.get('/user/sdh/ts/thi-sinh/phuc-khao', app.permission.check('sdhTsThiSinh:login'), app.templates.admin);

    app.get('/api/sdh/ts/thi-sinh/phuc-khao/info', app.permission.check('sdhTsThiSinh:login'), async (req, res) => {
        try {
            const now = Date.now();
            const item = await app.model.sdhTsDotPhucTra.get(
                {
                    statement: 'startDate <= :now AND :now <= endDate',
                    parameter: { now }
                }
            );
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts/thi-sinh/don-phuc-khao', app.permission.check('sdhTsThiSinh:login'), async (req, res) => {
        try {
            const { idDotPhucTra, idThiSinh, tinhTrang, listMon } = req.body.data;
            for (let i of listMon) {
                const data = {
                    idDotPhucTra,
                    idThiSinh,
                    idCaThi: i.id,
                    tinhTrang,
                    timeModified: Date.now(),
                    maMonThi: i.maMonThi,
                    diemCu: i.diem
                };
                await Promise.all([app.model.sdhTsDonPhucTra.create(data), app.model.sdhTsInfoCaThiThiSinh.update({ id: i.id }, { phucTra: 1 })]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/thi-sinh/phuc-khao/info/:id', app.permission.check('sdhTsThiSinh:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const result = await app.model.sdhTsDonPhucTra.getByThiSinh(id);
            res.send({ items: result.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/thi-sinh/phuc-khao/info', app.permission.check('sdhTsThiSinh:login'), async (req, res) => {
        try {
            const { id, idCaThi } = req.body.data;
            await Promise.all([app.model.sdhTsDonPhucTra.delete({ id }), app.model.sdhTsInfoCaThiThiSinh.update({ id: idCaThi }, { phucTra: 0 })]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};