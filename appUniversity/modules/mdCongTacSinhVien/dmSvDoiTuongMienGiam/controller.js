module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6109: { title: 'Đối tượng miễn giảm', link: '/user/ctsv/doi-tuong-mien-giam', groupIndex: 3, parentKey: 6150 } },
    };
    app.permission.add(
        { name: 'dmDoiTuongMienGiam:read', menu },
        { name: 'dmDoiTuongMienGiam:write' },
        { name: 'dmDoiTuongMienGiam:delete' },
    );

    app.get('/user/ctsv/doi-tuong-mien-giam', app.permission.check('dmDoiTuongMienGiam:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDoiTuongMienGiam', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmDoiTuongMienGiam:read', 'dmDoiTuongMienGiam:write');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/doi-tuong-mien-giam/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        app.model.dmSvDoiTuongMienGiam.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/doi-tuong-mien-giam/all', app.permission.check('dmDoiTuongMienGiam:read'), (req, res) => {
        app.model.dmSvDoiTuongMienGiam.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/doi-tuong-mien-giam/item/:ma', app.permission.check('dmDoiTuongMienGiam:read'), (req, res) => {
        app.model.dmSvDoiTuongMienGiam.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/ctsv/doi-tuong-mien-giam', app.permission.check('dmDoiTuongMienGiam:write'), (req, res) => {
        const newItem = req.body.dmDoiTuongMienGiam;
        app.model.dmSvDoiTuongMienGiam.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Đối tượng miễn giảm ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmSvDoiTuongMienGiam.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/ctsv/doi-tuong-mien-giam', app.permission.check('dmDoiTuongMienGiam:write'), (req, res) => {
        app.model.dmSvDoiTuongMienGiam.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/ctsv/doi-tuong-mien-giam', app.permission.check('dmDoiTuongMienGiam:delete'), (req, res) => {
        app.model.dmSvDoiTuongMienGiam.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};