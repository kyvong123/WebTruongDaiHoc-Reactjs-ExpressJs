module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6110: { title: 'Nơi nhận form đăng ký', link: '/user/ctsv/noi-nhan-form', groupIndex: 3, parentKey: 6150 } },
    };
    app.permission.add(
        { name: 'dmNoiNhanForm:read', menu },
        { name: 'dmNoiNhanForm:write' },
        { name: 'dmNoiNhanForm:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleNoiNhanForm', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmNoiNhanForm:read', 'dmNoiNhanForm:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/noi-nhan-form', app.permission.check('dmNoiNhanForm:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dm-noi-nhan-form/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        app.model.svDmNoiNhanForm.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/dm-noi-nhan-form/all', app.permission.check('dmNoiNhanForm:read'), (req, res) => {
        app.model.svDmNoiNhanForm.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/dm-noi-nhan-form/item/:id', app.permission.check('dmNoiNhanForm:read'), (req, res) => {
        app.model.svDmNoiNhanForm.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/ctsv/dm-noi-nhan-form', app.permission.check('dmNoiNhanForm:write'), (req, res) => {
        const newItem = req.body.dmNoiNhanForm;
        app.model.svDmNoiNhanForm.get({ id: newItem.id }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Nơi nhận kết quả ' + newItem.id.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.svDmNoiNhanForm.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/ctsv/dm-noi-nhan-form', app.permission.check('dmNoiNhanForm:write'), (req, res) => {
        app.model.svDmNoiNhanForm.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/ctsv/dm-noi-nhan-form/delete', app.permission.check('dmNoiNhanForm:delete'), (req, res) => {
        app.model.svDmNoiNhanForm.delete({ id: req.body.id }, error => res.send({ error }));
    });
};