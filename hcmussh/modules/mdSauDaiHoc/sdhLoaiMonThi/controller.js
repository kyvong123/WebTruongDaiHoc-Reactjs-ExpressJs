module.exports = app => {
    //index later
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7534: {
                title: 'Loại môn thi tuyển sinh', link: '/user/sau-dai-hoc/tuyen-sinh/loai-mon-thi', parentKey: 7544, groupIndex: 2
            }
        }
    };


    app.permission.add(
        { name: 'sdhLoaiMonThi:read', menu },
        { name: 'sdhLoaiMonThi:write' },
        { name: 'sdhLoaiMonThi:delete' }
    );
    app.permissionHooks.add('staff', 'addRoleSdhLoaiMonThi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLoaiMonThi:read', 'sdhLoaiMonThi:write', 'sdhLoaiMonThi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/tuyen-sinh/loai-mon-thi', app.permission.check('sdhLoaiMonThi:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/loai-mon-thi/all', app.permission.check('sdhLoaiMonThi:read'), async (req, res) => {
        try {
            let items = await app.model.sdhLoaiMonThi.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/loai-mon-thi/item/:ma', app.permission.check('sdhLoaiMonThi:read'), async (req, res) => {
        try {
            let item = await app.model.sdhLoaiMonThi.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/loai-mon-thi', app.permission.check('sdhLoaiMonThi:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhLoaiMonThi.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/loai-mon-thi', app.permission.check('sdhLoaiMonThi:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhLoaiMonThi.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/loai-mon-thi', app.permission.check('sdhLoaiMonThi:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhLoaiMonThi.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};