module.exports = app => {
    const menuTotNghiep = {
        parentMenu: app.parentMenu.students,
        menus: {
            6146: { title: 'Thống kê tốt nghiệp', parentKey: 6155, icon: 'fa-bar-chart-o', link: '/user/ctsv/thong-ke-tot-nghiep', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvThongKeTotNghiep:manage', menu: menuTotNghiep },
        'ctsvThongKeTotNghiep:write',
    );

    app.permissionHooks.add('staff', 'addRoleCtsvThongKeTotNghiep', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvThongKeTotNghiep:manage', 'ctsvThongKeTotNghiep:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/thong-ke-tot-nghiep', app.permission.check('ctsvThongKeTotNghiep:manage'), app.templates.admin);

    // API ========================================================================================


    app.get('/api/ctsv/thong-ke-tot-nghiep/all', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const items = await app.model.svTotNghiep.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-tot-nghiep/page', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, filter } = req.query;
            const _page = await app.model.svTotNghiep.searchPage(parseInt(_pageNumber), parseInt(_pageSize), '', app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-khoa', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { filter } = req.query;
            const thongKe = await app.model.svTotNghiep.getThongKeTheoKhoaData(app.utils.stringify(filter));
            res.send({ thongKe });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-loai-hinh-dao-tao', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { filter } = req.query;
            const thongKeLHDTData = await app.model.svTotNghiep.getThongKeTheoLHDTData(app.utils.stringify(filter));
            res.send({ thongKeLHDTData });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-xep-loai', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { filter } = req.query;
            const thongKeTheoXepLoaiData = await app.model.svTotNghiep.getThongKeTheoXepLoaiData(app.utils.stringify(filter));
            res.send({ thongKeTheoXepLoaiData });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-tot-nghiep/item', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { mssv } = req.query,
                item = await app.model.svTotNghiep.get({ mssv });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/thong-ke-tot-nghiep', app.permission.check('ctsvThongKeTotNghiep:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svTotNghiep.create(data);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/thong-ke-tot-nghiep', app.permission.check('ctsvThongKeTotNghiep:write'), async (req, res) => {
        try {
            const { mssv, changes } = req.body;
            const item = await app.model.svTotNghiep.update({ mssv }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-khoa', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { xKey, yKey, filter } = req.query;
            const { rows: data } = await app.model.svTotNghiep.getThongKeTheoKhoaData(app.utils.stringify(filter));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Result');

            let xSet = new Set(), //Ten cot
                ySet = new Set();  //Ten hang
            data.forEach(item => {
                xSet.add(item[xKey]); ySet.add(item[yKey]);
            });
            xSet = [...xSet].filter(item => !!item).sort();
            ySet = [...ySet].filter(item => !!item).sort();

            ws.columns = [{ header: '', key: 'yKey', width: '20' }, ...xSet.map(xVal => ({ header: xVal, key: xVal, width: xVal.toString().length }))];
            ySet.forEach(yVal => {
                ws.addRow(
                    Object.assign({ yKey: yVal }, ...xSet.map(xVal => ({
                        [xVal]: data.filter(item => item[xKey] == xVal && item[yKey] == yVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0)
                    }))));
            });
            // Build summary
            ws.addRow({
                yKey: 'Tổng cộng', ...Object.assign({}, ...xSet.map(xVal => ({ [xVal]: data.filter(item => item[xKey] == xVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0) })))
            });
            // Sendback result
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-he-dao-tao', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { xKey, yKey, filter } = req.query;
            const { rows: data } = await app.model.svTotNghiep.getThongKeTheoLHDTData(app.utils.stringify(filter));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Result');

            let xSet = new Set(), //Ten cot
                ySet = new Set();  //Ten hang
            data.forEach(item => {
                xSet.add(item[xKey]); ySet.add(item[yKey]);
            });
            xSet = [...xSet].filter(item => !!item).sort();
            ySet = [...ySet].filter(item => !!item).sort();

            ws.columns = [{ header: '', key: 'yKey', width: '20' }, ...xSet.map(xVal => ({ header: xVal, key: xVal, width: xVal.toString().length }))];
            ySet.forEach(yVal => {
                ws.addRow(
                    Object.assign({ yKey: yVal }, ...xSet.map(xVal => ({
                        [xVal]: data.filter(item => item[xKey] == xVal && item[yKey] == yVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0)
                    }))));
            });
            // Build summary
            ws.addRow({
                yKey: 'Tổng cộng', ...Object.assign({}, ...xSet.map(xVal => ({ [xVal]: data.filter(item => item[xKey] == xVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0) })))
            });
            // Sendback result
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-xep-loai', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { xKey, yKey, filter } = req.query;
            const { rows: data } = await app.model.svTotNghiep.getThongKeTheoXepLoaiData(app.utils.stringify(filter));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Result');

            let xSet = new Set(), //Ten cot
                ySet = new Set();  //Ten hang
            data.forEach(item => {
                xSet.add(item[xKey]); ySet.add(item[yKey]);
            });
            xSet = [...xSet].filter(item => !!item).sort();
            ySet = [...ySet].filter(item => !!item).sort();

            ws.columns = [{ header: '', key: 'yKey', width: '20' }, ...xSet.map(xVal => ({ header: xVal, key: xVal, width: xVal.toString().length }))];
            ySet.forEach(yVal => {
                ws.addRow(
                    Object.assign({ yKey: yVal }, ...xSet.map(xVal => ({
                        [xVal]: data.filter(item => item[xKey] == xVal && item[yKey] == yVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0)
                    }))));
            });
            // Build summary
            ws.addRow({
                yKey: 'Tổng cộng', ...Object.assign({}, ...xSet.map(xVal => ({ [xVal]: data.filter(item => item[xKey] == xVal).reduce((totalValue, item) => item.tongSinhVien + totalValue, 0) })))
            });
            // Sendback result
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/thong-ke-tot-nghiep/download-excel', app.permission.check('ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const { pageCondition, filter } = req.query;
            const { rows: data } = await app.model.svTotNghiep.downloadExcel(pageCondition, app.utils.stringify(filter));
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SV_TOT_NGHIEP');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 6, height: 30, vertical: 'middle' },
                { header: 'MSSV', key: 'mssv', width: 15, height: 30 },
                { header: 'Ngày Tốt Nghiệp', key: 'ngayTotNghiep', width: 20, height: 30 },
                { header: 'Đợt Tốt Nghiệp', key: 'tenDotTotNghiep', width: 15, wrapText: false, height: 30 },
                { header: 'Niên Khoá', key: 'khoaSinhVien', width: 20, height: 30 },
                { header: 'Hệ Đào Tạo', key: 'tenLoaiHinhDaoTao', width: 20, height: 30 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };

            data.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    mssv: item.mssv,
                    ngayTotNghiep: item.ngayTotNghiep ? app.date.viDateFormat(new Date(Number(item.ngayTotNghiep))) : '',
                    tenDotTotNghiep: item.tenDotTotNghiep,
                    khoaSinhVien: item.khoaSinhVien,
                    tenLoaiHinhDaoTao: item.tenLoaiHinhDaoTao,
                }, 'i');
            });

            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};