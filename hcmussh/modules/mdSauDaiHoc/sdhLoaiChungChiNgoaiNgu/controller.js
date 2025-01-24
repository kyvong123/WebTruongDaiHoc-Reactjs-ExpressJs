module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7558: {
                title: 'Loại chứng chỉ ngoại ngữ', link: '/user/sau-dai-hoc/loai-chung-chi-ngoai-ngu', groupIndex: 2, parentKey: 7544
            }
        }
    };


    app.permission.add(
        { name: 'sdhLoaiChungChiNgoaiNgu:read', menu },
        { name: 'sdhLoaiChungChiNgoaiNgu:write' },
        { name: 'sdhLoaiChungChiNgoaiNgu:delete' }
    );
    app.permissionHooks.add('staff', 'addRoleSdhLoaiChungChiNgoaiNgu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLoaiChungChiNgoaiNgu:read', 'sdhLoaiChungChiNgoaiNgu:write', 'sdhLoaiChungChiNgoaiNgu:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/loai-chung-chi-ngoai-ngu', app.permission.check('sdhLoaiChungChiNgoaiNgu:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/loai-ccnn/all', app.permission.check('sdhLoaiChungChiNgoaiNgu:read'), async (req, res) => {
        try {
            let items = await app.model.sdhLoaiChungChiNgoaiNgu.getAll({}, '*', 'TO_NUMBER(MA) ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/sdh/loai-ccnn/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let statement = ['loaiChungChi', 'ngonNgu'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
            statement = '( ' + statement + (' )') + ' AND kichHoat = 1';

            let condition = {
                statement,
                parameter: { searchText: `%${(req.query.searchTerm || '').toLowerCase()}%` },
            };
            const page = await app.model.sdhLoaiChungChiNgoaiNgu.getPage(pageNumber, pageSize, condition, '*', 'TO_NUMBER(MA) ASC');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.get('/api/sdh/loai-ccnn/item/:ma', async (req, res) => {
        try {
            let item = await app.model.sdhLoaiChungChiNgoaiNgu.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/loai-ccnn', app.permission.check('sdhLoaiChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhLoaiChungChiNgoaiNgu.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/loai-ccnn', app.permission.check('sdhLoaiChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhLoaiChungChiNgoaiNgu.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/loai-ccnn', app.permission.check('sdhLoaiChungChiNgoaiNgu:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhLoaiChungChiNgoaiNgu.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/loai-ccnn/get-by-idccnn', app.permission.check('sdhLoaiChungChiNgoaiNgu:read'), async (req, res) => {
        try {
            let { idCcnn } = req.query;
            let ccnn = await app.model.sdhTsNgoaiNgu.get({ idCcnn });
            res.send({ item: ccnn });
        } catch (error) {
            res.send({ error });
        }
    });
};