module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7582: {
                title: 'Quản lý điểm học phần', link: '/user/sau-dai-hoc/diem-hoc-phan', parentKey: 7560
            },
        }
    };
    app.permission.add(
        { name: 'sdhDiemManage:manage', menu },
        { name: 'sdhDiemManage:write' },
        { name: 'sdhDiemManage:delete' },
        { name: 'sdhDiemManage:read' }
    );

    app.get('/user/sau-dai-hoc/diem-hoc-phan', app.permission.check('sdhDiemManage:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/grade/nhap-diem', app.permission.check('sdhDiemManage:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDiemManage', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDiemManage:manage', 'sdhDiemManage:write', 'sdhDiemManage:read', 'sdhDiemManage:delete');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/diem-hoc-phan/all', app.permission.check('sdhDiemManage:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiem.getAll({});
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-hoc-phan/page/:pageNumber/:pageSize', app.permission.check('sdhDiemManage:read'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.searchTerm == 'string' ? req.query.searchTerm : '',
                filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let data = await app.model.sdhDiem.searchPageHocPhan(_pageNumber, _pageSize, filter, searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = data;
            let pageCondition = {
                searchTerm,
            };
            res.send({ page: { totalItem, pageNumber, pageSize, pageTotal, list, filter: req.query.filter, pageCondition } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-hoc-phan/multi-tinh-trang', app.permission.check('sdhDiemManage:manage'), async (req, res) => {
        try {
            const { chosenList, tinhTrang } = req.body;
            await app.model.sdhLopHocVienHocPhan.update({
                statement: ' maHocPhan IN (:chosenList)',
                parameter: { chosenList }
            }, tinhTrang);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-hoc-phan/tinh-trang', app.permission.check('sdhDiemManage:manage'), async (req, res) => {
        try {
            const { maHocPhan, tinhTrang } = req.body;
            await app.model.sdhLopHocVienHocPhan.update({ maHocPhan }, tinhTrang);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-hoc-phan/multi-config', app.permission.check('sdhDiemManage:manage'), async (req, res) => {
        try {
            const { updateList, listThanhPhan } = req.body;
            const listMaHocPhan = updateList.map(i => i.maHocPhan),
                userModified = req.session.user.email,
                timeModified = Date.now();
            await app.model.sdhDiemConfigHocPhan.delete({
                statement: ' maHocPhan IN (:listMaHocPhan)',
                parameter: { listMaHocPhan }
            });
            for (let i = 0; i < updateList.length; i++) {
                for (let j = 0; j < listThanhPhan.length; j++) {
                    let item = { ...updateList[i], ...listThanhPhan[j], userModified, timeModified };
                    await app.model.sdhDiemConfigHocPhan.create(item);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-hoc-phan/time-config', app.permission.check('sdhDiemManage:manage'), async (req, res) => {
        try {
            const { maHocPhan, changes } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();
            await app.model.sdhDiemConfigTimeHocPhan.delete({ maHocPhan });
            await app.model.sdhDiemConfigTimeHocPhan.create({ maHocPhan, ...changes, userModified, timeModified });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


};

