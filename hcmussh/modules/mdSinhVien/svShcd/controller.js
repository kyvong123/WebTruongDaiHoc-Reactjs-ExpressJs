module.exports = app => {
    const permission = app.isDebug ? 'student:login' : 'student:test';
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1019: { title: 'Sinh hoạt công dân', link: '/user/student-shcd', icon: 'fa-users', backgroundColor: '#898176', pin: true }
        }
    };

    app.permission.add(
        { name: permission, menu },
    );

    app.get('/user/student-shcd', app.permission.check(permission), app.templates.admin);


    //Phân quyền menu quản lý
    const menuQuanLy = {
        parentMenu: app.parentMenu.user,
        menus: {
            1022: { title: 'Quản lý sinh hoạt công dân', link: '/user/student/quan-ly-shcd', icon: 'fa-calendar-check-o', backgroundColor: '#898180', pin: true }
        }
    };

    app.permission.add(
        { name: 'student:shcd-manage', menu: menuQuanLy },
        { name: 'quanLyShcd:read' },
    );

    const ctsvShcd = 'ctsvShcd', shcdPermission = 'student:shcd-manage';

    app.assignRoleHooks.addRoles(ctsvShcd, { id: shcdPermission, text: 'Ctsv: Quản lý đợt sinh hoạt công dân' });

    app.permissionHooks.add('assignRoleStudent', 'checkRoleManageShcd', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == ctsvShcd);
        inScopeRoles.forEach(role => {
            if (role.tenRole == shcdPermission) {
                app.permissionHooks.pushUserPermission(user, shcdPermission, 'quanLyShcd:read');
            }
        });
        resolve();
    }));

    app.get('/user/student/quan-ly-shcd', app.permission.orCheck('student:shcd-manage'), app.templates.admin);
    app.get('/user/student/quan-ly-shcd/:id', app.permission.orCheck('student:shcd-manage'), app.templates.admin);

    //----------------------API-----------------------------------------
    app.get('/api/sv/shcd', app.permission.check(permission), async (req, res) => {
        try {
            let { mssv } = req.query;
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listnoidung: listNoiDung, listevent: listEvent, listguest: listGuest, rows: [item] } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            const { rows: danhSachDiemDanh } = await app.model.svShcdDiemDanh.getDataSinhVien(mssv);
            res.send({ item, listNoiDung, listEvent, listGuest, danhSachDiemDanh });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/shcd/diem-danh', app.permission.check(permission), async (req, res) => {
        try {
            const { data } = req.body;
            let { mssv, id } = data;
            // Kiểm tra mã QR có hợp lệ không
            let event = await app.model.svShcdLich.get({ id });

            let now = new Date().getTime();
            // if (event.qrTimeGenerate != qrTimeGenerate || now < event.qrTimeGenerate)
            //     return res.send({ response: 'Mã QR không hợp lệ', status: 'danger' });
            if (now > event.qrValidTime)
                return res.send({ response: 'Mã QR đã hết hạn', status: 'danger' });
            // kiểm tra sinh viên có trong danh sách buổi shcd hay không
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            if (listEvent.map(item => item.id).includes(parseInt(id))) {
                const daDiemDanh = await app.model.svShcdDiemDanh.get({ mssv, id });
                if (daDiemDanh) return res.send({ response: 'Sinh viên đã điểm danh rồi', status: 'success' });
                await app.model.svShcdDiemDanh.create({ ...data, thoiGianVao: Date.now() });
                return res.send({ response: 'Điểm danh thành công', status: 'success' });
            }
            return res.send({ response: 'Sinh viên không thuộc buổi sinh họat công dân này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.put('/api/sv/shcd/diem-danh', app.permission.check(permission), async (req, res) => {
        try {
            const { id, mssv, changes } = req.body;
            // Kiểm tra mã QR có hợp lệ không
            let event = await app.model.svShcdLich.get({ id });

            let now = new Date().getTime();
            // if (event.qrTimeGenerate != qrTimeGenerate || now < event.qrTimeGenerate)
            //     return res.send({ response: 'Mã QR không hợp lệ', status: 'danger' });
            if (now > event.qrValidTime)
                return res.send({ response: 'Mã QR đã hết hạn', status: 'danger' });
            // kiểm tra sinh viên có trong danh sách buổi shcd hay không
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            if (listEvent.map(item => item.id).includes(parseInt(id))) {
                const daDiemDanh = await app.model.svShcdDiemDanh.get({ mssv, id });
                if (!daDiemDanh) return res.send({ response: 'Sinh viên chưa điểm danh vào', status: 'danger' });
                let item = await app.model.svShcdDiemDanh.update({ id, mssv }, { ...changes, thoiGianRa: Date.now() });
                return res.send({ response: 'Điểm danh thành công', status: 'success', item });
            }
            return res.send({ response: 'Sinh viên không thuộc buổi sinh họat công dân này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    //======== API menu quản lý==============
    app.get('/api/sv/quan-ly-shcd', app.permission.check('student:shcd-manage'), async (req, res) => {
        try {
            const [shcdList, assignedList] = await Promise.all([
                app.model.svSinhHoatCongDan.getAll({ kichHoat: 1 }),
                app.model.svShcdAssignRole.getAll({ nguoiDuocGan: req.session.user.studentId }, 'shcdId')
            ]);
            let item = shcdList.filter(shcd => assignedList.map(item => item.shcdId).includes(shcd.id));

            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/quan-ly-shcd/item/data', app.permission.check('student:shcd-manage'), async (req, res) => {
        try {
            const id = req.query.id;
            // const { shcdId } = await app.model.svShcdAssignRole.get({ nguoiDuocGan: req.session.user.studentId }, 'shcdId');
            const { listnoidung: listNoiDung, listevent: listEvent, listguest: listGuest, rows: [item] } = await app.model.svSinhHoatCongDan.getData(id);
            res.send({ item, listNoiDung, listEvent, listGuest });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/quan-ly-shcd/diem-danh', app.permission.check('student:shcd-manage'), async (req, res) => {
        try {
            const { data } = req.body;
            let { mssv, id } = data;
            // kiểm tra sinh viên có trong danh sách buổi shcd hay không
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            if (listEvent.map(item => item.id).includes(parseInt(data.id))) {
                const daDiemDanh = await app.model.svShcdDiemDanh.get({ mssv, id });
                if (daDiemDanh) return res.send({ response: 'Sinh viên đã điểm danh rồi', status: 'success' });
                let r = await app.model.svShcdDiemDanh.create({ ...data, nguoiScanVao: req.session.user.email, thoiGianVao: Date.now() });
                return res.send({ response: 'Điểm danh thành công', status: 'success', r });
            }
            return res.send({ response: 'Sinh viên không thuộc buổi sinh họat công dân này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/sv/quan-ly-shcd/diem-danh', app.permission.check('student:shcd-manage'), async (req, res) => {
        try {
            const { id, mssv, changes } = req.body;
            // kiểm tra sinh viên có trong danh sách buổi shcd hay không
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            if (listEvent.map(item => item.id).includes(parseInt(id))) {
                const daDiemDanh = await app.model.svShcdDiemDanh.get({ mssv, id });
                if (!daDiemDanh) return res.send({ response: 'Sinh viên chưa điểm danh vào', status: 'danger' });
                let item = await app.model.svShcdDiemDanh.update({ id, mssv }, { ...changes, nguoiScanRa: req.session.user.email, thoiGianRa: Date.now() });
                return res.send({ response: 'Điểm danh thành công', status: 'success', item });
            }
            return res.send({ response: 'Sinh viên không thuộc buổi sinh họat công dân này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};