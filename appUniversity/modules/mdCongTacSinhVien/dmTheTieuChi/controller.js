module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6117: { title: 'Danh mục thẻ tiêu chí', link: '/user/ctsv/danh-muc-the-tieu-chi', groupIndex: 3, parentKey: 6150 } },
    };
    app.permission.add(
        { name: 'dmTheTieuChi:read', menu },
        { name: 'dmTheTieuChi:write' },
        { name: 'dmTheTieuChi:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDanhMucTag', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmTheTieuChi:read', 'dmTheTieuChi:write', 'dmTheTieuChi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/danh-muc-the-tieu-chi', app.permission.check('dmTheTieuChi:read'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/danh-muc-the-tieu-chi/page/:pageNumber/:pageSize', app.permission.check('dmTheTieuChi:read'), async (req, res) => {
        try {
            let pNumber = parseInt(req.params.pageNumber),
                pSize = parseInt(req.params.pageSize),
                { pCondition } = req.query;
            const { pageNumber, pageSize, pageTotal, totalItem, list: page } = await app.model.dmTheTieuChi.getPage(pNumber, pSize, pCondition, (error, page) => res.send({ error, page }));
            res.send({ pageNumber, pageSize, pageTotal, totalItem, page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-muc-the-tieu-chi/get-all', app.permission.check('dmTheTieuChi:read'), async (req, res) => {
        try {
            const { searchTerm = '' } = req.query,
                condition = {
                    statement: 'kichHoat = 1 AND (lower(ten) LIKE :searchTerm or lower(ma) LIKE : searchTerm)',
                    parameter: {
                        searchTerm: `%${searchTerm.toLowerCase().trim()}%`
                    }
                },
                items = await app.model.dmTheTieuChi.getAll(condition);
            res.send({ items });

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-muc-the-tieu-chi/item/', app.permission.check('dmTheTieuChi:read'), async (req, res) => {
        try {
            const { ma } = req.query;
            const item = await app.model.dmTheTieuChi.get({ ma });
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/danh-muc-the-tieu-chi/', app.permission.check('dmTheTieuChi:write'), async (req, res) => {
        try {
            const { ma, ten, ghiChu } = req.body;
            const item = await app.model.dmTheTieuChi.create({ ma, ten, ghiChu, kichHoat: 1 });
            res.send({ response: 'Tạo thẻ tiêu chí thành công', status: 'success', item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/danh-muc-the-tieu-chi/', app.permission.check('dmTheTieuChi:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.dmTheTieuChi.update({ ma }, changes);
            res.send({ response: 'Cập nhật thẻ tiêu chí thành công', status: 'success', item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/danh-muc-the-tieu-chi/', app.permission.check('dmTheTieuChi:delete'), async (req, res) => {
        try {
            const { ma } = req.body;
            const item = await app.model.dmTheTieuChi.delete({ ma });
            res.send({ response: 'Xóa thẻ tiêu chí thành công', status: 'success', item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};