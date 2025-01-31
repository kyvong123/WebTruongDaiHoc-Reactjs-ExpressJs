module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7616: {
                title: 'Đợt phúc tra', parentKey: 7544, link: '/user/sau-dai-hoc/tuyen-sinh/dot-phuc-tra', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsDotPhucTra:manage', menu },
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/dot-phuc-tra', app.permission.check('sdhTsDotPhucTra:manage'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/ts/dot-phuc-tra/all', app.permission.check('sdhTsDotPhucTra:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsDotPhucTra.getAll({}, '*', 'maDot ASC');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }

    });
    app.get('/api/sdh/ts/dot-phuc-tra/item/:maDot', app.permission.check('sdhTsDotPhucTra:read'), async (req, res) => {
        try {
            let { maDot } = req.params;
            let item = await app.model.sdhTsDotPhucTra.get({ maDot });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.put('/api/sdh/ts/dot-phuc-tra', app.permission.check('sdhTsDotPhucTra:manage'), async (req, res) => {
        try {
            let { data, maDot } = req.body;
            let listMa = await app.model.sdhTsDotPhucTra.getAll({});
            listMa = listMa.filter(item => item.maDot != maDot).find(item => item.maDot == data.maDot);
            if (listMa) throw 'Mã đợt đã tồn tại!';
            const item = await app.model.sdhTsDotPhucTra.update({ maDot }, data);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts/dot-phuc-tra', app.permission.check('sdhTsDotPhucTra:manage'), async (req, res) => {
        try {
            let { data } = req.body;
            let listMa = await app.model.sdhTsDotPhucTra.getAll({});
            listMa = listMa.find(item => item.maDot == data.maDot);
            if (listMa) throw 'Mã đợt đã tồn tại';
            const item = await app.model.sdhTsDotPhucTra.create(data);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/dot-phuc-tra', app.permission.check('sdhTsDotPhucTra:manage'), async (req, res) => {
        try {
            let { maDot } = req.body;
            await app.model.sdhTsDotPhucTra.delete({ maDot });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};