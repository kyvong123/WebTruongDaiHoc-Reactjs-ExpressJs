module.exports = (app) => {

    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4119: { title: 'Nhóm đơn vị', link: '/user/category/nhom-don-vi' },
        },
    };
    app.permission.add({ name: 'staff:login', menu }, { name: 'dmNhomDonVi:read', menu }, 'dmNhomDonVi:write', 'dmNhomDonVi:delete');


    app.permissionHooks.add('staff', 'addRolesDmNhomDonVi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '29') {
            app.permissionHooks.pushUserPermission(user, 'dmNhomDonVi:write', 'dmNhomDonVi:read', 'dmNhomDonVi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/category/nhom-don-vi', app.permission.orCheck('staff:login', 'dmNhomDonVi:read'), app.templates.admin);
    app.get('/api/danh-muc/nhom-don-vi/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'dmNhomDonVi:read'), async (req, res) => {
        try {
            const page = await app.model.dmNhomDonVi.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), '{}', req.query.condition || '');
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: req.query.condition || '', list }
            });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send(error);
        }
    });


    app.post('/api/danh-muc/nhom-don-vi', app.permission.check('dmNhomDonVi:write'), async (req, res) => {
        try {
            const { donVi, ten } = req.body.data;
            const item = await app.model.dmNhomDonVi.create({ ten });
            if (donVi && donVi.length)
                item.donVi = await Promise.all(donVi.map(maDonVi => app.model.dmNhomDonViItem.create({ idNhom: item.id, maDonVi })));
            else
                item.donVi = [];
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/nhom-don-vi', app.permission.check('dmNhomDonVi:write'), async (req, res) => {
        try {
            const { donVi, ten, kichHoat } = req.body.changes;
            const { id } = req.body;
            const item = await app.model.dmNhomDonVi.update({ id }, { ten, kichHoat });
            if (donVi && donVi.length) {
                await app.model.dmNhomDonViItem.delete({ idNhom: id });
                item.donVi = await Promise.all(donVi.map(maDonVi => app.model.dmNhomDonViItem.create({ idNhom: item.id, maDonVi })));
            }
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/nhom-don-vi/kich-hoat', app.permission.check('dmNhomDonVi:write'), async (req, res) => {
        try {
            const { id, kichHoat } = req.body;
            const item = await app.model.dmNhomDonVi.update({ id }, { kichHoat });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/nhom-don-vi', app.permission.check('dmNhomDonVi:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            await app.model.dmNhomDonVi.delete({ id });
            await app.model.dmNhomDonViItem.delete({ idNhom: id });
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send(error);
        }
    });

    app.delete('/api/danh-muc/nhom-don-vi/item', app.permission.check('dmNhomDonVi:delete'), async (req, res) => {
        try {
            const { id, maDonVi } = req.body;
            await app.model.dmNhomDonViItem.delete({ idNhom: id, maDonVi });
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send(error);
        }
    });

    app.get('/api/danh-muc/nhom-don-vi/item/:id', app.permission.orCheck('dmNhomDonVi:read', 'staff:login'), async (req, res) => {
        try {
            const { id } = req.params;
            const item = await app.model.dmNhomDonVi.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send(error);
        }
    });
};