module.exports = app => {
    app.readyHooks.add('addSocketListener:ImportDkhpExcel', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ImportDkhpExcel', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDangKyHocPhan:write')) {
                socket.join('ImportDkhpExcel');
                socket.join('ImportHuyDkhpExcel');
                socket.join('SaveImportDkhp');
            }
        }),
    });

    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('DtDangKyHocPhanData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDangKyHocPhanImportData(req, fields, files, params, done), done, 'dtDangKyHocPhan:write')
    );

    const dtDangKyHocPhanImportData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtDangKyHocPhanData' && files.DtDangKyHocPhanData && files.DtDangKyHocPhanData.length) {
            const srcPath = files.DtDangKyHocPhanData[0].path;
            const { namHoc, hocKy } = params;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [],
                        falseItem = [],
                        listData = [];
                    let index = 2;
                    try {
                        while (true) {
                            const mssv = worksheet.getCell('A' + index).text?.toString().trim() || '',
                                maHocPhan = worksheet.getCell('B' + index).text;
                            let tinhPhi = worksheet.getCell('C' + index).text?.toString().trim() || '',
                                note = worksheet.getCell('D' + index).text?.toString().trim() || '';
                            if (!mssv) break;

                            let data = { mssv, maHocPhan, tinhPhi, note, stt: index };
                            listData.push(data);
                            index++;
                        }
                        done({});
                        app.service.executeService.run({
                            email: req.session.user.email,
                            param: { listData, falseItem, items, hocKy, namHoc },
                            path: '/user/dao-tao/edu-schedule/dang-ky-hoc-phan',
                            task: 'importDkhp',
                            taskName: 'Đọc dữ liệu ĐKHP từ Excel',
                            customUrlParam: {
                                tabIndex: 2,
                            }
                        });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    app.uploadHooks.add('DtDangKyHocPhanHuyData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDangKyHocPhanImportHuy(req, fields, files, params, done), done, 'dtDangKyHocPhan:write')
    );

    const dtDangKyHocPhanImportHuy = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtDangKyHocPhanHuyData' && files.DtDangKyHocPhanHuyData && files.DtDangKyHocPhanHuyData.length) {
            const srcPath = files.DtDangKyHocPhanHuyData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const falseItem = [];
                    let index = 2;
                    try {
                        while (true) {
                            const mssv = worksheet.getCell('A' + index).text?.toString().trim() || '';
                            if (!mssv) break;
                            const maHocPhan = worksheet.getCell('B' + index).text;

                            const row = { maHocPhan, mssv, hoTen: null, isCheck: false, ghiChu: null, tenMonHoc: null, stt: index };
                            let student = await app.model.fwStudent.get({ mssv });
                            let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan });

                            if (!student && !hocPhan) {
                                row.ghiChu = 'Không tìm thấy sinh viên và học phần';
                                falseItem.push(row);
                            } else {
                                if (!student) {
                                    let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc });
                                    row.tenMonHoc = monHoc?.ten;

                                    row.ghiChu = mssv ? 'Không tìm thấy sinh viên' : 'Vui lòng nhập mã số sinh viên';
                                    falseItem.push(row);
                                } else if (!hocPhan) {
                                    row.hoTen = `${student.ho} ${student.ten}`;

                                    row.ghiChu = maHocPhan ? 'Không tìm thấy học phần' : 'Vui lòng nhập mã học phần';
                                    falseItem.push(row);
                                } else {
                                    let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc });
                                    row.tenMonHoc = monHoc?.ten;

                                    row.hoTen = `${student.ho} ${student.ten}`;

                                    let duplicate = false,
                                        viTri = 0;
                                    if (items.length > 0) {
                                        for (let i = 0; i < items.length; i++) {
                                            if (mssv == items[i].mssv && maHocPhan == items[i].maHocPhan) {
                                                duplicate = true;
                                                viTri = items[i].stt;
                                                break;
                                            }
                                        }
                                    }
                                    if (duplicate == true) {
                                        row.ghiChu = 'Trùng dữ liệu nhập với hàng ' + viTri;
                                        falseItem.push(row);
                                    } else {
                                        let dangKy = await app.model.dtDangKyHocPhan.get({ mssv, maHocPhan });
                                        if (!dangKy) {
                                            row.ghiChu = 'Sinh viên chưa đăng ký học phần này';
                                            falseItem.push(row);
                                        } else {
                                            let lichThi = await app.model.dtExam.getAll({ maHocPhan });
                                            let diem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv });

                                            if (lichThi.length) {
                                                row.ghiChu = 'Học phần đã được xếp lịch thi';
                                                falseItem.push(row);
                                            } else if (diem.length) {
                                                row.ghiChu = 'Sinh viên đã có điểm trong lớp học phần';
                                                falseItem.push(row);
                                            } else {
                                                row.ghiChu = worksheet.getCell('C' + index).text?.toString().trim() || '';
                                                row.isCheck = true;
                                                items.push(row);
                                            }
                                        }
                                    }
                                }
                            }
                            index++;
                            if (index % 10 == 0) app.io.to('ImportHuyDkhpExcel').emit('import-huy-single-done', { requester: req.session.user.email, items, falseItem, index });
                        }
                        app.io.to('ImportHuyDkhpExcel').emit('import-huy-all-done', { requester: req.session.user.email, items, falseItem });
                        done({ items, falseItem });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    //Export xlsx
    app.get('/api/dt/dang-ky-hoc-phan/download-template', app.permission.check('dtDangKyHocPhan:export'), async (req, res) => {
        const workBook = app.excel.create();
        const wsDK = workBook.addWorksheet('Dang_ky_hoc_phan_Template');
        const defaultColumnsDK = [
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'MÃ HỌC PHẦN', key: 'maHocPhan', width: 20 },
            { header: 'TÍNH PHÍ', key: 'tinhPhi', width: 10 },
            { header: 'GHI CHÚ', key: 'ghiChu', width: 10 },
        ];
        wsDK.columns = defaultColumnsDK;

        app.excel.attachment(workBook, res, 'Dang_ky_hoc_phan_Template.xlsx');
    });

    app.get('/api/dt/dang-ky-hoc-phan/download-huy-template', app.permission.check('dtDangKyHocPhan:export'), async (req, res) => {
        const workBook = app.excel.create();
        const wsDK = workBook.addWorksheet('Huy_dang_ky_hoc_phan_Template');
        const defaultColumnsDK = [
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'MÃ HỌC PHẦN', key: 'maHocPhan', width: 20 },
            { header: 'GHI CHÚ', key: 'ghiChu', width: 40 },

        ];
        wsDK.columns = defaultColumnsDK;

        app.excel.attachment(workBook, res, 'Huy_dang_ky_hoc_phan_Template.xlsx');
    });

    const getFullDateTime = async (value) => {
        try {
            if (value == null || value == -1) return;
            const d = new Date(value);
            const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
            const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
            const year = d.getFullYear();
            const hours = ('0' + d.getHours()).slice(-2);
            const minutes = ('0' + d.getMinutes()).slice(-2);
            return `${date}/${month}/${year}  ${hours}:${minutes} `;
        } catch (error) {
            return error;
        }
    };

    const getLoaiDangKy = async (value) => {
        try {
            if (value == 'KH') return 'Theo kế hoạch';
            else if (value == 'NKH') return 'Ngoài kế hoạch';
            else if (value == 'NCTDT') return 'Ngoài CTĐT';
            else if (value == 'CT') return 'Cải thiện';
            else if (value == 'HL') return 'Học lại';
            else if (value == 'HV') return 'Học vượt';
            else return '';
        } catch (error) {
            return error;
        }
    };

    app.get('/api/dt/dang-ky-hoc-phan/download-danh-sach-dang-ky', app.permission.check('dtDangKyHocPhan:export'), async (req, res) => {
        try {
            let { ngayBatDau, ngayKetThuc } = req.query;
            let filter = { ngayBatDau, ngayKetThuc };
            filter = app.utils.stringify(app.clone(filter, { sortKey: 'thoiGianDangKy', sortMode: 'ASC' }));
            let list = await app.model.dtDangKyHocPhan.timeDownload(filter);
            ngayBatDau = await getFullDateTime(parseInt(ngayBatDau));
            ngayKetThuc = await getFullDateTime(parseInt(ngayKetThuc));

            const workBook = app.excel.create(),
                worksheet = workBook.addWorksheet('Danh_sach_dang_ky_hoc_phan');
            let cells = [
                { cell: 'C1', value: 'Ngày bắt đầu: ' + ngayBatDau },
                { cell: 'F1', value: 'Ngày kết thúc: ' + ngayKetThuc },

                { cell: 'A3', value: '#', bold: true, border: '1234' },
                { cell: 'B3', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'C3', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                { cell: 'D3', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                { cell: 'E3', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'F3', value: 'TÊN MÔN', bold: true, border: '1234' },
                { cell: 'G3', value: 'LOẠI ĐĂNG KÝ', bold: true, border: '1234' },
                { cell: 'H3', value: 'THỜI GIAN ĐĂNG KÝ', bold: true, border: '1234' },
                { cell: 'I3', value: 'MÃ PSC', bold: true, border: '1234' }
            ];
            for (let [index, item] of list.rows.entries()) {
                let length = item.maHocPhan.length;
                let maHocPhan = item.maHocPhan.substr(0, length - 3) + item.maHocPhan.substr(length - 2);
                let loaiDangKy = await getLoaiDangKy(item.loaiDangKy);
                let thoiGianDangKy = await getFullDateTime(item.thoiGianDangKy);
                cells.push({ cell: 'A' + (index + 4), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 4), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 4), border: '1234', value: item.hoTen });
                cells.push({ cell: 'D' + (index + 4), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'E' + (index + 4), border: '1234', value: item.maMonHoc });
                cells.push({ cell: 'F' + (index + 4), border: '1234', value: app.utils.parse(item.tenMon, { vi: '' })?.vi });
                cells.push({ cell: 'G' + (index + 4), border: '1234', value: loaiDangKy });
                cells.push({ cell: 'H' + (index + 4), border: '1234', value: thoiGianDangKy });
                cells.push({ cell: 'I' + (index + 4), border: '1234', value: maHocPhan });
            }
            app.excel.write(worksheet, cells);
            app.excel.attachment(workBook, res, 'Danh_sach_dang_ky_hoc_phan.xlsx');

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/export-ket-qua-dang-ky', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:export'), async (req, res) => {
        try {
            const { filter } = req.query,
                { namHoc, hocKy, mssvFilter } = JSON.parse(filter);

            const data = await app.model.dtDangKyHocPhan.generatePdfDkhpFile(mssvFilter, namHoc, hocKy);
            res.download(data.filePdfPath, 'KetQuaDangKyMonHoc.pdf');
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};