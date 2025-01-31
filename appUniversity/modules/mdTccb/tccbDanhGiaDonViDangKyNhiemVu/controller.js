module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1003: { title: 'Đơn vị đăng ký nhiệm vụ', link: '/user/danh-gia/don-vi-dang-ky-nhiem-vu', icon: 'fa-users', backgroundColor: '#2a99b8', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'tccbDonViDangKyNhiemVu:write', menu },
        { name: 'tccbDonViDangKyNhiemVu:delete' },
    );
    app.get('/user/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), app.templates.admin);
    app.get('/user/danh-gia/don-vi-dang-ky-nhiem-vu/:nam', app.permission.check('tccbDonViDangKyNhiemVu:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('tccbDonViDangKyNhiemVu:write'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     const maDonVi = req.session.user.staff.maDonVi;
    //     condition.maDonVi = maDonVi;
    //     app.model.tccbDonViDangKyNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all-by-year', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam), maDonVi = req.query.maDonVi;
            if (!(maDonVi == req.session.user.staff.maDonVi || req.session.user.staff.donViQuanLy.findIndex(item => item.maDonVi == maDonVi) != -1)) {
                throw 'Lấy danh sách đăng ký nhiệm vụ không thành công';
            }
            let danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            let danhGiaDonVis = await app.model.tccbKhungDanhGiaDonVi.getAll({ nam, isDelete: 0 }, '*', 'THU_TU ASC');
            let dangKys = await app.model.tccbDonViDangKyNhiemVu.getAll({ nam, maDonVi });
            let items = danhGiaDonVis.filter(item => !item.parentId);
            danhGiaDonVis = danhGiaDonVis.filter(item => item.parentId).map(item => {
                const index = dangKys.findIndex(dangKy => dangKy.maKhungDanhGiaDonVi == item.id);
                if (index == -1) {
                    return {
                        noiDung: item.noiDung,
                        maKhungDanhGiaDonVi: item.id,
                        parentId: item.parentId,
                        maDonVi,
                        nam,
                    };
                }
                return {
                    parentId: item.parentId,
                    noiDung: item.noiDung,
                    ...dangKys[index]
                };
            });
            items = items.map(item => ({ ...item, submenus: danhGiaDonVis.filter(danhGia => danhGia.parentId == item.id) }));
            res.send({ items, danhGiaNam });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const maDonVi = req.session.user.staff.maDonVi;
            condition.maDonVi = maDonVi;
            const items = await app.model.tccbDonViDangKyNhiemVu.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/item/:id', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const maDonVi = req.session.user.staff.maDonVi;
            const item = await app.model.tccbDonViDangKyNhiemVu.get({ id: req.params.id, maDonVi });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const maDonVi = newItem.maDonVi;
            const nam = newItem.nam;
            if (!(maDonVi == req.session.user.staff.maDonVi || req.session.user.staff.donViQuanLy.findIndex(item => item.maDonVi == maDonVi) != -1)) {
                throw 'Tạo mới không thành công';
            }
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > Date.now() || Date.now() > donViKetThucDangKy) {
                res.send({ error: 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp' });
            } else {
                newItem.userModified = req.session.user.email;
                newItem.lastModified = Date.now();
                const item = await app.model.tccbDonViDangKyNhiemVu.create(newItem);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const { nam, maDonVi } = await app.model.tccbDonViDangKyNhiemVu.get({ id: req.body.id });
            const changes = req.body.changes;
            if (!(maDonVi == req.session.user.staff.maDonVi || req.session.user.staff.donViQuanLy.findIndex(item => item.maDonVi == maDonVi) != -1)) {
                throw 'Cập nhật không thành công';
            }
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > Date.now() || Date.now() > donViKetThucDangKy) {
                res.send({ error: 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp' });
            } else {
                changes.userModified = req.session.user.email;
                changes.lastModified = Date.now();
                const item = await app.model.tccbDonViDangKyNhiemVu.update({ id: req.body.id, maDonVi }, changes);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:delete'), async (req, res) => {
        try {
            const { nam } = await app.model.tccbDonViDangKyNhiemVu.update({ id: req.body.id });
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > Date.now() || Date.now() > donViKetThucDangKy) {
                res.send({ error: 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp' });
            } else {
                await app.model.tccbDonViDangKyNhiemVu.delete({ id: req.body.id, maDonVi: req.session.user.staff.maDonVi });
                res.end();
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.assignRoleHooks.addRoles('tccbDonViDangKyNhiemVu', { id: 'tccbDonViDangKyNhiemVu:write', text: 'Đơn vị đăng ký nhiệm vụ' });

    app.assignRoleHooks.addHook('tccbDonViDangKyNhiemVu', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tccbDonViDangKyNhiemVu' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tccbDonViDangKyNhiemVu').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleDonViDangKyNhiemVu', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'tccbDonViDangKyNhiemVu:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleDonViDangKyNhiemVu', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tccbDonViDangKyNhiemVu');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tccbDonViDangKyNhiemVu:write') {
                app.permissionHooks.pushUserPermission(user, 'tccbDonViDangKyNhiemVu:write');
            }
        });
        resolve();
    }));
};