module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/danh-gia/diem-thuong/all', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const result = await app.model.tccbDiemThuong.searchAll(condition.nam || null);
            res.send({ items: result.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/diem-thuong/:nam', app.permission.check('staff:login'), async (req, res) => {
        try {
            const nam = parseInt(req.params.nam);
            const result = await app.model.tccbDiemThuong.searchAll(nam);
            res.send({ items: result.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/diem-thuong/item/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const item = await app.model.tccbDiemThuong.get(isNaN(id) ? { ma: id } : { id });
            if (item) {
                const dmKhenThuong = await app.model.dmKhenThuongKyHieu.get({ ma: item.ma });
                item.tenKhenThuong = dmKhenThuong ? dmKhenThuong.ten : '';
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/diem-thuong', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const checkDiemThuong = await app.model.tccbDiemThuong.get({ nam: newItem.nam, ma: newItem.ma });
            if (checkDiemThuong) {
                res.send({ error: 'Hạng mục điểm thưởng này đã có!' });
            } else {
                const item = await app.model.tccbDiemThuong.create(newItem);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/diem-thuong', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            const currentDiemThuong = await app.model.tccbDiemThuong.get({ id });
            if (!currentDiemThuong) {
                return res.send({ error: 'Mã không hợp lệ!' });
            }

            if (changes.ma && changes.ma != currentDiemThuong.ma) { // Nếu đổi mã điểm thưởng
                const checkDiemThuong = await app.model.tccbDiemThuong.get({ ma: changes.ma, nam: currentDiemThuong.nam });
                if (checkDiemThuong) {
                    return res.send({ error: 'Hạng mục điểm thưởng này đã có!' });
                }
            }
            const item = await app.model.tccbDiemThuong.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia/diem-thuong', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDiemThuong.delete({ id: req.body.id }, error => res.send({ error }));
    });
};