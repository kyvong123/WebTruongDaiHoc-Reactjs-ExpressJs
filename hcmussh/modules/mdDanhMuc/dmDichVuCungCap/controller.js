module.exports = app => {
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            4106: { title: 'Dịch vụ sinh viên', link: '/user/dao-tao/dich-vu-cung-cap', groupIndex: 2, icon: 'fa fa-graduation-cap' },
        },
    };
    app.permission.add(
        { name: 'dmDichVuCungCap:read', menu: menuDaoTao },
        { name: 'dmDichVuCungCap:write' },
        { name: 'dmDichVuCungCap:delete' },
    );
    app.get('/user/dao-tao/dich-vu-cung-cap', app.permission.check('dmDichVuCungCap:read'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/danh-muc/dich-vu-cung-cap/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            let kichHoat = req.query.kichHoat;

            condition = {
                statement: '(:kichHoat IS NULL OR kichHoat=\'\' OR kichHoat=:kichHoat) AND lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition?.toLowerCase() || ''}%`, kichHoat: kichHoat },
            };
            let page = await app.model.dmDichVuCungCap.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/dich-vu-cung-cap/item/:ma', app.permission.check('dmDichVuCungCap:read'), async (req, res) => {
        try {
            let item = await app.model.dmDichVuCungCap.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/dich-vu-cung-cap', app.permission.check('dmDichVuCungCap:write'), async (req, res) => {
        try {
            const newItem = req.body.data;
            let have = await app.model.dmDichVuCungCap.get({ ma: newItem.ma });
            if (have) {
                res.send({ error: { exist: true, message: 'Mã ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else {
                let item = await app.model.dmDichVuCungCap.create(newItem);
                res.send({ item });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/dich-vu-cung-cap', app.permission.check('dmDichVuCungCap:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            let item = await app.model.dmDichVuCungCap.update({ ma: req.body.ma }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/dich-vu-cung-cap', app.permission.check('dmDichVuCungCap:delete'), async (req, res) => {
        try {
            let item = await app.model.dmDichVuCungCap.delete({ ma: req.body.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};