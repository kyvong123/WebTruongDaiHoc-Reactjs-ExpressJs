module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7104: {
                title: 'Danh sách trưởng bộ môn', groupIndex: 1,
                link: '/user/dao-tao/truong-bo-mon',
            },
        },
    };

    app.permission.add(
        { name: 'dtDmTruongBoMon:manage', menu },
    );

    app.get('/user/dao-tao/truong-bo-mon', app.permission.check('dtDmTruongBoMon:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/truong-bo-mon/all', app.permission.check('dtDmTruongBoMon:manage'), async (req, res) => {
        try {
            const { rows, datauser } = await app.model.dtDmTruongBoMon.searchAll('');
            res.send({ items: rows, dataUser: datauser });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/truong-bo-mon', app.permission.check('dtDmTruongBoMon:manage'), async (req, res) => {
        try {
            const { data } = req.body,
                { allMon, canBo, listMon, maDonVi } = data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            let listExist = await app.model.dtDmTruongBoMon.getAll({ shcc: canBo }, 'maMonHoc');
            listExist = listExist.map(i => i.maMonHoc);

            if (Number(allMon)) {
                let dataMon = await app.model.dmMonHoc.getAll({ khoa: maDonVi });
                await Promise.all(dataMon.filter(i => !listExist.includes(i.ma)).map(mon => app.model.dtDmTruongBoMon.create({ maMonHoc: mon.ma, shcc: canBo, userModified, timeModified })));
            } else {
                await Promise.all(listMon.filter(i => !listExist.includes(i)).map(mon => app.model.dtDmTruongBoMon.create({ maMonHoc: mon, shcc: canBo, userModified, timeModified })));
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/truong-bo-mon/all', app.permission.check('dtDmTruongBoMon:manage'), async (req, res) => {
        try {
            const { shcc } = req.body;

            await app.model.dtDmTruongBoMon.delete({ shcc });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/truong-bo-mon/item', app.permission.check('dtDmTruongBoMon:manage'), async (req, res) => {
        try {
            const { shcc, maMonHoc } = req.body.item;

            await app.model.dtDmTruongBoMon.delete({ shcc, maMonHoc });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
