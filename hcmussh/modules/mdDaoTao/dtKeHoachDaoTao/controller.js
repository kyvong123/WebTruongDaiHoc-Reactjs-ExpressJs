
module.exports = app => {
    app.permission.add(
        { name: 'dtKeHoachDaoTao:manage' },
        { name: 'dtKeHoachDaoTao:write' },
        { name: 'dtKeHoachDaoTao:delete' }
    );
    app.permissionHooks.add('staff', 'addRolesDtKeHoachDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtKeHoachDaoTao:read', 'dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:delete');
            resolve();
        } else resolve();
    }));
    app.get('/user/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtKeHoachDaoTao:read', 'dtKeHoachDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/ke-hoach-dao-tao', app.permission.orCheck('dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:manage'), async (req, res) => {
        try {
            let [items, dataMon] = await Promise.all([
                app.model.dtKeHoachDaoTao.getAll(req.query.condition, '*', 'id ASC'),
                app.model.dtChuongTrinhDaoTao.get(req.query.condition),
            ]);
            res.send({ items, dataMon });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/ke-hoach-dao-tao', app.permission.orCheck('dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:manage'), async (req, res) => {
        try {
            let items = req.body.items || [];
            for (let item of items) {
                await app.model.dtKeHoachDaoTao.create(item);
            }
            let { maMonHoc, maKhungDaoTao } = items[0] || req.body.data;
            await app.model.dtChuongTrinhDaoTao.update({ maMonHoc, maKhungDaoTao }, req.body.data);
            app.model.fwStudent.updateCtdtRedis(maKhungDaoTao);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/ke-hoach-dao-tao', app.permission.orCheck('dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:manage'), async (req, res) => {
        try {
            let { ma, changes } = req.body;
            await app.model.dtKeHoachDaoTao.delete({ maMonHoc: ma, maKhungDaoTao: changes[0].maKhungDaoTao });
            for (let idx = 0; idx < changes.length; idx++) {
                let monHoc = changes[idx];
                delete monHoc.id;
                await app.model.dtKeHoachDaoTao.create(changes[idx]);
            }
            await app.model.dtChuongTrinhDaoTao.update({ maMonHoc: ma, maKhungDaoTao: changes[0].maKhungDaoTao }, req.body.data);
            app.model.fwStudent.updateCtdtRedis(changes[0].maKhungDaoTao);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};