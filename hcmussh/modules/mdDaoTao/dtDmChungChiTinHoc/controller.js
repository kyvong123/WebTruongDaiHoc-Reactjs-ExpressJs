module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7078: {
                title: 'Chứng chỉ khác', link: '/user/dao-tao/chung-chi-khac',
                groupIndex: 2, parentKey: 7068
            }
        }
    };
    app.permission.add(
        { name: 'dtDmChungChiTinHoc:manage', menu },
        { name: 'dtDmChungChiTinHoc:write' },
        { name: 'dtDmChungChiTinHoc:delete' }
    );

    app.get('/user/dao-tao/chung-chi-khac', app.permission.check('dtDmChungChiTinHoc:manage'), app.templates.admin);
    // app.get('/user/dao-tao/chung-chi-khac/detail/:id', app.permission.check('dtDmChungChiTinHoc:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/chung-chi-tin-hoc/all', app.permission.check('dtDmChungChiTinHoc:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDmChungChiTinHoc.getAll({}, '*', 'loaiChungChi,ma');
            for (let item of items) {
                let loaiChungChi = await app.model.dtDmLoaiChungChi.get({ ma: item.loaiChungChi }, 'ten');
                item.tenLoaiChungChi = loaiChungChi ? loaiChungChi.ten : '';
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-tin-hoc', app.permission.orCheck('dtDmChungChiTinHoc:manage', 'student:login', 'dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDmChungChiTinHoc.getAll(req.query, '*', 'loaiChungChi,ma');
            for (let item of items) {
                let loaiChungChi = await app.model.dtDmLoaiChungChi.get({ ma: item.loaiChungChi }, 'ten');
                item.tenLoaiChungChi = loaiChungChi ? loaiChungChi.ten : '';
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-tin-hoc/item/:ma', app.permission.check('dtDmChungChiTinHoc:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDmChungChiTinHoc.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-tin-hoc', app.permission.check('dtDmChungChiTinHoc:write'), async (req, res) => {
        try {
            let { item } = req.body,
                data = await app.model.dtDmChungChiTinHoc.get({ ma: item.ma });
            if (data) throw 'Mã chứng chỉ tin học đã tồn tại!';
            else await app.model.dtDmChungChiTinHoc.create(item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-tin-hoc', app.permission.check('dtDmChungChiTinHoc:write'), async (req, res) => {
        try {
            await app.model.dtDmChungChiTinHoc.update({ ma: req.body.ma }, req.body.changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/chung-chi-tin-hoc', app.permission.check('dtDmChungChiTinHoc:delete'), async (req, res) => {
        try {
            await app.model.dtDmChungChiTinHoc.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};