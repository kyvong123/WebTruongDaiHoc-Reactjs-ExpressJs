module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4115: { title: 'Loại hồ sơ', link: '/user/danh-muc/loai-ho-so' },
        },
    };

    app.permission.add(
        { name: 'dmLoaiHoSo:read', menu }
    );

    app.permissionHooks.add('staff', 'addRolesDmLoaiHoSo', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '29') {
            app.permissionHooks.pushUserPermission(user, 'dmLoaiHoSo:read', 'dmLoaiHoSo:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/danh-muc/loai-ho-so', app.permission.check('dmLoaiHoSo:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-ho-so/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
            const page = await app.model.dmLoaiHoSo.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/loai-ho-so/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw 'Invalid id';
            }
            const loaiHoSo = await app.model.dmLoaiHoSo.get({ id });
            res.send({ item: loaiHoSo });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/loai-ho-so', app.permission.check('dmLoaiHoSo:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.dmLoaiHoSo.update({ id }, changes);
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/loai-ho-so', app.permission.check('dmLoaiHoSo:write'), async (req, res) => {
        try {
            const data = req.body.item;
            await app.model.dmLoaiHoSo.create(data);
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/loai-ho-so', app.permission.check('dmLoaiHoSo:write'), async (req, res) => {
        try {
            const id = req.body.id;
            await app.model.dmLoaiHoSo.delete({ id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });
};