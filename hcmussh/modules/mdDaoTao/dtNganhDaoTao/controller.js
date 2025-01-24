module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            // 7003: {
            //     title: 'Danh sách Ngành đào tạo', groupIndex: 0,
            //     icon: 'fa-cube', backgroundColor: '#b36154',
            //     link: '/user/dao-tao/nganh-dao-tao'
            // },
            7004: {
                title: 'Danh sách Ngành, chuyên ngành', groupIndex: 0,
                icon: 'fa-list', backgroundColor: '#b36155',
                link: '/user/dao-tao/danh-sach-nganh'
            },
        },
    };
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6148: {
                title: 'Danh sách Ngành, chuyên ngành', groupIndex: 3,
                icon: 'fa-list', backgroundColor: '#b36155',
                link: '/user/ctsv/danh-sach-nganh'
            },
        },
    };

    app.permission.add(
        { name: 'dtNganhDaoTao:read', menu },
        { name: 'dtNganhDaoTao:manage', menu },
        { name: 'dtNganhDaoTao:write' },
        { name: 'dtNganhDaoTao:delete' },
        { name: 'ctsvNganhDaoTao:read', menu: menuCtsv }
    );

    app.permissionHooks.add('staff', 'addRolesDtNganhDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtNganhDaoTao:read', 'dtNganhDaoTao:write');
            resolve();
        } else if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvNganhDaoTao:read');
            resolve();
        } else resolve();
    }));

    // app.permissionHooks.add('staff', 'addRolesDtNganhDaoTaoByDonVi', (user) => new Promise(resolve => {
    //     if (user.permissions.includes('manager:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'dtNganhDaoTao:read');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDtNganhDaoTao', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'dtNganhDaoTao:read' && user.permissions.includes('faculty:login')) {
    //             app.permissionHooks.pushUserPermission(user, 'dtNganhDaoTao:read');
    //         }
    //     });
    //     resolve();
    // }));

    app.get('/user/dao-tao/nganh-dao-tao', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage'), app.templates.admin);
    app.get('/user/dao-tao/danh-sach-nganh', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage'), app.templates.admin);
    app.get('/user/ctsv/danh-sach-nganh', app.permission.check('ctsvNganhDaoTao:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/nganh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage', 'student:login', 'tcHocPhi:write', 'ctsvNganhDaoTao:read', 'staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const user = req.session.user, permissions = user.permissions;
        let donVi = req.query.donViFilter;
        if (user.studentId && permissions.includes('student:login')) {
            donVi = user.data.khoa;
        }
        else if (!permissions.includes('dtChuongTrinhDaoTao:read') && !permissions.includes('tcHocPhi:write')) {
            if (user.staff.maDonVi) donVi = user.staff.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        app.model.dtNganhDaoTao.getPage(pageNumber, pageSize, {
            statement: '((:donVi) IS NULL OR khoa = (: donVi)) AND (lower(tenNganh) LIKE :searchText OR maNganh LIKE :searchText)',
            parameter: { donVi, searchText: `%${(req.query.condition || '').toLowerCase()}%` }
        }, '*', 'khoa', (error, page) => res.send({ error, page }));
    });

    app.get('/api/dt/nganh-dao-tao/filter/page/:pageNumber/:pageSize', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage', 'staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const user = req.session.user;
        let donVi = req.query.donViFilter;
        if (!Number(user.isPhongDaoTao)) {
            donVi = user.maDonVi;
        }

        app.model.dtNganhDaoTao.getPage(pageNumber, pageSize, {
            statement: '((:donVi) IS NULL OR khoa = (: donVi)) AND (lower(tenNganh) LIKE :searchText OR maNganh LIKE :searchText)',
            parameter: { donVi, searchText: `%${(req.query.condition || '').toLowerCase()}%` }
        }, '*', 'khoa', (error, page) => res.send({ error, page }));
    });

    app.get('/api/dt/nganh-dao-tao-student', app.permission.check('user:login'), (req, res) => {
        app.model.dtNganhDaoTao.getAll({
            statement: '(lower(tenNganh) LIKE :searchText OR maNganh LIKE :searchText) AND kichHoat = 1',
            parameter: { searchText: `%${(req.query.condition || '').toLowerCase()}%` }
        }, '*', 'khoa', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/nganh-dao-tao/all', app.permission.orCheck('dtNganhDaoTao:read', 'ctsvNganhDaoTao:read'), (req, res) => {
        app.model.dtNganhDaoTao.getAll({ kichHoat: 1 }, (error, items) => res.send({ error, items }));

    });

    app.get('/api/dt/nganh-dao-tao/item/:maNganh', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage', 'student:login', 'student:pending', 'manageQuyetDinh:ctsv', 'tcHocPhi:read', 'ctsvNganhDaoTao:read', 'dtChuongTrinhDaoTao:read', 'staff:login'), (req, res) => {
        app.model.dtNganhDaoTao.get({ maNganh: req.params.maNganh }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dt/nganh-dao-tao/filter', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage', 'ctsvNganhDaoTao:read'), (req, res) => {
        const MA_PDT = 33;
        app.model.dtNganhDaoTao.getAll(
            {
                statement: `(:khoa IS NULL OR khoa = :khoa OR :khoa = ${MA_PDT}) AND (lower(tenNganh) LIKE :searchText OR lower(maNganh) LIKE :searchText)`,
                parameter: {
                    khoa: req.query.donVi,
                    searchText: `%${req.query.condition || ''}%`
                }
            }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/nganh-dao-tao/role', app.permission.orCheck('dtNganhDaoTao:read', 'dtNganhDaoTao:manage', 'ctsvNganhDaoTao:read', 'dtThongKeDiem:avr'), async (req, res) => {
        try {
            const MA_PDT = 33,
                { user } = req.session,
                { maDonVi } = user;

            let items = [], list,
                { filter } = req.query,
                { donVi, condition } = filter;

            list = await app.model.dtNganhDaoTao.getAll({
                statement: `(:khoa IS NULL OR khoa = :khoa OR :khoa = ${MA_PDT}) AND (lower(tenNganh) LIKE :searchText OR lower(maNganh) LIKE :searchText)`,
                parameter: {
                    khoa: donVi,
                    searchText: `%${condition || ''}%`
                }
            });

            list.forEach(item => {
                if (maDonVi == item.khoa) items.push(item);
            });

            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/nganh-dao-tao', app.permission.check('dtNganhDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dtNganhDaoTao.get({ maNganh: data.maNganh }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã đã tồn tại' });
            } else {
                app.model.dtNganhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/dt/nganh-dao-tao', app.permission.check('dtNganhDaoTao:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dtNganhDaoTao.update({ maNganh: req.body.maNganh }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dt/nganh-dao-tao', app.permission.check('dtNganhDaoTao:delete'), (req, res) => {
        app.model.dtNganhDaoTao.delete({ maNganh: req.body.maNganh }, errors => res.send({ errors }));
    });

    // NEW ================================================================================================

    app.get('/api/dt/danh-sach-nganh/page/:pageNumber/:pageSize', app.permission.orCheck('dtNganhDaoTao:read', 'ctsvNganhDaoTao:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                filter = req.query.filter ? req.query.filter : {},
                searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '',
                user = req.session.user;

            if (!Number(user.isPhongDaoTao) && !user.permissions.includes('dtNganhDaoTao:manage')) {
                filter.maKhoa = user.maDonVi;
            }

            const page = await app.model.dtNganhDaoTao.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list, dschuyennganh } = page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list }, dsChuyenNganh: dschuyennganh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/danh-sach-nganh', app.permission.orCheck('dtNganhDaoTao:write'), async (req, res) => {
        try {
            const data = req.body.data,
                item = await app.model.dtNganhDaoTao.create({ ...data, kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/danh-sach-nganh', app.permission.orCheck('dtNganhDaoTao:write'), async (req, res) => {
        try {
            const { maNganh, changes } = req.body,
                result = await Promise.all([
                    app.model.dtNganhDaoTao.update({ maNganh }, changes),
                    app.model.dtChuyenNganh.update({ maNganh }, { kichHoat: changes.kichHoat })
                ]);

            res.send({ item: result[0] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/danh-sach-nganh', app.permission.orCheck('dtNganhDaoTao:delete'), async (req, res) => {
        try {
            const { maNganh } = req.body;
            await Promise.all([
                app.model.dtNganhDaoTao.delete({ maNganh }),
                app.model.dtChuyenNganh.delete({ maNganh })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Chuyen nganh

    app.post('/api/dt/chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write'), async (req, res) => {
        try {
            const data = req.body.data,
                item = await app.model.dtChuyenNganh.create({ ...data, kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write', 'dtNganhDaoTao:manage'), async (req, res) => {
        try {
            const { ma, changes } = req.body,
                item = await app.model.dtChuyenNganh.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:delete', 'dtNganhDaoTao:manage'), async (req, res) => {
        try {
            await app.model.dtChuyenNganh.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/nganh-he-dao-tao', app.permission.check('dtNganhDaoTao:read'), async (req, res) => {
        try {
            let items = await app.model.dtNganhHeDaoTao.getAll({ heDaoTao: req.query.ma });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/nganh-he-dao-tao', app.permission.check('dtNganhDaoTao:read'), async (req, res) => {
        try {
            let { heDaoTao, nganhDaoTao } = req.body;
            if (await app.model.dtNganhHeDaoTao.get({ heDaoTao, nganhDaoTao })) {
                await app.model.dtNganhHeDaoTao.delete({ heDaoTao, nganhDaoTao });
            } else {
                await app.model.dtNganhHeDaoTao.create({ heDaoTao, nganhDaoTao });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/nganh-he-dao-tao/create-all', app.permission.check('dtNganhDaoTao:read'), async (req, res) => {
        try {
            let { heDaoTao, listNganh } = req.body;
            if (listNganh) {
                for (let nganhDaoTao of listNganh) {
                    if (!(await app.model.dtNganhHeDaoTao.get({ heDaoTao, nganhDaoTao }))) {
                        await app.model.dtNganhHeDaoTao.create({ heDaoTao, nganhDaoTao });
                    }
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};