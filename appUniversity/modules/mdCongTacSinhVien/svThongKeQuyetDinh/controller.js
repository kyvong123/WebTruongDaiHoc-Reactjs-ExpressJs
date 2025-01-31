module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6172: {
                title: 'Thống kê quản lý quyết định', icon: 'fa-table', link: '/user/ctsv/thong-ke-quan-ly-quyet-dinh', groupIndex: 2, backgroundColor: '#216182', parentKey: '6111'
            }
        }
    };

    app.permission.add(
        { name: 'thongKeQuyetDinh:manage', menu: menuCtsv },
        'thongKeQuyetDinh:export'
    );

    app.get('/user/ctsv/thong-ke-quan-ly-quyet-dinh', app.permission.check('thongKeQuyetDinh:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleThongKeQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'thongKeQuyetDinh:manage', 'thongKeQuyetDinh:export');
            resolve();
        } else resolve();
    }));

    app.readyHooks.add('addSocketListener:ListenThongKeQuyetDinh', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('svThongKeChungNhan', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('thongKeQuyetDinh:manage',) && socket.join('svThongKeChungNhan');
        })
    });

    //=========== API ===================
    app.get('/api/ctsv/thong-ke-quyet-dinh/get-data', app.permission.check('thongKeQuyetDinh:manage'), async (req, res) => {
        try {
            let filter = req.query.filter, loaiQuyetDinh = req.query.loaiQuyetDinh;
            const thongKe = (await app.model.svManageQuyetDinh.getThongKe(filter)),
                listLHDT = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 }),
                listFormType = await app.model.svDmFormType.getAll({
                    statement: 'kieuForm in (:kieuform)',
                    parameter: { kieuform: loaiQuyetDinh }
                });
            let result = listFormType.map(formType => (Object.assign(
                { 'Tên quyết định': formType.ten + ' (' + formType.ma + ')' },
                ...listLHDT.map(LHDT => ({ [LHDT.ten]: thongKe.rows.filter(item => item.LHDT == LHDT.ten && item.MA == formType.ma)[0]?.SQD || 0 })),
                { 'Tổng': thongKe.rows.map(item => item.MA == formType.ma ? item.SQD : 0).reduce((accumulator, currentValue) => (accumulator + currentValue), 0) }
            )));
            result.push(Object.assign(
                { 'Tên quyết định': 'Tổng' },
                ...listLHDT.map(LHDT => ({ [LHDT.ten]: result.map(item => item[LHDT.ten]).reduce((accumulator, currentValue) => (accumulator + currentValue), 0)})),
                { 'Tổng': result.map(item => item['Tổng']).reduce((accumulator, currentValue) => (accumulator + currentValue), 0) }
            ));

            res.send({
                data: result,
                tongQDRa: thongKe.rows.map(item => item.KIEU_FORM == 1 ? item.SQD : 0).reduce((accumulator, currentValue) => (accumulator + currentValue), 0),
                tongQDVao: thongKe.rows.map(item => item.KIEU_FORM == 2 ? item.SQD : 0).reduce((accumulator, currentValue) => (accumulator + currentValue), 0)
            });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-quyet-dinh/download-excel', app.permission.check('thongKeQuyetDinh:export'), async (req, res) => {
        try {

            let filter = req.query.filter;
            const thongKe = (await app.model.svManageQuyetDinh.getThongKe(filter)),
                listLHDT = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 }),
                listFormType = await app.model.svDmFormType.getAll({
                    statement: 'kieuForm in (:kieuform)',
                    parameter: { kieuform: [1, 2] }
                });
            let result = listFormType.map(formType => (Object.assign(
                { 'Tên quyết định': formType.ten + ' (' + formType.ma + ')' },
                ...listLHDT.map(LHDT => ({ [LHDT.ten]: thongKe.rows.filter(item => item.LHDT == LHDT.ten && item.MA == formType.ma)[0]?.SQD || 0 })),
                { 'Tổng': thongKe.rows.map(item => item.MA == formType.ma ? item.SQD : 0).reduce((accumulator, currentValue) => (accumulator + currentValue), 0) }
            )));
            result.push(Object.assign(
                { 'Tên quyết định': 'Tổng' },
                ...listLHDT.map(LHDT => ({ [LHDT.ten]: result.map(item => item[LHDT.ten]).reduce((accumulator, currentValue) => (accumulator + currentValue), 0)})),
                { 'Tổng': result.map(item => item['Tổng']).reduce((accumulator, currentValue) => (accumulator + currentValue), 0) }
            ));

            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('THONGKE_QUYETDINH');
            ws.columns = Object.keys(result[0] || {}).map(key => ({ header: key.toString(), key, width: 15 }));
            ws.columns[0].width = 50;
            result.forEach((item) => { ws.addRow(item); });

            app.excel.attachment(workBook, res, 'Thống kê quản lý quyết định.xlsx');
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};