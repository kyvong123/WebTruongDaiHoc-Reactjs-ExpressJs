module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.giangVien,
        menus: {
            7622: {
                title: 'Thời khoá biểu',
                link: '/user/affair/lich-giang-day', icon: 'fa-bookmark', backgroundColor: '#2cf58a'
            }
        }
    };
    app.permission.add(
        { name: 'gvLichGiangDay:manage', menu },
        { name: 'staff:teacher', menu },
        { name: 'gvLichGiangDay:write' },
        { name: 'gvLichGiangDay:delete' },
        { name: 'gvLichGiangDay:export' },
    );

    app.get('/user/affair/lich-giang-day', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), app.templates.admin);
    app.get('/user/affair/lich-giang-day/detail/:maHocPhan', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/dt/gv/lich-giang-day/page/:pageNumber/:pageSize', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
    //     try {
    //         let id = req.session.user.shcc,
    //             filter = req.query.filter || {};
    //         filter = app.utils.stringify(app.clone(filter));
    //         const _pageNumber = parseInt(req.params.pageNumber),
    //             _pageSize = parseInt(req.params.pageSize);
    //         const page = await app.model.dtThoiKhoaBieuGiangVien.searchPage(_pageNumber, _pageSize, id, filter);
    //         const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //         res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
    //     } catch (error) {
    //         res.send(error);
    //     }
    // });

    // app.get('/api/dt/gv/thoi-khoa-bieu/export', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const { filter } = req.query,
    //             { shcc, firstName = '', lastName = '' } = req.session.user,
    //             { namHoc, hocKy } = filter;

    //         const source = app.path.join(__dirname, './resource', 'lichDayTemplate.docx');

    //         const items = await app.model.dtThoiKhoaBieuGiangVien.getData(shcc, app.utils.stringify(filter));

    //         let dataExport = {
    //             hoTen: `${lastName} ${firstName}`, namHoc, hocKy,
    //             R: items.rows.map((i, index) => ({
    //                 maHocPhan: i.maHocPhan, tenHocPhan: JSON.parse(i.tenMonHoc || '{"vi":""}')?.vi,
    //                 bd: i.ngayBatDau ? app.date.viDateFormat(new Date(i.ngayBatDau)) : '',
    //                 kt: i.ngayKetThuc ? app.date.viDateFormat(new Date(i.ngayKetThuc)) : '',
    //                 loaiHinh: i.loaiHinhDaoTao, coSo: i.coSo, phong: i.phong, thu: i.thu, tongTiet: i.tongTiet,
    //                 tiet: i.tietBatDau && i.soTietBuoi ? `${i.tietBatDau} - ${Number(i.tietBatDau) + Number(i.soTietBuoi) - 1}` : '', i: index + 1,
    //             })),
    //         };

    //         const buffer = await app.docx.generateFile(source, dataExport);
    //         const pdfBuffer = await app.docx.toPdfBuffer(buffer);
    //         res.send({ buffer: pdfBuffer });
    //     } catch (error) {
    //         console.error(error);
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/get-lich', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
    //     try {
    //         let user = req.session.user, shcc = user.shcc;
    //         const items = await app.model.dtThoiKhoaBieuGiangVien.getData(shcc, app.utils.stringify(req.query.filter));
    //         res.send({ items: items.rows });
    //     } catch (error) {
    //         res.send(error);
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/get-lich-hoc-phan', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
    //     try {
    //         let maHocPhan = req.query.maHocPhan;
    //         let [data, listTuanHoc, infoHocPhan] = await Promise.all([
    //             app.model.dtThoiKhoaBieu.getData(maHocPhan),
    //             app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({})),
    //             app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
    //         ]);

    //         listTuanHoc = listTuanHoc.rows.map(tuan => {
    //             let giangVien = data.datateacher.filter(item => item.type == 'GV' && item.idThoiKhoaBieu == tuan.idThoiKhoaBieu && item.ngayBatDau == tuan.ngayBatDau && item.ngayKetThuc == tuan.ngayKetThuc).map(item => item.hoTen);
    //             let troGiang = data.datateacher.filter(item => item.type == 'TG' && item.idThoiKhoaBieu == tuan.idThoiKhoaBieu && item.ngayBatDau == tuan.ngayBatDau && item.ngayKetThuc == tuan.ngayKetThuc).map(item => item.hoTen);

    //             let shccGiangVien = data.datateacher.filter(item => item.type == 'GV' && item.idThoiKhoaBieu == tuan.idThoiKhoaBieu && item.ngayBatDau == tuan.ngayBatDau && item.ngayKetThuc == tuan.ngayKetThuc).map(item => item.shcc);
    //             let shccTroGiang = data.datateacher.filter(item => item.type == 'TG' && item.idThoiKhoaBieu == tuan.idThoiKhoaBieu && item.ngayBatDau == tuan.ngayBatDau && item.ngayKetThuc == tuan.ngayKetThuc).map(item => item.shcc);

    //             return { ...tuan, giangVien, troGiang, shccGiangVien, shccTroGiang };
    //         });

    //         res.send({
    //             fullData: data.rows, isAdjust: listTuanHoc.length, infoHocPhan: infoHocPhan.rows[0],
    //             dataTiet: data.datacahoc, listNgayLe: data.datangayle, dataTeacher: data.datateacher,
    //             dataNgayNghi: data.datangaynghi, dataNgayBu: data.datangaybu, listTuanHoc,
    //         });
    //     } catch (error) {
    //         res.send(error);
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/hocPhan/student-list', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let { maHocPhan, filter } = req.query;
    //         let items = await app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify(filter));
    //         items = items.rows.map(item => ({
    //             ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
    //             timeModified: app.utils.parse(item.timeModified), userModified: app.utils.parse(item.userModified)
    //         }));
    //         res.send({ items });
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/sinh-vien/download-dssv-hoc-phan', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let hocPhan = app.utils.parse(req.query.hocPhan, {});
    //         const listSV = await app.model.dtDangKyHocPhan.getStudent(hocPhan.maHocPhan, app.utils.stringify({}), 'ten', 'ASC');
    //         const workbook = app.excel.create(),
    //             worksheet = workbook.addWorksheet(hocPhan.maHocPhan);
    //         let cells = [
    //             { cell: 'A1', value: 'Môn: ' + app.utils.parse(hocPhan.tenMonHoc, { vi: '' })?.vi },
    //             { cell: 'C1', value: 'Lớp: ' + hocPhan.maLop },
    //             { cell: 'E1', value: 'Năm học: ' + hocPhan.namHoc },
    //             { cell: 'F1', value: 'Học kỳ: ' + hocPhan.hocKy },

    //             { cell: 'A2', value: 'Mã môn học: ' + hocPhan.maMonHoc },
    //             { cell: 'C2', value: 'Mã học phần: ' + hocPhan.maHocPhan },

    //             { cell: 'A3', value: 'Khoá sinh viên: ' + hocPhan.khoaSinhVien },
    //             { cell: 'C3', value: 'Loại hình đào tạo: ' + hocPhan.loaiHinhDaoTao },
    //             { cell: 'E3', value: 'Khoa, bộ môn: ' + hocPhan.tenKhoaBoMon },


    //             { cell: 'A4', value: 'Phòng: ' + hocPhan.phong },
    //             { cell: 'C4', value: 'Thứ: ' + hocPhan.thu },
    //             { cell: 'E4', value: 'Tiết bắt đầu: Tiết ' + hocPhan.tietBatDau },

    //             { cell: 'A6', value: 'STT', bold: true, border: '1234' },
    //             { cell: 'B6', value: 'MSSV', bold: true, border: '1234' },
    //             { cell: 'C6', value: 'HỌ', bold: true, border: '1234' },
    //             { cell: 'D6', value: 'TÊN', bold: true, border: '1234' },
    //             { cell: 'E6', value: 'LỚP', bold: true, border: '1234' },
    //             { cell: 'F6', value: 'KHOÁ SINH VIÊN', bold: true, border: '1234' },
    //             { cell: 'G6', value: 'LOẠI HÌNH ĐÀO TẠO', bold: true, border: '1234' },
    //             { cell: 'H6', value: 'NGÀNH', bold: true, border: '1234' },
    //             { cell: 'I6', value: 'ĐIỂM GIỮA KỲ', bold: true, border: '1234' },
    //             { cell: 'J6', value: 'ĐIỂM CUỐI KỲ', bold: true, border: '1234' },
    //             { cell: 'K6', value: 'ĐIỂM TỔNG KẾT', bold: true, border: '1234' },
    //         ];
    //         for (let [index, item] of listSV.rows.entries()) {
    //             cells.push({ cell: 'A' + (index + 7), border: '1234', number: index + 1 });
    //             cells.push({ cell: 'B' + (index + 7), border: '1234', value: item.mssv });
    //             cells.push({ cell: 'C' + (index + 7), border: '1234', value: item.ho });
    //             cells.push({ cell: 'D' + (index + 7), border: '1234', value: item.ten });
    //             cells.push({ cell: 'E' + (index + 7), border: '1234', value: item.lop });
    //             cells.push({ cell: 'F' + (index + 7), border: '1234', value: item.khoaSinhVien });
    //             cells.push({ cell: 'G' + (index + 7), border: '1234', value: item.loaiHinhDaoTao });
    //             cells.push({ cell: 'H' + (index + 7), border: '1234', value: item.tenNganh });
    //             cells.push({ cell: 'I' + (index + 7), border: '1234', value: item.diemGk });
    //             cells.push({ cell: 'J' + (index + 7), border: '1234', value: item.diemCk });
    //             cells.push({ cell: 'K' + (index + 7), border: '1234', value: item.diemTk });
    //         }
    //         app.excel.write(worksheet, cells);
    //         app.excel.attachment(workbook, res, `${hocPhan.maHocPhan}_${app.utils.parse(hocPhan.tenMonHoc, { vi: '' })?.vi}.xlsx`);
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/diem-danh', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let maHocPhan = req.query.maHocPhan;

    //         const [dataTuan, listStudent, dataDiemDanh] = await Promise.all([
    //             app.model.dtThoiKhoaBieuCustom.getAll({ maHocPhan }, '*', 'id'),
    //             app.model.dtDangKyHocPhan.getStudent(maHocPhan, app.utils.stringify({}), 'ASC', 'mssv'),
    //             app.model.dtThoiKhoaBieuDiemDanh.getAll({ maHocPhan })
    //         ]);

    //         res.send({ dataTuan, listStudent: listStudent.rows, dataDiemDanh: dataDiemDanh.map(i => ({ ...i, listTuan: i.listTuan ? i.listTuan.split(',') : [] })) });
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.post('/api/dt/gv/lich-giang-day/diem-danh/vang', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const { data } = req.body,
    //             { mssv, maHocPhan, ghiChu, listTuan } = data;

    //         await app.model.dtThoiKhoaBieuDiemDanh.delete({ mssv, maHocPhan });
    //         await app.model.dtThoiKhoaBieuDiemDanh.create({ mssv, maHocPhan, ghiChu, listTuan, userModified: req.session.user.email, timeModified: Date.now() });

    //         res.end();
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.post('/api/dt/gv/lich-giang-day/diem-danh/ghi-chu', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const { maHocPhan, data = [] } = req.body;

    //         for (let item of data) {
    //             const { mssv, ghiChu, listTuan } = item;

    //             await app.model.dtThoiKhoaBieuDiemDanh.delete({ mssv, maHocPhan });
    //             await app.model.dtThoiKhoaBieuDiemDanh.create({ mssv, maHocPhan, ghiChu, listTuan, userModified: req.session.user.email, timeModified: Date.now() });
    //         }

    //         res.end();
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/danh-sach-thi', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const kyThiMapper = {
    //             'DS': 'DANH SÁCH LỚP',
    //             'CK': 'THI CUỐI KỲ',
    //             'GK': 'THI GIỮA KỲ',
    //         };
    //         app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-thi'));

    //         const { maHocPhan, kyThi, namHoc, hocKy, tenKyThi, phanTram } = app.utils.parse(req.query.data);

    //         let [dataAll, listDinhChi] = await Promise.all([
    //             app.model.dtDiem.getDataThi(JSON.stringify({ listMaHocPhan: maHocPhan, kyThi, namHocHocPhi: namHoc, hocKyHocPhi: hocKy })),
    //             app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi }),
    //         ]),
    //             dataHocPhan = dataAll.rows[0],
    //             { tenNganh, tenMonHoc, tenHe, ngayBatDau, ngayKetThuc, lichThi, listNienKhoa } = dataHocPhan || {},
    //             dataToPrint = [], printTime = new Date();

    //         const dataPrint = { maHocPhan, kyThi, namHoc, hocKy, tenKyThi, tyLeDiem: phanTram };
    //         dataPrint.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
    //         dataPrint.tenHe = tenHe || '';
    //         dataPrint.listNienKhoa = listNienKhoa || '';
    //         dataPrint.tenNganh = tenNganh || '';
    //         dataPrint.titleThi = kyThiMapper[kyThi];
    //         dataPrint.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
    //         dataPrint.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
    //         if (dataPrint.ngayBatDau && dataPrint.ngayKetThuc) dataPrint.ngayBatDau = `${dataPrint.ngayBatDau} - `;

    //         lichThi = lichThi ? JSON.parse(lichThi).filter(item => item.kyThi == kyThi) : [];
    //         const outputFolder = app.path.join(app.assetPath, 'bang-diem-thi', `${printTime.getTime()}`);
    //         app.fs.createFolder(outputFolder);

    //         if (lichThi.length) {
    //             let listIdExam = lichThi.map(item => item.idExam);
    //             // listStudent = listStudent.filter(item => item.idExam && listIdExam.includes(item.idExam));
    //             for (let idExam of listIdExam) {
    //                 let { batDau, ketThuc, phong } = lichThi.find(item => item.idExam == idExam),
    //                     page = 0,
    //                     listStudentExam = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });

    //                 listStudentExam = await Promise.all(listStudentExam.sort((a, b) => a.mssv - b.mssv).map(async stu => {
    //                     let maHocPhanThi = maHocPhan;
    //                     if (stu.idDinhChiThi) {
    //                         await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => maHocPhanThi = dinhChi.maHocPhan);
    //                     }
    //                     let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ student: stu.mssv, maHocPhan: maHocPhanThi }));
    //                     return { ...dataStu.rows[0], ...stu };
    //                 }));

    //                 listStudentExam = listStudentExam.map((item, index) => ({
    //                     ...item, R: index + 1,
    //                     ho: item.ho.replaceAll('&apos;', '\''),
    //                     ten: item.ten.replaceAll('&apos;', '\''),
    //                 }));

    //                 while (listStudentExam.length) {
    //                     page = page + 1;
    //                     let dataStudent = listStudentExam.splice(0, 28);
    //                     dataToPrint.push({
    //                         ...dataPrint, page, idExam,
    //                         ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
    //                         gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
    //                         phongThi: phong, a: dataStudent
    //                     });
    //                 }
    //                 dataToPrint = dataToPrint.map(data => {
    //                     return data.idExam == idExam ? { ...data, pageTotal: page } : data;
    //                 });
    //             }

    //         } else {
    //             let listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
    //             listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id }));

    //             listStudent.push(...listDinhChi);

    //             listStudent = await Promise.all(listStudent.sort((a, b) => a.mssv - b.mssv).map(async stu => {
    //                 let maHocPhanThi = maHocPhan;
    //                 if (stu.idDinhChiThi) {
    //                     await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => maHocPhanThi = dinhChi.maHocPhan);
    //                 }
    //                 let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ student: stu.mssv, maHocPhan: maHocPhanThi }));
    //                 return { ...dataStu.rows[0], ...stu };
    //             }));

    //             listStudent = listStudent.map((item, index) => ({
    //                 ...item, R: index + 1,
    //                 ho: item.ho.replaceAll('&apos;', '\''),
    //                 ten: item.ten.replaceAll('&apos;', '\''),
    //             }));

    //             let page = 0;
    //             while (listStudent.length) {
    //                 page = page + 1;
    //                 let dataStudent = listStudent.splice(0, 28);
    //                 dataToPrint.push({ ...dataPrint, page, ngayThi: '', phongThi: '', gioThi: '', a: dataStudent });
    //             }
    //             dataToPrint = dataToPrint.map(data => {
    //                 return data.maHocPhan == maHocPhan ? { ...data, pageTotal: page } : data;
    //             });
    //         }

    //         dataToPrint = dataToPrint.map((item, index) => ({
    //             ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
    //         }));

    //         const source = app.path.join(__dirname, './resource', 'FormExam.docx');
    //         let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') })
    //             .then(buf => {
    //                 let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
    //                 app.fs.writeFileSync(filepath, buf);
    //                 return filepath;
    //             })
    //         ));
    //         let mergedPath = app.path.join(app.assetPath, 'bang-diem-thi', `output_${printTime.getTime()}.pdf`);
    //         await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
    //         app.fs.deleteFolder(outputFolder);
    //         res.download(mergedPath, `${maHocPhan}-${kyThi}.pdf`);
    //     } catch (error) {
    //         res.send({ error });
    //         console.error(req.method, req.url, { error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/download-diem-danh', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let maHocPhan = req.query.maHocPhan;

    //         const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
    //             worksheet = workBook.getWorksheet(1);

    //         let cells = await app.model.dtThoiKhoaBieuGiangVien.exportDiemDanh(maHocPhan, worksheet);
    //         app.excel.write(worksheet, cells);
    //         app.excel.attachment(workBook, res, `BDDD_${maHocPhan}.xlsx`);
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/download-lich-day', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let { dataHocPhan } = req.query;
    //         dataHocPhan = app.utils.parse(dataHocPhan);

    //         const { maHocPhan } = dataHocPhan;

    //         const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
    //             worksheet = workBook.getWorksheet(1);

    //         let cells = await app.model.dtThoiKhoaBieuGiangVien.exportLichDay(maHocPhan, worksheet);

    //         app.excel.write(worksheet, cells);
    //         app.excel.attachment(workBook, res, `LICH_DAY_${maHocPhan}.xlsx`);
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/lich-giang-day/download-dssv', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let maHocPhan = req.query.maHocPhan;
    //         const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
    //             worksheet = workBook.getWorksheet(1);

    //         let cells = await app.model.dtThoiKhoaBieuGiangVien.exportDanhSachSinhVien(maHocPhan, worksheet);

    //         app.excel.write(worksheet, cells);
    //         app.excel.attachment(workBook, res, `Danh_Sach_Sinh_Vien_${maHocPhan}.xlsx`);
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.post('/api/dt/gv/lich-giang-day/cau-hinh-thanh-phan-diem', app.permission.orCheck('staff:teacher'), async (req, res) => {
    //     try {
    //         let { dataHocPhan, dataThanhPhan } = req.body,
    //             { maHocPhan, maMonHoc, namHoc, hocKy } = dataHocPhan,
    //             modifier = req.session.user.email,
    //             lastModified = Date.now();

    //         let [dataTP, dataAssign] = await Promise.all([
    //             app.model.dtDiemConfigHocPhan.getAll({ maHocPhan, maMonHoc }),
    //             app.model.dtAssignRoleNhapDiem.getAll({ maHocPhan, maMonHoc }, 'namHoc, maHocPhan, maMonHoc, hocKy, kyThi, idExam, loaiHinhDaoTao, shcc, userModified, timeModified')
    //         ]);

    //         dataThanhPhan.sort((a, b) => a.priority - b.priority);

    //         await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
    //         for (let thanhPhan of dataThanhPhan) {
    //             let { loaiThanhPhan, phanTram, loaiLamTron = '0.5' } = thanhPhan;
    //             let thi = dataTP.find(i => i.loaiThanhPhan == loaiThanhPhan);
    //             await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan, phanTram, modifier, lastModified, loaiLamTron, hinhThucThi: thi?.hinhThucThi || '' });
    //         }

    //         let listStudent = [];

    //         let [listDangKy, listDinhChi] = await Promise.all([
    //             app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
    //             app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan }, 'mssv, namHoc, hocKy, maHocPhan, id'),
    //         ]);

    //         listStudent.push(...listDangKy, ...listDinhChi);

    //         await Promise.all(listStudent.map(async stu => {
    //             let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv: stu.mssv };

    //             if (stu.id) {
    //                 condition.maHocPhan = stu.maHocPhan;
    //                 condition.namHoc = stu.namHoc;
    //                 condition.hocKy = stu.hocKy;
    //             }
    //             const allDiem = await app.model.dtDiemAll.getAll(condition);
    //             if (allDiem.length) {
    //                 await app.model.dtDiemAll.delete(condition);

    //                 for (let tp of dataThanhPhan) {
    //                     let { loaiThanhPhan, phanTram } = tp;
    //                     const exist = allDiem.find(i => i.loaiDiem == loaiThanhPhan);
    //                     if (exist) {
    //                         await app.model.dtDiemAll.create({ ...condition, loaiDiem: loaiThanhPhan, phanTramDiem: phanTram, diem: exist.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '' });
    //                     }
    //                 }

    //                 await Promise.all(allDiem.map(item => app.model.dtDiemHistory.create({ ...condition, loaiDiem: item.loaiDiem, oldDiem: item.diem ?? '', newDiem: dataThanhPhan.find(i => i.loaiThanhPhan == item.loaiDiem) ? (item.diem ?? '') : '', phanTramDiem: item.phanTram, hinhThucGhi: 5, userModified: modifier, timeModified: lastModified })));

    //                 const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

    //                 if (isTK) {
    //                     await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
    //                 } else {
    //                     await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
    //                 }
    //             }
    //         }));

    //         await app.model.dtAssignRoleNhapDiem.delete({ maHocPhan, maMonHoc });
    //         let listTpAssign = await app.model.dtAssignRoleNhapDiem.parseData({ maHocPhan, namHoc, hocKy });
    //         for (let data of listTpAssign.filter(i => i.thanhPhan)) {
    //             let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified: lastModified, loaiDiem: data.thanhPhan });
    //             if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...data }, modifier);

    //             if (data.thanhPhan == 'CK') {
    //                 await Promise.all(dataAssign.filter(i => data.idExam ? (i.idExam == data.idExam) : (i.kyThi == 'CK')).map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign })));
    //             } else {
    //                 let list = dataAssign.filter(i => i.kyThi != 'CK');
    //                 if (data.thanhPhan != 'GK') {
    //                     list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
    //                     await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, idExam: '', kyThi: data.thanhPhan })));
    //                 }
    //                 else {
    //                     list = list.filter(i => !i.idExam || i.idExam == data.idExam);
    //                     list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
    //                     await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, kyThi: 'GK', idExam: data.idExam || '' })));
    //                 }
    //             }
    //         }

    //         const allRole = await app.model.dtAssignRoleNhapDiem.getAll({ shcc: req.session.user.shcc, maHocPhan }, '*', 'id');
    //         res.send({ allRole });
    //     } catch (error) {
    //         console.error(error);
    //         res.send({ error });
    //     }
    // });
};