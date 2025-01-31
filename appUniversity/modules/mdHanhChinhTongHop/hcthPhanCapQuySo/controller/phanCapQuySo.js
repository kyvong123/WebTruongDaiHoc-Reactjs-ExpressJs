module.exports = app => {
    const MA_HCTH = '29';

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            520: { title: 'Cấu hình quỹ số', link: '/user/hcth/cau-hinh-quy-so', icon: 'fa fa-cogs', backgroundColor: '#61dbfb' },
        },
    };

    app.permission.add(
        { name: 'hcthPhanCapQuySo:manage', menu: staffMenu },
        'hcthPhanCapQuySo:write',
        'hcthPhanCapQuySo:read',
        'hcthPhanCapQuySo:delete'
    );

    app.permissionHooks.add('staff', 'addRoleQuanLyPhanCapQuySo', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi === MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthPhanCapQuySo:manage', 'hcthPhanCapQuySo:write', 'hcthPhanCapQuySo:delete');
        }
        resolve();
    }));

    app.get('/user/hcth/cau-hinh-quy-so', app.permission.check('hcthPhanCapQuySo:manage'), app.templates.admin);
    app.get('/user/phan-cap-quy-so', app.permission.check('hcthPhanCapQuySo:manage'), app.templates.admin);

    app.get('/api/hcth/phan-cap-quy-so/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const { condition } = req.query;
            const { pageSize, pageNumber } = req.params;
            const searchTerm = typeof condition === 'string' ? condition : '';
            const page = await app.model.hcthPhanCapQuySo.getAllFrom(parseInt(pageNumber), parseInt(pageSize), searchTerm);
            const { totalitem: totalItem, pagetotal: pageTotal, rows: list } = page;
            res.send({ error: null, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/phan-cap-quy-so', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            if (await app.model.hcthPhanCapQuySo.get({ maDonVi: parseInt(data.maDonVi) }))
                throw 'Mã đơn vị đã tồn tại';
            const item = await app.model.hcthPhanCapQuySo.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/phan-cap-quy-so/item/:maDonVi', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            // const maDonVi = req.params.maDonVi;
            const { maDonVi, capVanBan, ...changes } = req.body.changes;
            if (!await app.model.hcthPhanCapQuySo.get({ maDonVi, capVanBan }))
                throw 'Dữ liệu chưa tồn tại';
            const item = await app.model.hcthPhanCapQuySo.update({ maDonVi, capVanBan }, changes);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/phan-cap-quy-so/:maDonVi', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const maDonVi = req.params.maDonVi;
            if (!await app.model.hcthPhanCapQuySo.get({ maDonVi }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthPhanCapQuySo.delete({ maDonVi });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    // Phân quyền quản lý phân cấp quỹ số trong phòng HCTH
    const phanCapQuySoRole = 'hcthPhanCapQuySo';

    app.assignRoleHooks.addRoles(phanCapQuySoRole, { id: 'hcthPhanCapQuySo:manage', text: 'Hành chính - Tổng hợp: Quản lý phân cấp quỹ số' });

    app.assignRoleHooks.addHook(phanCapQuySoRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === phanCapQuySoRole && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(phanCapQuySoRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyPhanCapQuySo', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == phanCapQuySoRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthPhanCapQuySo:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcthPhanCapQuySo:manage', 'hcthPhanCapQuySo:write', 'hcthPhanCapQuySo:delete', 'dmLoaiVanBan:read', 'dmLoaiVanBan:write', 'dmLoaiVanBan:delete');
            }
        });
        resolve();
    }));


    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('HcthCauHinhQuySo:init', {
        ready: () => app.database && app.assetPath && app.model && app.model.dmDonVi && app.model.hcthPhanCapQuySo,
        run: async () => {
            try {
                if (!app.primaryWorker) return;
                console.info('HcthCauHinhQuySo:init', 'start');
                const danhSachCapVanBan = ['TRUONG', 'DON_VI'];
                const danhSachDonVi = await app.model.dmDonVi.getAll();
                const quySo = await app.model.hcthQuySo.get({ macDinh: 1 });
                if (!quySo) {
                    throw 'Chưa có quỹ số mặc định!';
                }
                await Promise.all(danhSachDonVi.map(async (donVi) => {
                    for (const capVanBan of danhSachCapVanBan) {
                        if (!await app.model.hcthPhanCapQuySo.get({ maDonVi: donVi.ma, capVanBan })) {
                            await app.model.hcthPhanCapQuySo.create({ maDonVi: donVi.ma, capVanBan, loaiVanBan: 0, nhomLoaiVanBan: null, quySo: quySo.ma });
                        }
                    }
                }));
                console.info('HcthCauHinhQuySo:init', 'done');
            } catch (error) {
                console.error('HcthCauHinhQuySo:init', error);
            }
        },
    });
};