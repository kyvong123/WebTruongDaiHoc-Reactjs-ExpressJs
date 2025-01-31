module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/diem-tru/all', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const result = await app.model.tccbDiemTru.searchAll(condition.nam || null);
            res.send({ items: result.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/diem-tru/:nam', app.permission.check('staff:login'), (req, res) => {
        const nam = parseInt(req.params.nam);
        app.model.tccbDiemTru.getAll({ nam }, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/diem-tru/item/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.tccbDiemTru.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/diem-tru', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const checkDiemTru = await app.model.tccbDiemTru.get({ nam: newItem.nam, ma: newItem.ma });
            if (checkDiemTru) {
                res.send({ error: 'Hạng mục điểm trừ này đã có!' });
            } else {
                const item = await app.model.tccbDiemTru.create(newItem);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/diem-tru', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            const currentDiemTru = await app.model.tccbDiemTru.get({ id });
            if (!currentDiemTru) {
                return res.send({ error: 'Mã không hợp lệ!' });
            }

            if (changes.ma && changes.ma != currentDiemTru.ma) { // Nếu đổi mã điểm trừ
                const checkDiemTru = await app.model.tccbDiemTru.get({ ma: changes.ma, nam: currentDiemTru.nam });
                if (checkDiemTru) {
                    return res.send({ error: 'Hạng mục điểm trừ này đã có!' });
                }
            }

            const item = await app.model.tccbDiemTru.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia/diem-tru', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDiemTru.delete({ id: req.body.id }, error => res.send({ error }));
    });
};