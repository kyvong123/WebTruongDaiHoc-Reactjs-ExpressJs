module.exports = app => {
    const permission = app.isDebug ? 'student:login' : 'student:test';
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1355: { title: 'Sự kiện', link: '/user/student/su-kien', icon: 'fa-file-text-o', backgroundColor: '#FF7B54', pin: true }
        }
    };

    app.permission.add(
        { name: permission, menu },
        'student:manage',
        'student:write',
        'student:read',
        'student:delete',
    );

    app.permissionHooks.add('student', 'addRolectTaoSuKienLopTruong', (user) => new Promise(resolve => {
        if (user) {
            app.dkhpRedis.getBanCanSuLop({ userId: user.mssv }, (item) => {
                // if (item && item.includes('LT')) {
                if (item) {
                    app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:write', 'ctsvSuKien:delete', 'ctsvSuKien:manage', 'student:read', 'dmTheTieuChi:read', 'tccbLop:manage');
                    resolve();
                } else resolve();
            });
        } else resolve();
        // if (user) {
        //     app.model.svQuanLyLop.get({ userId: user.mssv }).then((item) => {
        //         if (item && item.maChucVu === 'LT') {
        //             app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:write', 'ctsvSuKien:delete', 'ctsvSuKien:manage', 'student:read', 'dmTheTieuChi:read', 'tccbLop:manage');
        //         }
        //         resolve();
        //     });
        // } else resolve();
    }));

    app.get('/user/student/su-kien', app.permission.check(permission), app.templates.admin);
    app.get('/user/student/su-kien/:id', app.permission.check(permission), app.templates.admin);
    //----------------------API-----------------------------------------

    app.get('/api/sv/su-kien-nguoi-tham-du/page', app.permission.check(permission), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, pageCondition, filter = {} } = req.query,
                { idSuKien } = filter,
                email = req.session.user.email;
            const _page = await app.model.svSuKien.searchPageNguoiThamDu(parseInt(_pageNumber), parseInt(_pageSize), pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            const daThamDu = await app.model.svSuKienNguoiThamDu.get({ idSuKien, email });
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition }, daThamDu: daThamDu ? true : false });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/su-kien/item/:id', app.permission.check(permission), async (req, res) => {
        try {
            let idSuKien = req.params.id;
            const data = await app.model.svSuKien.getInfoFinal(idSuKien);
            res.send({ data: data.rows[0] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sv/su-kien-nguoi-tham-du', app.permission.check(permission), async (req, res) => {
        try {
            let { idSuKien } = req.body,
                { email, lastName, firstName, mssv } = req.session.user;
            const item = await app.model.svSuKienNguoiThamDu.create({ idSuKien, email, ten: lastName + ' ' + firstName, loaiThamDu: 1, mssv });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sv/su-kien-nguoi-tham-du', app.permission.check(permission), async (req, res) => {
        try {
            let { idSuKien } = req.body,
                { email } = req.session.user;
            const item = await app.model.svSuKienNguoiThamDu.delete({ idSuKien, email, loaiThamDu: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sv/danh-sach-su-kien/diem-danh', app.permission.check(permission), async (req, res) => {
        try {
            const { id } = req.body;
            let { email } = req.session.user;
            // kiểm tra sinh viên có trong danh sách tham dự sự kiện hay không
            const sinhVienThamDu = await app.model.svSuKienNguoiThamDu.get({ email, idSuKien: id });
            if (sinhVienThamDu) {
                const daDiemDanh = sinhVienThamDu.tinhTrang === '1';
                if (daDiemDanh) return res.send({ response: 'Sinh viên đã điểm danh rồi', status: 'success' });
                const suKienItems = await app.model.svSuKien.getInfoFinal(id);
                const suKien = suKienItems.rows[0];
                let item = await app.model.svSuKienNguoiThamDu.update({ id: sinhVienThamDu.id }, { tinhTrang: '1', diemCong: suKien.diemRenLuyenCong });
                return res.send({ response: 'Điểm danh thành công', status: 'success', item });

            }
            return res.send({ response: 'Sinh viên không nằm trong danh sách người tham dự sự kiện này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};