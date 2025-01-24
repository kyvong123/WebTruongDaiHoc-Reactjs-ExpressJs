module.exports = app => {
    app.get('/api/ctsv/shcd/diem-danh/get-data', app.permission.orCheck('ctsvShcd:read', 'student:shcd-manage'), async (req, res) => {
        try {
            const { lichId, maNganh, filter } = req.query.data;
            let { rows: list } = await app.model.svShcdDiemDanh.getData(lichId, maNganh, app.utils.stringify(filter));
            res.send({ list });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/shcd/diem-danh', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { data } = req.body;
            let { mssv, id } = data;
            // kiểm tra sinh viên có trong danh sách buổi shcd hay không
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            if (listEvent.map(item => item.id).includes(parseInt(data.id))) {
                const daDiemDanh = await app.model.svShcdDiemDanh.get({ mssv, id });
                if (daDiemDanh) return res.send({ response: 'Sinh viên đã điểm danh rồi', status: 'success' });
                let item = await app.model.svShcdDiemDanh.create({ mssv, id, nguoiScanVao: req.session.user.email, thoiGianVao: Date.now() });
                return res.send({ response: 'Điểm danh thành công', status: 'success', item });
            }
            return res.send({ response: 'Sinh viên không thuộc buổi sinh họat công dân này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/diem-danh', app.permission.check('ctsvShcd:write'), async (req, res) => {
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

    app.get('/api/ctsv/shcd/diem-danh/download-excel', app.permission.check('ctsvShcd:export'), async (req, res) => {
        try {
            const { lichId, maNganh, filter, ten, nganh } = req.query.data;
            let { rows: list } = await app.model.svShcdDiemDanh.downloadExcel(lichId, maNganh, app.utils.stringify(filter));
            if (!list || !list.length) throw 'Dữ liệu bị trống!';

            const wb = app.excel.create(),
                ws = wb.addWorksheet('Danh sách điểm danh');

            ws.columns = Object.keys(list[0]).map(key => ({ header: key, key }));
            list.forEach((item) => ws.addRow(item));

            // Set width to fit
            ws.columns.forEach(function (column) {
                const lengths = column.values.map(v => v.toString().length);
                const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
                column.width = maxLength;
                column.width = maxLength < 10 ? 10 : maxLength + 5;
            });
            const buffer = await wb.xlsx.writeBuffer();
            res.send({ buffer, filename: `Điểm danh ${ten} ngành ${nganh} .xlsx` });
            // app.excel.attachment(wb, res, `Lich SHCD ${shcdData.khoaSinhVien}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/diem-danh/download-template', app.permission.check('ctsvShcd:export'), async (req, res) => {
        try {
            const { lichId, maNganh, filter } = req.query.data;
            let { rows: list } = await app.model.svShcdDiemDanh.downloadExcel(lichId, maNganh, app.utils.stringify(filter));

            const wb = app.excel.create(),
                ws = wb.addWorksheet('Danh sách điểm danh');

            ws.columns = Object.keys(list[0]).map(key => ({ header: key, key }));
            let items = [{
                'Tên sinh viên': 'Tên sinh viên',
                'MSSV': 'mssv',
                'Thời gian vào': 'hh:mm (dạng chuỗi)',
                'Thời gian ra': 'hh:mm (dạng chuỗi)',
                'Đánh giá': '1: nếu sinh viên đạt, 0 hoặc để trống: nếu sinh viên chưa đạt'
            },
            {
                'Tên sinh viên': 'Sinh viên Mẫu',
                'MSSV': '12345678',
                'Thời gian vào': '11:59',
                'Thời gian ra': '13:57',
                'Đánh giá': 1
            }
            ];
            items.map(item => ws.addRow(item));
            // Set width to fit
            ws.columns.forEach(function (column) {
                const lengths = column.values.map(v => v.toString().length);
                const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
                column.width = maxLength;
                column.width = maxLength < 10 ? 10 : maxLength + 5;
            });

            app.excel.attachment(wb, res, 'DS_Diemdanh_Template.xlsx');
            // app.excel.attachment(wb, res, `Lich SHCD ${shcdData.khoaSinhVien}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/diem-danh/update', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { id, mssv, data } = req.body;
            const checkExist = await app.model.svShcdDiemDanh.get({ id, mssv });
            let items;
            if (checkExist) {
                items = await app.model.svShcdDiemDanh.update({ id, mssv }, data);
            } else {
                items = await app.model.svShcdDiemDanh.create({ mssv, id, ...data });
            }
            return res.send({ response: 'Cập nhật danh sách điểm danh thành công', status: 'success', items });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.put('/api/ctsv/shcd/diem-danh/update-danh-sach', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { id, danhSach, nguoiScan } = req.body;
            const items = await app.model.svShcdDiemDanh.updateDanhSach(id, danhSach, nguoiScan);
            return res.send({ response: 'Cập nhật danh sách điểm danh thành công', status: 'success', items });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    //upload danh sach diem danh
    app.uploadHooks.add('uploadDsSinhVienDiemDanh', (req, fields, files, params, done) =>
        app.permission.has(req, () => ctsvKhenThuongUpDsSinhVien(req, fields, files, params, done), done, 'ctsvShcd:write'));

    const ctsvKhenThuongUpDsSinhVien = async (req, fields, files, params, done) => {
        try {
            if (files.uploadDsSinhVienDiemDanh?.length) {
                const lichId = parseInt(fields.userData[0].replace('uploadDsSinhVienDiemDanh:', ''));
                const srcPath = files.uploadDsSinhVienDiemDanh[0].path;
                const workbook = await app.excel.readFile(srcPath);
                if (!workbook) throw 'No workbook!';
                app.fs.deleteFile(srcPath);
                const worksheet = workbook.worksheets[0];
                if (!worksheet) throw 'No worksheet!';

                const lich = await app.model.svShcdLich.get({ id: lichId });
                let time = new Date(lich.timeStart),
                    year = time.getFullYear(), month = time.getMonth(), day = time.getDate();
                let danhSach = [];
                let e;
                for (let index = 2; index < worksheet.rowCount; index++) {
                    try {
                        // if (rowNumber == 1) return; //Skip header row
                        let [, ten, mssv, thoiGianVao, thoiGianRa, danhGia] = worksheet.getRow(index).values;
                        if (!ten && !mssv) continue;
                        if (thoiGianVao) {
                            const [hour, minute] = thoiGianVao.split(':');
                            if (!(new Date(+year, +month, +day, +hour, +minute)).getTime()) throw `Thời gian vào của sinh viên không hợp lệ ${thoiGianVao}`;
                            else thoiGianVao = (new Date(+year, +month, +day, +hour, +minute)).getTime();
                        }

                        if (thoiGianRa) {
                            const [hour, minute] = thoiGianRa.split(':');
                            if (!(new Date(+year, +month, +day, +hour, +minute)).getTime()) throw `Thời gian ra của sinh viên không hợp lệ: ${thoiGianRa}`;
                            else thoiGianRa = (new Date(+year, +month, +day, +hour, +minute)).getTime();
                        }
                        if (danhGia?.toString()) danhGia = danhGia.toString() == '1' ? 1 : null;

                        const item = { ten, mssv, thoiGianVao, thoiGianRa, danhGia };

                        danhSach.push(item);
                    } catch (error) {
                        error.rowNumber || console.error(error);
                        e = error;
                    }
                }
                if (e) throw e;
                else done({ danhSach });
            }
        } catch (error) {
            app.consoleError(req, error);
            done({ error });
        }
    };
};