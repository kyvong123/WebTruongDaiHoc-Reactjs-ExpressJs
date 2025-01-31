module.exports = (app) => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6188: {
                title: 'Thống kê chứng nhận', icon: 'fa-bar-chart-o', link: '/user/ctsv/dashboard-chung-nhan', groupIndex: 1, parentKey: 6107
            }
        }
    };
    app.permission.add(
        { name: 'dashboardChungNhan:manage', menu: menuCtsv },
        'dashboardChungNhan:export'
    );

    app.get('/user/ctsv/dashboard-chung-nhan', app.permission.check('dashboardChungNhan:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoledashboardChungNhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dashboardChungNhan:manage', 'dashboardChungNhan:export');
            // app.io.addSocketListener('svFormList', socket => socket.join('svFormList'));
            resolve();
        } else resolve();
    }));

    app.get('/api/ctsv/dashboard-chung-nhan/download-excel', app.permission.check('dashboardChungNhan:export'), async (req, res) => {
        try {
            // map tên field với kết quả từ sql
            let filter = req.query.filter;
            //==========================Lấy dữ liệu và tạo excel============================================
            const { thoiGianBatDau, thoiGianKetThuc } = app.utils.parse(filter); // lấy dữ liệu trong filter về 2 biến
            const { rows: list } = await app.model.svManageForm.downloadExcel(filter); // lấy dữ liện từ sql về list
            const workBook = app.excel.create(), // tạo excel
                ws = workBook.addWorksheet('DS_Chứng nhận');
            ws.columns = Object.keys(list[0] || {}).map(key => ({ header: key.toString(), key, width: 15 }));//thêm các cột
            ws.columns[0].width = 50;
            list.forEach((item) => { ws.addRow(item); });// thêm các dòng dữ liệu vào excel 
            let startDate = new Date(thoiGianBatDau),
                endDate = thoiGianKetThuc ? new Date(thoiGianKetThuc) : new Date();
            startDate = thoiGianBatDau ? startDate.getDate() + '_' + (startDate.getMonth() + 1) + '_' + startDate.getFullYear() : '';
            endDate = endDate.getDate() + '_' + (endDate.getMonth() + 1) + '_' + endDate.getFullYear();
            //=========================Export excel=================================
            app.excel.attachment(workBook, res, `Thống kê đăng kí chứng nhận${' (' + startDate + ' - ' + endDate + ')'}.xlsx`);
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dashboard-chung-nhan/form-list', app.permission.check('dashboardChungNhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter;
            const data = await app.model.svManageForm.downloadExcel(filter);
            res.send({ data: data.rows });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};
