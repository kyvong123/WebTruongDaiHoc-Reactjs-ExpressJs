module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5017: { title: 'Dashboard tổng', link: '/user/finance/dashboard', icon: 'fa fa-bar-chart', backgroundColor: '#FFEB3B', color: '#000', groupIndex: 0 } },
    };

    app.permission.add(
        { name: 'tcDashboard:read', menu },
        { name: 'tcDashboard:write' },
        { name: 'tcDashboard:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDashboard', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDashboard:read', 'tcDashboard:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/dashboard', app.permission.check('tcDashboard:read'), app.templates.admin);

    //API -------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/khtc/dashboard/detail-chart', app.permission.check('tcDashboard:read'), async (req, res) => {
        try {
            let filter = req.query.filter;
            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
            if (!filter) {
                filter = { namHoc: parseInt(namHoc), hocKy: parseInt(hocKy) };
            }
            const { rows: data } = await app.model.tcHocPhiDetail.getThongKeLoaiPhiDashboard(app.utils.stringify(filter));
            res.send({ namHoc, hocKy, data });
        } catch (error) {
            console.error(req.method, req.url, error);
        }
    });

    app.get('/api/khtc/dashboard/export-detail', app.permission.check('tcDashboard:read'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter);
            if (!filter.namHoc || !filter.hocKy) {
                throw 'Dữ liệu không hợp lệ';
            }
            const { rows: data, listdongdu: listDongDu, listchuadong: listChuaDong } = await app.model.tcHocPhi.dashboardThongKeNganh(app.utils.stringify(filter));
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Danh sách thống kê tình trạng học phí khóa');
            let counter = 1;
            ws.mergeCells('A1:I1');
            ws.getCell(`A${counter}`).value = `THỐNG KÊ HỌC PHÍ KHÓA ${filter.namTuyenSinh} HỌC KỲ ${filter.hocKy} NĂM HỌC ${parseInt(filter.namHoc)} - ${parseInt(filter.namHoc) + 1}`;
            // HEADER
            counter++;
            ws.getCell(`A${counter}`).value = 'STT';
            ws.getCell(`B${counter}`).value = 'Hệ đào tạo';
            ws.getCell(`C${counter}`).value = 'Ngành đào tạo';
            ws.getCell(`D${counter}`).value = 'Số lượng SV được định phí';
            ws.getCell(`E${counter}`).value = 'Số SV đã nộp đủ';
            ws.getCell(`F${counter}`).value = 'Số SV chưa nộp đủ';
            ws.getCell(`G${counter}`).value = 'Số tiền cần nộp';
            ws.getCell(`H${counter}`).value = 'Số tiền được miễn giảm';
            ws.getCell(`I${counter}`).value = 'Số tiền đã thu';

            ws.getColumn(1).width = 20;
            ws.getColumn(2).width = 28;
            ws.getColumn(3).width = 30;
            ws.getColumn(4).width = 30;
            ws.getColumn(5).width = 30;
            ws.getColumn(6).width = 25;
            ws.getColumn(7).width = 30;
            ws.getColumn(8).width = 30;
            ws.getColumn(9).width = 30;
            ws.getColumn(10).width = 30;
            // CREATE
            const listData = data.groupBy('heDaoTao');
            for (const [index, he] of Object.keys(listData).entries()) {

                counter++;
                const dataTheoHe = listData[he];
                ws.getCell(`A${counter}`).value = app.utils.colName(index);
                ws.getCell(`B${counter}`).value = he;
                ws.getCell(`C${counter}`).value = '';
                ws.getCell(`D${counter}`).value = dataTheoHe.reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
                ws.getCell(`E${counter}`).value = listDongDu.filter(item => item.heDaoTao == he).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
                ws.getCell(`F${counter}`).value = listChuaDong.filter(item => item.heDaoTao == he).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
                ws.getCell(`G${counter}`).value = dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongSoTien), 0);
                ws.getCell(`H${counter}`).value = dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongMienGiam), 0);
                ws.getCell(`I${counter}`).value = dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongDaDong), 0);

                for (const [index, nganh] of dataTheoHe.entries()) {
                    const tenNganh = nganh.nganh;

                    counter++;
                    ws.getCell(`A${counter}`).value = index + 1;
                    ws.getCell(`B${counter}`).value = '';
                    ws.getCell(`C${counter}`).value = tenNganh;
                    ws.getCell(`D${counter}`).value = nganh.soLuongSv;
                    ws.getCell(`E${counter}`).value = listDongDu.filter(item => item.heDaoTao == he && item.nganh == tenNganh).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
                    ws.getCell(`F${counter}`).value = listChuaDong.filter(item => item.heDaoTao == he && item.nganh == tenNganh).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
                    ws.getCell(`G${counter}`).value = nganh.tongSoTien;
                    ws.getCell(`H${counter}`).value = nganh.tongMienGiam;
                    ws.getCell(`I${counter}`).value = nganh.tongDaDong;
                }
            }

            app.excel.attachment(workBook, res, 'danhSachHocPhi.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
        }
    });

    app.get('/api/khtc/dashboard/thong-ke-nganh', app.permission.check('tcDashboard:read'), async (req, res) => {
        try {
            // const filter = {
            //     namHoc: 2022,
            //     hocKy: 1,
            //     namTuyenSinh: 2022
            // };
            const filter = req.query;
            const { namHocSetting: namHoc, hocKySetting: hocKy } = await app.model.tcSetting.getSettingNamHocHocKy();

            if (!filter.namHoc) {
                filter.namHoc = namHoc;
                filter.hocKy = hocKy;
                filter.namTuyenSinh = namHoc;
            }
            const { rows: data, listdongdu: listDongDu, listchuadong: listChuaDong } = await app.model.tcHocPhi.dashboardThongKeNganh(app.utils.stringify(filter));
            // GroupBy 
            // const
            res.send({ data, listDongDu, listChuaDong, settings: { namHoc, hocKy } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};