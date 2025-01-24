module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6138: { title: 'Danh mục cấu hình kỷ luật', link: '/user/ctsv/dm-cau-hinh-ky-luat', parentKey: 6140, icon: 'fa-cog', backgroundColor: '#1d9c72' } },
    };
    app.permission.add(
        { name: 'dmCauHinhKyLuat:read', menu },
        { name: 'dmCauHinhKyLuat:write' },
        { name: 'dmCauHinhKyLuat:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDmCauHinhKyLuat', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmCauHinhKyLuat:read', 'dmCauHinhKyLuat:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/dm-cau-hinh-ky-luat', app.permission.check('dmCauHinhKyLuat:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dm-cau-hinh-ky-luat/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const page = await app.model.svDmQtKyLuatCauHinh.getPage(pageNumber, pageSize, condition, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/ctsv/dm-cau-hinh-ky-luat/all', app.permission.check('dmCauHinhKyLuat:read'), async (req, res) => {
        try {
            const items = await app.model.svDmQtKyLuatCauHinh.getAll({ kichHoat: 1 }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-cau-hinh-ky-luat/item/:id', app.permission.check('dmCauHinhKyLuat:read'), async (req, res) => {
        try {
            const item = await app.model.svDmQtKyLuatCauHinh.get({ id: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-cau-hinh-ky-luat/ds-dieu-kien', app.permission.check('dmCauHinhKyLuat:read'), async (req, res) => {
        try {
            const { id } = req.query;
            let dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: id }, '*', 'thuTu ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });
            dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            res.send({ dsDieuKien });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-cau-hinh-ky-luat', app.permission.check('dmCauHinhKyLuat:write'), async (req, res) => {
        try {
            const newItem = req.body.dmCauHinhKyLuat;
            const { dsDieuKien } = newItem;
            const item = await app.model.svDmQtKyLuatCauHinh.create(newItem);
            if (item) {
                await Promise.all(
                    dsDieuKien.map((dk, thuTu) => {
                        delete dk.id;
                        return app.model.svQtKyLuatDieuKien.create({ ...dk, cauHinhId: item.id, thuTu });
                    })
                );
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-cau-hinh-ky-luat', app.permission.check('dmCauHinhKyLuat:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svDmQtKyLuatCauHinh.update({ id }, changes);
            const { dsDieuKien } = changes;
            if (item) {
                await app.model.svQtKyLuatDieuKien.delete({ cauHinhId: id });
                await Promise.all(
                    dsDieuKien.map((dk, thuTu) => {
                        delete dk.id;
                        return app.model.svQtKyLuatDieuKien.create({ ...dk, cauHinhId: item.id, thuTu });
                    })
                );
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-cau-hinh-ky-luat/delete', app.permission.check('dmCauHinhKyLuat:delete'), async (req, res) => {
        try {
            await app.model.svDmQtKyLuatCauHinh.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};