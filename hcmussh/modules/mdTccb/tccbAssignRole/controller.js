module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3010: { title: 'Phân quyền cán bộ', link: '/user/tccb/phan-quyen', icon: 'fa-archive', backgroundColor: '#9B693B', groupIndex: 0 }
        }
    };

    app.permission.add(
        { name: 'tccbAssignRole:manage', menu },
    );

    app.assignRoleHooks.addRoles('tccbAssignRole', { id: 'tccbAssignRole:manage', text: 'Tổ chức cán bộ: Quản lý phân quyền' });

    app.permissionHooks.add('staff', 'tccbAssignRole', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbAssignRole:manage');
        }
        resolve();
    }));

    app.get('/user/tccb/phan-quyen', app.permission.check('tccbAssignRole:manage'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    const mapListPhanQuyen = async () => {
        const { rows: mapRolePermission } = await app.model.tccbRoleList.getAllLevel();
        let rolePermission = {};

        for (let item of mapRolePermission) {
            const listPermission = item.permission ? item.permission.split(',') : [],
                listAscendant = item.ascendant ? item.ascendant.split(',') : [];

            if (!rolePermission[item.id]) rolePermission[item.id] = {
                role: item.role,
                tenRole: item.tenRole,
                permission: []
            };
            rolePermission[item.id].permission = [...new Set([...rolePermission[item.id].permission, ...listPermission])];

            listAscendant.map(parent => (rolePermission[parent].permission = [...new Set([...rolePermission[parent].permission, ...listPermission])]));
        }

        return Object.keys(rolePermission).reduce((result, id) => {
            const { role, ...info } = rolePermission[id];
            result[role] = info;
            return result;
        }, {});
    };

    app.get('/api/tccb/phan-quyen/get-all', app.permission.check('tccbAssignRole:manage'), async (req, res) => {
        try {
            const { shcc: nguoiGan } = req.session.user;
            const item = await app.model.tccbAssignRole.getAllAssignRole(nguoiGan).then(data => data.rows.map(item => ({ ...item, listAssignRole: app.utils.parse(item.listAssignRole) })));
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/phan-quyen/role/all', app.permission.check('tccbAssignRole:manage'), async (req, res) => {
        try {
            let searchTerm = req.query.condition || '';
            const listRole = await app.model.tccbRoleList.getAll({
                statement: 'LOWER(ROLE) LIKE :searchTerm OR LOWER(TEN_ROLE) LIKE :searchTerm',
                parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` }
            });

            res.send({ listRole });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/phan-quyen/role/item', app.permission.check('tccbAssignRole:manage'), async (req, res) => {
        try {
            const role = await app.model.tccbRoleList.get({ role: req.query.role || '' });
            res.send({ role });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/phan-quyen/assign', app.permission.check('tccbAssignRole:manage'), async (req, res) => {
        try {
            const { shcc: nguoiGan } = req.session.user;
            const timeModified = Date.now();
            const { data } = req.body;

            const { canBo: listCanBo, role, ngayBatDau, ngayKetThuc } = data;

            if (!(listCanBo && listCanBo.length && role && ngayBatDau)) throw ('Thông tin cấu hình không đầy đủ');

            await Promise.all(listCanBo.map(async canBo => {
                const checkCanBo = await app.model.tchcCanBo.get({ shcc: canBo });
                const checkExistRole = await app.model.tccbAssignRole.get({ nguoiDuocGan: canBo, role });
                if (!checkCanBo) throw `Thông tin cán bộ mã số ${canBo} không tồn tại!`;
                if (checkExistRole) throw `Cán bộ ${`${checkCanBo.ho} ${checkCanBo.ten}`.normalizedName()} đã được cấp quyền này!`;
            }));

            await Promise.all(listCanBo.map(async canBo => {
                const checkExistRole = await app.model.tccbAssignRole.get({ nguoiDuocGan: canBo, role });
                !checkExistRole && await Promise.all([
                    app.model.tccbAssignRole.create({ nguoiGan, nguoiDuocGan: canBo, timeModified, ngayBatDau, ngayKetThuc, role }),
                    app.model.fwAssignRole.create({ nguoiGan, nguoiDuocGan: canBo, tenRole: role, nhomRole: 'toChucCanBo', ngayBatDau, ngayKetThuc }),
                ]);
            }));
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/phan-quyen/delete', app.permission.check('tccbAssignRole:manage'), async (req, res) => {
        try {
            const { shcc: nguoiGan } = req.session.user;
            const { data } = req.body;
            const { mscb, role } = data;

            if (!(mscb && role)) throw ('Thông tin cấu hình không đầy đủ');

            const checkExistRole = await app.model.tccbAssignRole.get({ nguoiGan, nguoiDuocGan: mscb, role });
            if (!checkExistRole) throw 'Quyền chưa được cấp cho cán bộ!';

            await Promise.all([
                app.model.tccbAssignRole.delete({ nguoiGan, nguoiDuocGan: mscb, role }),
                app.model.fwAssignRole.delete({ nguoiGan, nguoiDuocGan: mscb, tenRole: role, nhomRole: 'toChucCanBo' }),
            ]);
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.permissionHooks.add('assignRole', 'tccbAssignRole', async (user, assignRoles) => {
        const rolePermission = await mapListPhanQuyen();
        return new Promise(resolve => {
            const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'toChucCanBo');
            inScopeRoles.forEach(role => {
                if (rolePermission[role.tenRole]) {
                    app.permissionHooks.pushUserPermission(user, ...rolePermission[role.tenRole].permission);
                }
            });
            resolve();
        });
    });
};