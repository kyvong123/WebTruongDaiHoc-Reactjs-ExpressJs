module.exports = app => {

    app.permission.add(
        'dtSemester:read', 'dtSemester:write', 'dtSemester:delete', 'dtDiemSemester:read', 'dtDiemSemester:write', 'dtDiemSemester:delete'
    );

    app.permissionHooks.add('staff', 'addRoleDtSemester', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtSemester:write', 'dtSemester:read', 'dtDiemSemester:read', 'dtDiemSemester:write', 'dtDiemSemester:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/dt/semester', app.permission.check('user:login'), async (req, res) => {
        try {
            let idSem = req.query.idSem;
            let items = await app.model.dtSemester.getAll({
                statement: ':idSem is null OR ma >= :idSem',
                parameter: { idSem }
            }, '*', 'namHoc DESC, hocKy DESC');
            let listHocKy = await app.model.dtDmHocKy.getAll();
            const data = await Promise.all(items.map(async item => {
                let hocKy = listHocKy.find(hocKy => hocKy.ma == item.hocKy);
                return {
                    ...item,
                    tenHocKy: hocKy.ten
                };
            }));
            res.send({ items: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/school-year', app.permission.check('user:login'), async (req, res) => {
        try {
            let items = await app.model.dtSemester.getAll({}, 'namHoc', 'namHoc DESC');
            items = Object.keys(items.groupBy('namHoc'));
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/school-year/item/:namHoc', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dtSemester.get({ namHoc: req.params.namHoc }, 'namHoc', 'namHoc DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/semester/item/:ma', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dtSemester.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/semester', app.permission.check('dtSemester:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            changes.userModified = req.session.user.email;
            changes.timeModified = Date.now();
            if (changes.active == 1) {
                await app.model.dtSemester.update({
                    statement: 'active = 1',
                    parameter: {}
                }, { active: 0 });
            } else if (changes.active == 0) {
                const item = await app.model.dtSemester.get({ ma });
                if (item.active) return res.send({ error: 'Năm học - học kỳ hiện tại đang được kích hoạt!' });
            }
            if (changes.isPrivate && changes.pass) {
                changes.pass = app.model.dtDiem.hashPassword(changes.pass);
            }

            const item = await app.model.dtSemester.update({ ma }, changes);
            app.dkhpRedis.initConfig();
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/semester', app.permission.check('dtSemester:write'), async (req, res) => {
        try {
            const data = req.body.data;
            data.userModified = req.session.user.email;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            const cur = await app.model.dtSemester.get({ namHoc: data.namHoc, hocKy: data.hocKy });
            if (cur) return res.send({ error: 'Năm học - học kỳ đã tồn tại' });
            if (data.isPrivate && data.pass) {
                data.pass = app.model.dtDiem.hashPassword(data.pass);
            }
            const items = await Promise.all([
                app.model.dtSemester.create({ ...data }),
                app.model.dtDiemSemester.create({ ...data })
            ]);
            res.send({ item: items[0] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/semester/current', app.permission.orCheck('user:login'), async (req, res) => {
        try {
            const item = await app.model.dtSemester.getCurrent();
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};
