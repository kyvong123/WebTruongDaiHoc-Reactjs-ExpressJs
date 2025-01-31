module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4013: { title: 'Chương trình đào tạo', link: '/user/category/chuong-trinh-dao-tao' },
        },
    };
    app.permission.add(
        { name: 'dmChuongTrinhDaoTao:read', menu },
        { name: 'dmChuongTrinhDaoTao:write' },
        { name: 'dmChuongTrinhDaoTao:delete' },
    );
    app.get('/user/category/chuong-trinh-dao-tao', app.permission.check('dmChuongTrinhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmChuongTrinhDaoTao.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/chuong-trinh-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmChuongTrinhDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/chuong-trinh-dao-tao/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.dmChuongTrinhDaoTao.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/chuong-trinh-dao-tao', app.permission.check('dmChuongTrinhDaoTao:write'), (req, res) => {
        app.model.dmChuongTrinhDaoTao.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chuong-trinh-dao-tao', app.permission.check('dmChuongTrinhDaoTao:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmChuongTrinhDaoTao.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chuong-trinh-dao-tao', app.permission.check('dmChuongTrinhDaoTao:delete'), (req, res) => {
        app.model.dmChuongTrinhDaoTao.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};