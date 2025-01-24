module.exports = app => {
    app.get('/api/ctsv/shcd/noi-dung/all', app.permission.orCheck('ctsvShcd:read', 'student:shcd-manage'), async (req, res) => {
        try {
            const { shcdId } = req.query;
            const items = await app.model.svShcdNoiDung.getAll({ shcdId });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/noi-dung/item', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const { id } = req.query;
            const item = await app.model.svShcdNoiDung.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/noi-dung', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svShcdNoiDung.update({ id }, changes);
            parseInt(changes.isSubmit) && await app.model.svShcdNoiDungHdt.delete({ noiDungId: id });
            await Promise.all([
                app.model.svShcdNoiDung.update({ id }, changes),
                ...((changes.heDaoTao.split(',') || []).map(item => item && app.model.svShcdNoiDungHdt.create({ noiDungId: id, heDaoTao: item })))
            ]);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/shcd/noi-dung', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const noiDung = await app.model.svShcdNoiDung.create(data);
            data.heDaoTao ? await Promise.all(data.heDaoTao.split(',').map(item => item && app.model.svShcdNoiDungHdt.create({ noiDungId: noiDung.id, heDaoTao: item }))) : null;
            res.send({ item: noiDung });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/shcd/noi-dung', app.permission.check('ctsvShcd:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            await Promise.all([
                app.model.svShcdNoiDung.delete({ id }),
                app.model.svShcdNoiDungHdt.delete({ noiDungId: id }),
                app.model.svShcdLich.deleteCascade({ noiDungId: id }),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};