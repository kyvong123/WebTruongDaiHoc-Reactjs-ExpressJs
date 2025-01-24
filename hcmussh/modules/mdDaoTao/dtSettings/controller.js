module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7024: { title: 'Cấu hình', pin: true, link: '/user/dao-tao/settings', icon: 'fa-sliders', backgroundColor: '#274d5a' },
        },
    };

    app.permission.add(
        { name: 'dtSettings:manage', menu },
        { name: 'dtSettings:admin', menu },
        'dtSettings:write'
    );

    app.get('/user/dao-tao/settings', app.permission.orCheck('dtSettings:manage', 'dtSettings:admin'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDtSettings', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtSettings:manage', 'dtSettings:write');
            resolve();
        } else resolve();
    }));

    // APIs -------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/settings/all', app.permission.check('dtSettings:manage'), async (req, res) => {
        try {
            let items = await app.model.dtSettings.getAll(), result = {};
            items.forEach(item => {
                result[item.key] = item.value;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/settings/keys', app.permission.check('dtSettings:manage'), async (req, res) => {
        try {
            const { keys } = req.query;
            let result = await app.model.dtSettings.getValue(keys);
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/settings/schedule-settings', app.permission.orCheck('dtSettings:manage', 'staff:login'), async (req, res) => {
        try {
            const listKey = ['tkbSoLopMin', 'tkbSoLopMax', 'tkbSoTietBuoiMin', 'tkbSoTietBuoiMax', 'tkbSoBuoiTuanMin', 'tkbSoBuoiTuanMax', 'tkbSoLuongDuKienMin', 'tkbSoLuongDuKienMax'];
            let [result, dataThu, currentSemester] = await Promise.all([
                app.model.dtSettings.getValue(...listKey),
                app.model.dtDmThu.getAll({ kichHoat: 1 }, 'ma,ten', 'ma ASC'),
                app.model.dtSemester.getCurrent()
            ]);
            Object.keys(result).forEach(key => {
                result[key] = result[key] ? parseInt(result[key]) : 0;
            });
            result = app.clone(result, { dataThu, currentSemester });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/settings', app.permission.check('dtSettings:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            await app.model.dtSettings.setValue(changes);
            await app.dkhpRedis.initConfig();
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/settings/email', app.permission.orCheck('staff:login', 'staff:teacher'), async (req, res) => {
        try {
            const { keys } = req.query,
                items = await app.model.tcSetting.getValue(...keys);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });
};