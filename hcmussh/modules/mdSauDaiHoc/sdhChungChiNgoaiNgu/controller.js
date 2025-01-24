module.exports = app => {
    app.permission.add(
        { name: 'sdhChungChiNgoaiNgu:read' },
        { name: 'sdhChungChiNgoaiNgu:write' },
        { name: 'sdhChungChiNgoaiNgu:delete' }
    );
    app.permissionHooks.add('staff', 'addRoleSdhChungChiNgoaiNgu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhChungChiNgoaiNgu:read', 'sdhChungChiNgoaiNgu:write', 'sdhChungChiNgoaiNgu:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/chung-chi-ngoai-ngu', app.permission.check('sdhChungChiNgoaiNgu:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/ccnn/all', app.permission.check('sdhChungChiNgoaiNgu:read'), async (req, res) => {
        try {
            let items = await app.model.sdhChungChiNgoaiNgu.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/ccnn/item/:ma', app.permission.check('sdhChungChiNgoaiNgu:read'), async (req, res) => {
        try {
            let item = await app.model.sdhChungChiNgoaiNgu.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/ccnn', app.permission.check('sdhChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhChungChiNgoaiNgu.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/ccnn', app.permission.check('sdhChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhChungChiNgoaiNgu.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ccnn', app.permission.check('sdhChungChiNgoaiNgu:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhChungChiNgoaiNgu.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};