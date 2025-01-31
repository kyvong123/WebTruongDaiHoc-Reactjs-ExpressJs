module.exports = app => {

    app.permission.add(
        'dtCauHinhDiem:read', 'dtCauHinhDiem:write', 'dtCauHinhDiem:delete'
    );

    app.permissionHooks.add('staff', 'addRoleDtCauHinhDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCauHinhDiem:write', 'dtCauHinhDiem:read');
            resolve();
        } else resolve();
    }));

    // APIs -------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/cau-hinh-diem/all', app.permission.orCheck('dtCauHinhDiem:read', 'staff:login'), async (req, res) => {
        try {
            let items = await app.model.dtCauHinhDiem.getAll(), result = {};
            items.forEach(item => {
                result[item.key] = item.value;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-diem/keys', app.permission.check('dtCauHinhDiem:read'), async (req, res) => {
        try {
            const { keys } = req.query;
            let result = await app.model.dtCauHinhDiem.getValue(keys);
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/cau-hinh-diem', app.permission.check('dtCauHinhDiem:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            await app.model.dtCauHinhDiem.setValue(changes);
            await app.dkhpRedis.initConfig();
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });


};