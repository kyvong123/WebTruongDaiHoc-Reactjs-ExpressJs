module.exports = app => {
    app.post('/api/ctsv/quan-ly-lop/ban-can-su', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { changes } = req.body;
            let item = await app.model.svQuanLyLop.createBanCanSu(changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/quan-ly-lop/ban-can-su', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            let item = await app.model.svQuanLyLop.update({ id }, changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/quan-ly-lop/ban-can-su', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, userId } = req.body;

            await app.model.svQuanLyLop.delete({ id });
            // await app.dkhpRedis.deleteBanCanSuLop({ userId, maLop, maChucVu });
            await app.dkhpRedis.syncWithDb(userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};