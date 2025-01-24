module.exports = app => {
    //Trưởng đơn vị
    app.post('/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const item = req.body.item;
            const result = await app.model.tccbDanhGiaCaNhanDiemTru.create(item);
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            const result = await app.model.tccbDanhGiaCaNhanDiemTru.update({ id }, changes);
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const id = req.body.id;
            const result = await app.model.tccbDanhGiaCaNhanDiemTru.delete({ id });
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    //User
    app.post('/api/tccb/danh-gia-ca-nhan-diem-tru-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = req.body.item;
            const result = await app.model.tccbDanhGiaCaNhanDiemTru.create(item);
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-ca-nhan-diem-tru-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.body.id, { caNhanDongY, caNhanLyDo } = req.body.changes;
            const result = await app.model.tccbDanhGiaCaNhanDiemTru.update({ id }, { caNhanDongY, caNhanLyDo });
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });
};