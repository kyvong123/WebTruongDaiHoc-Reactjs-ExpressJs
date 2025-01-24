module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1080: {
                title: 'Quản lý phân cấp nhân sự', parentKey: 6160,
                link: '/user/khoa/diem-ren-luyen/roles', icon: 'fa-user-circle-o', backgroundColor: '#ac2d34', groupIndex: 0
            }
        }
    };

    app.permission.add(
        { name: 'manager:login', menu },
    );

    app.get('/user/khoa/diem-ren-luyen/roles', app.permission.check('manager:login'), app.templates.admin);

    app.get('/api/tccb/drl-role/all', app.permission.check('manager:login'), async (req, res) => {
        try {
            const { staff: { donViQuanLy: listDonViQuanLy = [] } } = req.session.user; // Lay shcc va listDonViQuanLy
            const sT = req.query.sT || '';
            const filter = req.query.filter || {};
            filter.listDonVi = listDonViQuanLy.map(dv => dv.maDonVi).toString();
            const { rows: items } = await app.model.tccbDrlRole.searchAll(sT, app.utils.stringify(filter));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/drl-role/item', app.permission.check('manager:login'), async (req, res) => {
        try {
            const emailCanBo = req.query.emailCanBo;
            const item = await app.model.tccbDrlRole.get({ emailCanBo });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/drl-role/item', app.permission.check('manager:login'), async (req, res) => {
        try {
            const data = req.body.data;
            const { idCanBo } = data;
            // Gán quyền quản lý drl nếu như chưa có
            const roleCanBo = await app.model.fwAssignRole.get({ nguoiDuocGan: idCanBo, tenRole: 'staff:drl-manage' });
            if (!roleCanBo) {
                await app.model.fwAssignRole.create({
                    nguoiDuocGan: idCanBo,
                    nguoiGan: req.session.user.shcc,
                    tenRole: 'staff:drl-manage',
                    nhomRole: 'ctsvDrl',
                    ngayBatDau: Date.now()
                });
            }
            const item = await app.model.tccbDrlRole.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.put('/api/tccb/drl-role/item', app.permission.check('manager:login'), async (req, res) => {
        try {
            const { emailCanBo, changes } = req.body;
            const item = await app.model.tccbDrlRole.update({ emailCanBo }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/drl-role/item', app.permission.check('manager:login'), async (req, res) => {
        try {
            const { emailCanBo } = req.body,
                { shcc: idCanBo } = await app.model.tchcCanBo.get({ email: emailCanBo });

            await Promise.all([
                app.model.tccbDrlRole.delete({ emailCanBo }),
                app.model.fwAssignRole.delete({ nguoiDuocGan: idCanBo, tenRole: 'staff:drl-manage' })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};