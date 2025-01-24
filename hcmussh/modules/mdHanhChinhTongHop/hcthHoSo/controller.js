module.exports = app => {
    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            506: { title: 'Hồ sơ', link: '/user/hcth/ho-so', icon: 'fa-file-text', backgroundColor: '#0B86AA' },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            408: { title: 'Hồ sơ', link: '/user/ho-so', icon: 'fa-file-text', backgroundColor: '#0B86AA' },
        },
    };

    app.permission.add({ name: 'staff:login', menu: menu });
    app.permission.add({ name: 'hcth:login', menu: hcthMenu }, 'hcthHoSo:read', 'hcthHoSo:write', 'hcthHoSo:delete');

    app.permissionHooks.add('staff', 'addRolesHcthHoSo', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '29') {
            app.permissionHooks.pushUserPermission(user, 'hcthHoSo:read', 'hcthHoSo:write', 'hcthHoSo:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/ho-so', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/ho-so', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/ho-so/:id', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/ho-so/:id', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/ho-so/leaf', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/ho-so/leaf', app.permission.check('staff:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/hcth/ho-so/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthHoSo:read'), async (req, res) => {
        try {
            const pageNumber1 = parseInt(req.params.pageNumber),
                pageSize1 = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = app.utils.parse(req.query.filter, { parentOnly: 1 });

            const page = await app.model.hcthHoSo.searchPage(pageNumber1, pageSize1, app.utils.stringify(filter), searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ho-so/leaf/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthHoSo:read'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = app.utils.stringify(req.query.filter);

            const page = await app.model.hcthHoSo.leafSearchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), searchTerm, filter);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, fatheritem: fatherItem } = page;

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, fatherItem } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/ho-so', app.permission.orCheck('staff:login', 'hcthHoSo:write'), async (req, res) => {
        try {
            const { tieuDe, idFather, loaiHoSo } = req.body.data;

            await app.model.hcthHoSo.create({
                nguoiTao: req.session.user?.shcc,
                tieuDe: tieuDe,
                ngayTao: new Date().getTime(),
                loaiHoSo,
                cha: idFather
            });

            res.send({ error: null });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ho-so/:id', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const hoSo = await app.model.hcthHoSo.get({ id });
            if (!hoSo) throw 'Hồ sơ không tồn tại';
            const vanBan = await app.model.hcthLienKet.getAllFrom(id, 'HO_SO', null, null);
            res.send({
                item: {
                    ...hoSo,
                    vanBan: vanBan?.rows || [],
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/ho-so/van-ban', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            const { vanBanId } = req.body;
            await app.model.hcthLienKet.delete({ id: vanBanId });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/ho-so', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.body.id);
            const items = await app.model.hcthHoSo.getRelated(id);

            let Items = items?.rows;

            await Promise.all(Items.map(async (item) => {
                await app.model.hcthHoSo.delete({ id: item.id });
                await app.model.hcthLienKet.delete({ loaiA: 'HO_SO', keyA: item.id });
            }));

            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/ho-so/add', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.body.id);

            const { vanBan, loaiVanBan } = req.body.changes;

            const checkVanBan = await app.model.hcthLienKet.get({ loaiA: 'HO_SO', keyA: id, loaiB: loaiVanBan, keyB: vanBan });

            if (checkVanBan) {
                throw { message: 'Văn bản đã được thêm vào hồ sơ này!' };
            } else {
                await app.model.hcthLienKet.create({ loaiA: 'HO_SO', keyA: id, loaiB: loaiVanBan, keyB: vanBan, nguoiTao: req.session.user.shcc });
            }
            res.send({ error: null });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/ho-so/add-van-ban', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, vanBan, loaiLienKet } = req.body;
            await app.model.hcthLienKet.createFromList(vanBan.map(item => ({
                loaiA: 'HO_SO', keyA: id,
                loaiB: loaiLienKet, keyB: item,
                nguoiTao: req.session.user.shcc,
            })));

            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/ho-so/van-ban/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const vanBan = await app.model.hcthLienKet.getAllFrom(id, 'HO_SO', null, null);

            res.send({
                item: vanBan?.rows || [],
            });

        } catch (error) {
            res.send({ error });
        }
    });
};