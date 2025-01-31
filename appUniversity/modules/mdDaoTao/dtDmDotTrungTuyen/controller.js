module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7040: {
                title: 'Đợt trúng tuyển', groupIndex: 2,
                link: '/user/dao-tao/dot-trung-tuyen', parentKey: 7027
            },
        }
    };

    app.permission.add(
        { name: 'dtDmDotTrungTuyen:manage', menu },
        { name: 'dtDmDotTrungTuyen:write' },
        { name: 'dtDmDotTrungTuyen:delete' }
    );


    app.permissionHooks.add('staff', 'addRolesDtDmDotTrungTuyen', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmDotTrungTuyen:manage', 'dtDmDotTrungTuyen:write', 'dtDmDotTrungTuyen:delete');
            resolve();
        }
        else resolve();
    }));


    app.get('/user/dao-tao/dot-trung-tuyen', app.permission.check('dtDmDotTrungTuyen:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/dot-trung-tuyen/all', app.permission.check('dtDmDotTrungTuyen:manage'), async (req, res) => {
        try {
            let condition = req.query.condition || { kichHoat: 1 };

            let items = await app.model.dtDmDotTrungTuyen.getAll(condition, '*', 'ma asc');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dot-trung-tuyen', app.permission.check('dtDmDotTrungTuyen:write'), async (req, res) => {
        try {
            let { item } = req.body,
                user = req.session.user,
                data = {
                    ma: item.ma,
                    ten: item.ten,
                    modifier: user.email,
                    timeModified: Date.now(),
                    kichHoat: 1
                },
                listDot = await app.model.dtDmDotTrungTuyen.getAll();
            if (listDot.length) {
                for (let dot of listDot) {
                    if (dot.ma == item.ma) throw 'Mã đợt trúng tuyển bị trùng!';
                }
            }
            await app.model.dtDmDotTrungTuyen.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/dot-trung-tuyen', app.permission.check('dtDmDotTrungTuyen:delete'), (req, res) => {
        app.model.dtDmDotTrungTuyen.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.put('/api/dt/dot-trung-tuyen', app.permission.check('dtDmDotTrungTuyen:write'), async (req, res) => {
        let { ma, changes } = req.body,
            { loaiHinhDaoTao, khoaSinhVien } = changes,
            dot = await app.model.dtDmDotTrungTuyen.getAll({ loaiHinhDaoTao, khoaSinhVien });
        if (dot.length > 0) {
            changes.ma = `${changes.ma}-${dot.length + 1}`;
        }
        app.model.dtDmDotTrungTuyen.update({ ma }, changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dt/dot-trung-tuyen/item/:ma', app.permission.check('dtDmDotTrungTuyen:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDmDotTrungTuyen.get({ ma: req.params.ma }, '*', 'ma asc');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};