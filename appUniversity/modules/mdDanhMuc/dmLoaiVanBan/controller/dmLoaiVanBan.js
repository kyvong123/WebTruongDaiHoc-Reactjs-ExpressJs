module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4085: { title: 'Loại văn bản', link: '/user/category/loai-van-ban' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiVanBan:read', menu },
        { name: 'dmLoaiVanBan:write' },
        { name: 'dmLoaiVanBan:delete' },
        { name: 'dmLoaiVanBan:upload' },
    );

    //app.get('/user/category/don-vi/upload', app.permission.check('dmLoaiVanBan:write'), app.templates.admin);
    app.get('/user/category/loai-van-ban', app.permission.check('dmLoaiVanBan:read'), app.templates.admin);
    app.get('/user/category/loai-van-ban/nhom', app.permission.check('dmLoaiVanBan:read'), app.templates.admin);
    app.get('/user/category/loai-van-ban/nhom/:ma', app.permission.check('dmLoaiVanBan:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-van-ban/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ten']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiVanBan.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/loai-van-ban/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiVanBan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-van-ban/item/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            let item;
            if (Number(req.params.id))
                item = await app.model.dmLoaiVanBan.get({ id: req.params.id });
            else {
                item = await app.model.dmLoaiVanBan.get({ ma: req.params.id });
            }
            res.send({ item });
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/loai-van-ban', app.permission.check('dmLoaiVanBan:write'), async (req, res) => {
        try {

            let data = req.body.item;
            let postData = {
                ten: data.ten,
                tenVietTat: data.tenVietTat,
                kichHoat: data.kichHoat,
                ma: data.ma
            };
            const item = await app.model.dmLoaiVanBan.create(postData);
            const nhomList = await app.model.dmNhomLoaiVanBan.getAll();
            await Promise.all(nhomList.map((nhom) => {
                return app.model.dmNhomLoaiVanBanItem.create({ maNhom: nhom.ma, nhomOrdinal: 1, maLoaiVanBan: item.ma });
            }));
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/loai-van-ban', app.permission.check('dmLoaiVanBan:write'), (req, res) => {
        const { ten, tenVietTat, kichHoat, nhom } = req.body.changes;
        let putData = {
            kichHoat: parseInt(kichHoat),
            nhom
        };
        if (ten) putData.ten = ten;
        if (tenVietTat) putData.tenVietTat = tenVietTat;

        app.model.dmLoaiVanBan.update({ id: req.body.id }, putData, (error, items) => {
            res.send({ error, items });
        });
    });

    app.delete('/api/danh-muc/loai-van-ban', app.permission.check('dmLoaiVanBan:delete'), (req, res) => {
        app.model.dmLoaiVanBan.delete({ id: req.body.id }, error => res.send({ error }));
    });
};
