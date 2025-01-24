module.exports = app => {
    app.permission.add({ name: 'quanLyDaoTao:Test' });
    const bwipjs = require('bwip-js');
    app.get('/api/dt/gv/instruction/page/:pageNumber/:pageSize', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);

            const page = await app.model.gvInstruction.getPage(pageNumber, pageSize, { isGv: 1 });
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/instruction/:id', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const instruction = await app.model.gvInstruction.get({ id });
            if (!instruction) throw { message: 'Hướng dẫn sử dụng không tồn tại' };
            res.send({ item: instruction });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/gv/instruction', app.permission.orCheck('developer:login', 'staff:teacher'), async (req, res) => {
        try {
            const { id, changes } = req.body,
                { noiDung, tieuDe } = changes;

            app.model.gvInstruction.update({ id }, { noiDung, tieuDe });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/instruction', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
        try {
            const data = req.body.data,
                { tieuDe, noiDung } = data;
            await app.model.gvInstruction.create({ tieuDe, noiDung, isGv: 1 });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });
    //Upload Hook-------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'gvInstruction'));

    app.uploadHooks.add('uploadGiangVienInstructionCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('gvInstruction', fields, files, params, done), done));


    app.get('/api/dt/gv/lich-giang-day/page/:pageNumber/:pageSize', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
        try {
            let id = req.session.user.shcc,
                filter = req.query.filter || {};
            filter = app.utils.stringify(app.clone(filter));
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            const page = await app.model.dtThoiKhoaBieuGiangVien.searchPage(_pageNumber, _pageSize, id, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send(error);
        }
    });

    app.get('/api/dt/gv/thoi-khoa-bieu/export', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { filter } = req.query,
                { shcc, firstName = '', lastName = '' } = req.session.user,
                { namHoc, hocKy } = filter;

            const source = app.path.join(__dirname, './resource', 'lichDayTemplate.docx');

            const items = await app.model.dtThoiKhoaBieuGiangVien.getData(shcc, app.utils.stringify(filter));

            let dataExport = {
                hoTen: `${lastName} ${firstName}`, namHoc, hocKy,
                R: items.rows.map((i, index) => ({
                    maHocPhan: i.maHocPhan, tenHocPhan: JSON.parse(i.tenMonHoc || '{"vi":""}')?.vi,
                    bd: i.ngayBatDau ? app.date.viDateFormat(new Date(i.ngayBatDau)) : '',
                    kt: i.ngayKetThuc ? app.date.viDateFormat(new Date(i.ngayKetThuc)) : '',
                    loaiHinh: i.loaiHinhDaoTao, coSo: i.coSo, phong: i.phong, thu: i.thu, tongTiet: i.tongTiet,
                    tiet: i.tietBatDau && i.soTietBuoi ? `${i.tietBatDau} - ${Number(i.tietBatDau) + Number(i.soTietBuoi) - 1}` : '', i: index + 1,
                })),
            };

            const buffer = await app.docx.generateFile(source, dataExport);
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            res.send({ buffer: pdfBuffer });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/get-lich', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
        try {
            let user = req.session.user, shcc = user.shcc;
            const items = await app.model.dtThoiKhoaBieuGiangVien.getData(shcc, app.utils.stringify(req.query.filter));
            res.send({ items: items.rows });
        } catch (error) {
            res.send(error);
        }
    });

    app.get('/api/dt/gv/get-lich-hoc-phan', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { rows } = await app.model.dtThoiKhoaBieuCustom.getData(req.query.maHocPhan, app.utils.stringify({}));
            res.send({ listTuanHoc: rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.get('/api/dt/gv/lich-giang-day/get-lich-hoc-phan', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan;
            let [data, listTuanHoc, infoHocPhan] = await Promise.all([
                app.model.dtThoiKhoaBieu.getData(maHocPhan),
                app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({})),
                app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
            ]);

            listTuanHoc = listTuanHoc.rows.map(tuan => {
                let giangVien = data.datateacher.filter(item => item.type == 'GV' && item.idTuan == tuan.idTuan).map(item => item.hoTen);
                let troGiang = data.datateacher.filter(item => item.type == 'TG' && item.idTuan == tuan.idTuan).map(item => item.hoTen);

                let shccGiangVien = data.datateacher.filter(item => item.type == 'GV' && item.idTuan == tuan.idTuan).map(item => item.shcc);
                let shccTroGiang = data.datateacher.filter(item => item.type == 'TG' && item.idTuan == tuan.idTuan).map(item => item.shcc);

                return { ...tuan, giangVien, troGiang, shccGiangVien, shccTroGiang };
            });

            res.send({
                fullData: data.rows, isAdjust: listTuanHoc.length, infoHocPhan: infoHocPhan.rows[0],
                dataTiet: data.datacahoc, listNgayLe: data.datangayle, dataTeacher: data.datateacher,
                dataNgayNghi: data.datangaynghi, dataNgayBu: data.datangaybu, listTuanHoc,
            });
        } catch (error) {
            res.send(error);
        }
    });

    app.get('/api/dt/gv/lich-giang-day/hocPhan/student-list', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { maHocPhan, filter } = req.query;
            let items = await app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify(filter));
            items = items.rows.map(item => ({
                ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
                timeModified: app.utils.parse(item.timeModified), userModified: app.utils.parse(item.userModified)
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/sinh-vien/download-dssv-hoc-phan', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let hocPhan = app.utils.parse(req.query.hocPhan, {});
            const listSV = await app.model.dtDangKyHocPhan.getStudent(hocPhan.maHocPhan, app.utils.stringify({}), 'ten', 'ASC');
            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet(hocPhan.maHocPhan);
            let cells = [
                { cell: 'A1', value: 'Môn: ' + app.utils.parse(hocPhan.tenMonHoc, { vi: '' })?.vi },
                { cell: 'C1', value: 'Lớp: ' + hocPhan.maLop },
                { cell: 'E1', value: 'Năm học: ' + hocPhan.namHoc },
                { cell: 'F1', value: 'Học kỳ: ' + hocPhan.hocKy },

                { cell: 'A2', value: 'Mã môn học: ' + hocPhan.maMonHoc },
                { cell: 'C2', value: 'Mã học phần: ' + hocPhan.maHocPhan },

                { cell: 'A3', value: 'Khoá sinh viên: ' + hocPhan.khoaSinhVien },
                { cell: 'C3', value: 'Loại hình đào tạo: ' + hocPhan.loaiHinhDaoTao },
                { cell: 'E3', value: 'Khoa, bộ môn: ' + hocPhan.tenKhoaBoMon },


                { cell: 'A4', value: 'Phòng: ' + hocPhan.phong },
                { cell: 'C4', value: 'Thứ: ' + hocPhan.thu },
                { cell: 'E4', value: 'Tiết bắt đầu: Tiết ' + hocPhan.tietBatDau },

                { cell: 'A6', value: 'STT', bold: true, border: '1234' },
                { cell: 'B6', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'C6', value: 'HỌ', bold: true, border: '1234' },
                { cell: 'D6', value: 'TÊN', bold: true, border: '1234' },
                { cell: 'E6', value: 'LỚP', bold: true, border: '1234' },
                { cell: 'F6', value: 'KHOÁ SINH VIÊN', bold: true, border: '1234' },
                { cell: 'G6', value: 'LOẠI HÌNH ĐÀO TẠO', bold: true, border: '1234' },
                { cell: 'H6', value: 'NGÀNH', bold: true, border: '1234' },
                { cell: 'I6', value: 'ĐIỂM GIỮA KỲ', bold: true, border: '1234' },
                { cell: 'J6', value: 'ĐIỂM CUỐI KỲ', bold: true, border: '1234' },
                { cell: 'K6', value: 'ĐIỂM TỔNG KẾT', bold: true, border: '1234' },
            ];
            for (let [index, item] of listSV.rows.entries()) {
                cells.push({ cell: 'A' + (index + 7), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 7), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 7), border: '1234', value: item.ho });
                cells.push({ cell: 'D' + (index + 7), border: '1234', value: item.ten });
                cells.push({ cell: 'E' + (index + 7), border: '1234', value: item.lop });
                cells.push({ cell: 'F' + (index + 7), border: '1234', value: item.khoaSinhVien });
                cells.push({ cell: 'G' + (index + 7), border: '1234', value: item.loaiHinhDaoTao });
                cells.push({ cell: 'H' + (index + 7), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'I' + (index + 7), border: '1234', value: item.diemGk });
                cells.push({ cell: 'J' + (index + 7), border: '1234', value: item.diemCk });
                cells.push({ cell: 'K' + (index + 7), border: '1234', value: item.diemTk });
            }
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, `${hocPhan.maHocPhan}_${app.utils.parse(hocPhan.tenMonHoc, { vi: '' })?.vi}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/diem-danh', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan;

            const [dataTuan, listStudent, dataDiemDanh] = await Promise.all([
                app.model.dtThoiKhoaBieuCustom.getAll({ maHocPhan }, '*', 'id'),
                app.model.dtDangKyHocPhan.getStudent(maHocPhan, app.utils.stringify({}), 'mssv', 'ASC'),
                app.model.dtThoiKhoaBieuDiemDanh.getAll({ maHocPhan })
            ]);

            res.send({ dataTuan, listStudent: listStudent.rows, dataDiemDanh: dataDiemDanh.map(i => ({ ...i, listTuan: i.listTuan ? i.listTuan.split(',') : [] })) });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/lich-giang-day/diem-danh/vang', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { data } = req.body,
                { mssv, maHocPhan, ghiChu, listTuan } = data;

            await app.model.dtThoiKhoaBieuDiemDanh.delete({ mssv, maHocPhan });
            await app.model.dtThoiKhoaBieuDiemDanh.create({ mssv, maHocPhan, ghiChu, listTuan, userModified: req.session.user.email, timeModified: Date.now() });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/lich-giang-day/diem-danh/ghi-chu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { maHocPhan, data = [] } = req.body;

            for (let item of data) {
                const { mssv, ghiChu, listTuan } = item;

                await app.model.dtThoiKhoaBieuDiemDanh.delete({ mssv, maHocPhan });
                await app.model.dtThoiKhoaBieuDiemDanh.create({ mssv, maHocPhan, ghiChu, listTuan, userModified: req.session.user.email, timeModified: Date.now() });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/danh-sach-thi', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const kyThiMapper = {
                'DS': 'DANH SÁCH LỚP',
                'CK': 'THI CUỐI KỲ',
                'GK': 'THI GIỮA KỲ',
            };
            app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-thi'));

            const { maHocPhan, kyThi, namHoc, hocKy, tenKyThi, phanTram } = app.utils.parse(req.query.data);

            let [dataAll, listDinhChi, listCamThi] = await Promise.all([
                app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
                app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi }),
                app.model.dtDiemAll.getAll({ diemDacBiet: 'CT', maHocPhan, loaiDiem: kyThi }, 'mssv'),
            ]),
                dataHocPhan = dataAll.rows[0],
                { tenNganh, tenMonHoc, tenHe, ngayBatDau, ngayKetThuc, lichThi, listNienKhoa } = dataHocPhan || {},
                dataToPrint = [], printTime = new Date();

            listCamThi = listCamThi.map(i => i.mssv);

            const dataPrint = { maHocPhan, kyThi, namHoc, hocKy, tenKyThi, tyLeDiem: phanTram };
            dataPrint.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
            dataPrint.tenHe = tenHe || '';
            dataPrint.listNienKhoa = listNienKhoa || '';
            dataPrint.tenNganh = tenNganh || '';
            dataPrint.titleThi = kyThiMapper[kyThi];
            dataPrint.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
            dataPrint.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
            if (dataPrint.ngayBatDau && dataPrint.ngayKetThuc) dataPrint.ngayBatDau = `${dataPrint.ngayBatDau} - `;

            lichThi = lichThi ? JSON.parse(lichThi).filter(item => item.kyThi == kyThi) : [];
            const outputFolder = app.path.join(app.assetPath, 'bang-diem-thi', `${printTime.getTime()}`);
            app.fs.createFolder(outputFolder);

            if (lichThi.length) {
                let listIdExam = lichThi.map(item => item.idExam);
                // listStudent = listStudent.filter(item => item.idExam && listIdExam.includes(item.idExam));
                for (let idExam of listIdExam) {
                    let { batDau, ketThuc, phong } = lichThi.find(item => item.idExam == idExam),
                        page = 0,
                        listStudentExam = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });

                    listStudentExam = await Promise.all(listStudentExam.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1).map(async stu => {
                        let dataStu = await app.model.fwStudent.get({ mssv: stu.mssv }, 'mssv, ho, ten').then(i => i ? i : { ho: '', ten: '' });
                        return { ...dataStu, ...stu };
                    }));

                    listStudentExam = listStudentExam.map((item, index) => ({
                        ...item, R: index + 1, ghiChu: listCamThi.includes(item.mssv) ? 'Cấm thi' : '',
                        ho: item.ho?.replaceAll('&apos;', '\'') || '',
                        ten: item.ten?.replaceAll('&apos;', '\'') || '',
                    }));

                    let lastSv = listStudentExam.splice(listStudentExam.length - 1);
                    while (listStudentExam.length) {
                        page = page + 1;
                        let dataStudent = listStudentExam.length > 20 ? listStudentExam.splice(0, 28) : listStudentExam.splice(0, 20);
                        if (dataStudent.length < 20) {
                            dataStudent.push(...lastSv);
                            lastSv = [];
                        }
                        dataToPrint.push({
                            ...dataPrint, p: page, idExam,
                            ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
                            gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
                            phongThi: phong, a: dataStudent
                        });
                    }

                    if (lastSv.length) {
                        page = page + 1;
                        dataToPrint.push({
                            ...dataPrint, p: page, idExam,
                            ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
                            gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
                            phongThi: phong, a: lastSv
                        });
                    }

                    dataToPrint = dataToPrint.map(data => {
                        return data.idExam == idExam ? { ...data, pT: page, isGen: data.p == page } : data;
                    });
                }

            } else {
                let listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
                listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id }));

                listStudent.push(...listDinhChi);

                listStudent = await Promise.all(listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1).map(async stu => {
                    let dataStu = await app.model.fwStudent.get({ mssv: stu.mssv }, 'mssv, ho, ten').then(i => i ? i : { ho: '', ten: '' });
                    return { ...dataStu, ...stu };
                }));

                listStudent = listStudent.map((item, index) => ({
                    ...item, R: index + 1, ghiChu: listCamThi.includes(item.mssv) ? 'Cấm thi' : '',
                    ho: item.ho?.replaceAll('&apos;', '\'') || '',
                    ten: item.ten?.replaceAll('&apos;', '\'') || '',
                }));

                let lastSv = listStudent.splice(listStudent.length - 1);

                let page = 0;
                while (listStudent.length) {
                    page = page + 1;
                    let dataStudent = listStudent.length >= 20 ? listStudent.splice(0, 28) : listStudent.splice(0, 20);
                    if (dataStudent.length < 20) {
                        dataStudent.push(...lastSv);
                        lastSv = [];
                    }
                    dataToPrint.push({ ...dataPrint, p: page, ngayThi: '', phongThi: '', gioThi: '', a: dataStudent });
                }

                if (lastSv.length) {
                    page = page + 1;
                    dataToPrint.push({ ...dataPrint, p: page, ngayThi: '', phongThi: '', gioThi: '', a: lastSv });
                }

                dataToPrint = dataToPrint.map(data => {
                    return data.maHocPhan == maHocPhan ? { ...data, pT: page, isGen: data.p == page } : data;
                });
            }

            dataToPrint = dataToPrint.map((item, index) => ({
                ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
            }));

            const source = app.path.join(__dirname, './resource', 'FormExam.docx');
            let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') })
                .then(buf => {
                    let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                    app.fs.writeFileSync(filepath, buf);
                    return filepath;
                })
            ));
            let mergedPath = app.path.join(app.assetPath, 'bang-diem-thi', `output_${printTime.getTime()}.pdf`);
            await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
            app.fs.deleteFolder(outputFolder);
            res.download(mergedPath, `${maHocPhan}-${kyThi}.pdf`);
        } catch (error) {
            res.send({ error });
            console.error(req.method, req.url, { error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/download-diem-danh', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan;

            const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
                worksheet = workBook.getWorksheet(1);

            let cells = await app.model.dtThoiKhoaBieuGiangVien.exportDiemDanh(maHocPhan, worksheet);
            app.excel.write(worksheet, cells);
            app.excel.attachment(workBook, res, `BDDD_${maHocPhan}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/download-lich-day', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { dataHocPhan } = req.query;
            dataHocPhan = app.utils.parse(dataHocPhan);

            const { maHocPhan } = dataHocPhan;

            const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
                worksheet = workBook.getWorksheet(1);

            let cells = await app.model.dtThoiKhoaBieuGiangVien.exportLichDay(maHocPhan, worksheet);

            app.excel.write(worksheet, cells);
            app.excel.attachment(workBook, res, `LICH_DAY_${maHocPhan}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/download-dssv', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan;
            const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
                worksheet = workBook.getWorksheet(1);

            let cells = await app.model.dtThoiKhoaBieuGiangVien.exportDanhSachSinhVien(maHocPhan, worksheet);

            app.excel.write(worksheet, cells);
            app.excel.attachment(workBook, res, `Danh_Sach_Sinh_Vien_${maHocPhan}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/lich-giang-day/cau-hinh-thanh-phan-diem', app.permission.orCheck('staff:teacher'), async (req, res) => {
        try {
            let { dataHocPhan, dataThanhPhan } = req.body,
                { maHocPhan, maMonHoc, namHoc, hocKy } = dataHocPhan,
                modifier = req.session.user.email,
                lastModified = Date.now();

            let [dataTP, dataAssign, statusCode, config] = await Promise.all([
                app.model.dtDiemConfigHocPhan.getAll({ maHocPhan, maMonHoc }),
                app.model.dtAssignRoleNhapDiem.getAll({ maHocPhan, maMonHoc }, 'namHoc, maHocPhan, maMonHoc, hocKy, kyThi, idExam, loaiHinhDaoTao, shcc, userModified, timeModified'),
                app.model.dtDiemCodeFile.getStatus(app.utils.stringify({ namHoc, hocKy, maHocPhan })),
                app.model.dtDiemConfig.getData(app.utils.stringify({ maHocPhan, maMonHoc, namHoc, hocKy })),
            ]);
            config = config.rows[0];

            if (statusCode.rows.find(i => i.isVerified)) throw { message: 'Học phần đã được xác nhận điểm. Không thể thao tác chỉnh sửa điểm thành phần!' };


            if (config) {
                let { thoiGianKetThucNhap } = config;
                if (lastModified > thoiGianKetThucNhap) throw { message: 'Học phần không trong thời gian cho phép chỉnh sửa điểm thành phần!' };
            }

            dataThanhPhan.sort((a, b) => a.priority - b.priority);

            await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
            for (let thanhPhan of dataThanhPhan) {
                let { loaiThanhPhan, phanTram, loaiLamTron = '0.5' } = thanhPhan;
                let thi = dataTP.find(i => i.loaiThanhPhan == loaiThanhPhan);
                await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan, phanTram, modifier, lastModified, loaiLamTron, hinhThucThi: thi?.hinhThucThi || '' });
            }

            let listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv');

            await Promise.all(listStudent.map(async stu => {
                let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv: stu.mssv };

                const allDiem = await app.model.dtDiemAll.getAll(condition);
                if (allDiem.length) {
                    await app.model.dtDiemAll.delete(condition);

                    for (let tp of dataThanhPhan) {
                        let { loaiThanhPhan, phanTram } = tp;
                        const exist = allDiem.find(i => i.loaiDiem == loaiThanhPhan && i.diem != null);
                        if (exist) {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: loaiThanhPhan, phanTramDiem: phanTram, diem: exist.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '', isLock: exist.isLock, timeLock: exist.isLock ? lastModified : '' });
                            await app.model.dtDiemHistory.create({ ...condition, loaiDiem: loaiThanhPhan, oldDiem: exist?.diem ?? '', newDiem: exist?.diem ?? '', diemDacBiet: exist?.diemDacBiet ?? '', phanTramDiem: phanTram, hinhThucGhi: 5, userModified: modifier, timeModified: lastModified });
                        }
                    }

                    if (allDiem.filter(i => i.diem != null && i.loaiDiem != 'TK').length) {
                        const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

                        if (isTK) {
                            await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                        } else {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                        }
                    }
                }
            }));

            await app.model.dtAssignRoleNhapDiem.delete({ maHocPhan, maMonHoc });
            let listTpAssign = await app.model.dtAssignRoleNhapDiem.parseData({ maHocPhan, namHoc, hocKy });
            for (let data of listTpAssign.filter(i => i.thanhPhan)) {
                let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified: lastModified, loaiDiem: data.thanhPhan });
                if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...data }, modifier);

                if (data.thanhPhan == 'CK') {
                    await Promise.all(dataAssign.filter(i => data.idExam ? (i.idExam == data.idExam) : (i.kyThi == 'CK')).map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign })));
                } else {
                    let list = dataAssign.filter(i => i.kyThi != 'CK');
                    if (data.thanhPhan != 'GK') {
                        list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
                        await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, idExam: '', kyThi: data.thanhPhan })));
                    }
                    else {
                        list = list.filter(i => !i.idExam || i.idExam == data.idExam);
                        list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
                        await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, kyThi: 'GK', idExam: data.idExam || '' })));
                    }
                }
            }

            const allRole = await app.model.dtAssignRoleNhapDiem.getAll({ shcc: req.session.user.shcc, maHocPhan }, '*', 'id');
            res.send({ allRole });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/get-role-nhap-diem', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const items = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: req.session.user.shcc, ...req.query.filter }));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/nhap-diem/get-data', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { id } = req.query,
                { shcc } = req.session.user,
                item = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: shcc, idRole: id }));

            let dataStudent = [], infoHocPhan = {}, listTpThi = [], listDinhChi = [], codeStatus = [];

            if (item.rows.length) {
                const { maHocPhan, idExam, kyThi } = item.rows[0];
                [listTpThi, listDinhChi, infoHocPhan, codeStatus] = await Promise.all([
                    app.model.dtAssignRoleNhapDiem.getAll({
                        statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL AND kyThi != :kyThi',
                        parameter: { maHocPhan, shcc, kyThi },
                    }, 'kyThi'),
                    app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi, idExam }),
                    app.model.dtThoiKhoaBieu.getInfo(item.rows[0].maHocPhan).then(data => data.rows[0]),
                    app.model.dtDiemCodeFile.getStatus(app.utils.stringify({ maHocPhan }))
                ]);
                codeStatus = codeStatus.rows.filter(i => i.isVerified);

                if (idExam) {
                    listTpThi = [];
                    codeStatus = codeStatus.filter(i => i.idExam == idExam);
                    dataStudent = await app.model.dtExamDanhSachSinhVien.getAll({
                        statement: 'idExam = :idExam AND idDinhChiThi IS NULL',
                        parameter: { idExam }
                    });
                } else {
                    dataStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
                }

                listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id, maHocPhanThi: i.maHocPhan, kyThiDinhChi: kyThi }));
                listDinhChi = await Promise.all(listDinhChi.map(async stu => {
                    let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: stu.mssv.toString(), maHocPhan: stu.maHocPhanThi, isHoanThi: 1 }));
                    return { ...dataStu.rows[0], ...stu };
                }));

                await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: dataStudent.map(i => i.mssv).toString(), maHocPhan })).then(i => dataStudent = i.rows);

                dataStudent.push(...listDinhChi);
                dataStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);

                dataStudent = dataStudent.map(item => ({
                    ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
                    timeModified: app.utils.parse(item.timeModified), userModified: app.utils.parse(item.userModified),
                    lockDiem: app.utils.parse(item.lockDiem),
                }));
            }

            res.send({ item: item.rows[0], infoHocPhan, dataStudent, timeNow: Date.now(), listTpThi: listTpThi.map(i => i.kyThi), codeStatus: codeStatus.map(i => i.kyThi) });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/nhap-diem/diem-sinh-vien', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { changes } = req.body,
                { listStudent, tpDiem, dataHocPhan } = JSON.parse(changes),
                userModified = req.session.user.email,
                timeModified = Date.now();

            for (let stu of listStudent) {
                let { mssv, diem, diemDacBiet, ghiChu, idDinhChiThi } = stu,
                    { maHocPhan, namHoc, hocKy, maMonHoc } = dataHocPhan;

                if (idDinhChiThi) {
                    let loaiDiem = '';
                    await app.model.dtDinhChiThi.get({ id: idDinhChiThi }).then(dinhChi => {
                        maHocPhan = dinhChi.maHocPhan;
                        namHoc = dinhChi.namHoc;
                        hocKy = dinhChi.hocKy;
                        loaiDiem = dinhChi.kyThi;
                    });

                    const configTpDiem = await app.model.dtDinhChiThi.getInfoDinhChi(maHocPhan, loaiDiem);
                    if (!configTpDiem || configTpDiem.phanTram == null || configTpDiem.phanTram == '0') continue;

                    let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv };

                    let isExist = await app.model.dtDiemAll.get({ ...condition, loaiDiem }),
                        diemSv = diem && diem[loaiDiem] != null ? diem[loaiDiem] : '',
                        diemDb = diemDacBiet && diemDacBiet[loaiDiem] ? diemDacBiet[loaiDiem] : '';

                    if (((isExist?.diemDacBiet || isExist?.diem) ?? '') != ((diemDb || diemSv))) {
                        if (isExist) {
                            await app.model.dtDiemAll.update({ ...condition, loaiDiem }, { diem: diemSv, diemDacBiet: diemDb });
                        } else {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem, phanTramDiem: configTpDiem.phanTram, diem: diemSv, diemDacBiet: diemDb });
                        }
                        await app.model.dtDiemHistory.create({ userModified, timeModified, ...condition, phanTramDiem: configTpDiem.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem, diemDacBiet: diemDb, hinhThucGhi: 3 });
                    }

                    if (diem) {
                        const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK({ mssv, ...condition });

                        if (isTK) {
                            await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                        } else {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                        }
                    }
                } else {

                    let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv };

                    for (let tp of tpDiem) {
                        let isExist = await app.model.dtDiemAll.get({ ...condition, loaiDiem: tp.thanhPhan }),
                            diemSv = diem && diem[tp.thanhPhan] != null ? diem[tp.thanhPhan] : '',
                            diemDb = diemDacBiet && diemDacBiet[tp.thanhPhan] ? diemDacBiet[tp.thanhPhan] : '';

                        if ((((isExist?.diemDacBiet || isExist?.diem) ?? '') != ((diemDb || diemSv)))) {
                            if (isExist) {
                                await app.model.dtDiemAll.update({ ...condition, loaiDiem: tp.thanhPhan }, { diem: diemSv, diemDacBiet: diemDb });
                            } else {
                                await app.model.dtDiemAll.create({ ...condition, loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram, diem: diemSv, diemDacBiet: diemDb });
                            }
                            await app.model.dtDiemHistory.create({ userModified, timeModified, ...condition, phanTramDiem: tp.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem: tp.thanhPhan, diemDacBiet: diemDb, hinhThucGhi: 3 });
                        }
                    }
                    if (diem) {
                        let isTK = await app.model.dtDiemAll.get({ ...condition, loaiDiem: 'TK' });
                        if (isTK) {
                            await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: diem['TK'] ?? '' });
                        } else {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: diem['TK'] ?? '' });
                        }
                    }
                }

                await app.model.dtDiemGhiChu.delete({ mssv, maHocPhan });
                await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, userModified, timeModified });
            }

            if (dataHocPhan.idExam) {
                let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified });
                if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: dataHocPhan.kyThi }, userModified);
            } else {
                let listTpThi = await app.model.dtAssignRoleNhapDiem.getAll({
                    statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL',
                    parameter: { maHocPhan: dataHocPhan.maHocPhan, shcc: req.session.user.shcc },
                }, 'kyThi');
                for (let tp of listTpThi) {
                    let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified, loaiDiem: tp.kyThi });
                    if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: tp.kyThi }, userModified);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    const genBarCode = async (code, image) => {
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: code.toString(),
            includetext: true,
            textxalign: 'center',
        });
        app.fs.writeFileSync(image, png);
    };

    const handleGetStudent = async (listStudent, listDinhChi, maHocPhan) => {
        listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id, maHocPhanThi: i.maHocPhan, kyThiDinhChi: i.kyThi }));
        listDinhChi = await Promise.all(listDinhChi.map(async stu => {
            let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: stu.mssv.toString(), maHocPhan: stu.maHocPhanThi, isHoanThi: 1 }));
            return { ...dataStu.rows[0], ...stu };
        }));

        await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: listStudent.map(i => i.mssv).toString(), maHocPhan })).then(i => listStudent = i.rows);

        listStudent.push(...listDinhChi);
        listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);
        return listStudent;
    };

    const handleParseStudent = (listStudent, kyThi) => {
        const parseDiem = (diem, loaiDiem) => (!isNaN(parseFloat(diem[loaiDiem]))) ? parseFloat(diem[loaiDiem]).toFixed(1).toString() : diem[loaiDiem];
        return listStudent.map((item, index) => {
            let diem = item.diem ? app.utils.parse(item.diem) : {},
                diemDacBiet = item.diemDacBiet ? app.utils.parse(item.diemDacBiet) : {},
                diemSv = parseDiem(diem, kyThi),
                diemTX = parseDiem(diem, 'DGTX'),
                diemGK = parseDiem(diem, 'GK');

            return {
                ...item, R: index + 1,
                ho: item.ho?.replaceAll('&apos;', '\'') || '',
                ten: item.ten?.replaceAll('&apos;', '\'') || '',
                diemSv: (diemDacBiet[kyThi] || diemSv) ?? '',
                diemTX: (diemDacBiet['DGTX'] || diemTX) ?? '',
                diemGK: (diemDacBiet['GK'] || diemGK) ?? '',
            };
        });
    };

    app.get('/api/dt/gv/nhap-diem/bang-diem-xac-nhan', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { id } = req.query,
                { shcc, email } = req.session.user;

            const kyThiMapper = {
                'CK': 'ĐIỂM CUỐI KỲ',
                'GK': 'ĐIỂM GIỮA KỲ',
            };

            let item = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: shcc, idRole: id })),
                printTime = new Date(), dataToPrint = [];

            app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-xac-nhan'));

            if (item.rows.length) {
                const { maHocPhan, idExam, configDefault, tpHocPhan, tpMonHoc } = item.rows[0];

                let infoHocPhan = await app.model.dtThoiKhoaBieu.getInfo(item.rows[0].maHocPhan);
                infoHocPhan = infoHocPhan.rows[0];

                let tpDiem = tpHocPhan || tpMonHoc || configDefault;
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];

                let { namHoc, hocKy, tenMonHoc, tenHe, listNienKhoa, tenNganh, ngayBatDau, ngayKetThuc, lichThi, maMonHoc } = infoHocPhan,
                    listBarCodeImg = [];

                const dataSample = { maHocPhan, namHoc, hocKy, dd: new Date().getDate(), mm: new Date().getMonth() + 1, yyyy: new Date().getFullYear() };
                dataSample.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
                dataSample.tenHe = tenHe || '';
                dataSample.listNienKhoa = listNienKhoa || '';
                dataSample.tenNganh = tenNganh || '';
                dataSample.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
                dataSample.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
                if (dataSample.ngayBatDau && dataSample.ngayKetThuc) dataSample.ngayBatDau = `${dataSample.ngayBatDau} - `;
                const outputFolder = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `${printTime.getTime()}`);
                app.fs.createFolder(outputFolder);

                if (idExam) {
                    let { batDau, ketThuc, phong, kyThi } = lichThi ? JSON.parse(lichThi).find(item => item.idExam == idExam) : {},
                        page = 0,
                        [listStudentExam, listDinhChi] = await Promise.all([
                            app.model.dtExamDanhSachSinhVien.getAll({
                                statement: 'idExam = :idExam AND idDinhChiThi IS NULL',
                                parameter: { idExam }
                            }),
                            app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi, idExam }),
                        ]);

                    dataSample.titleThi = kyThiMapper[kyThi];
                    dataSample.kyThi = kyThi;
                    if (kyThi == 'CK') {
                        const tp = tpDiem.find(tp => tp.thanhPhan == kyThi);
                        dataSample.tenKyThi = tp.tenThanhPhan;
                        dataSample.tyLe = tp.phanTram;
                    } else {
                        dataSample.tlTX = tpDiem.find(tp => tp.thanhPhan == 'DGTX')?.phanTram || '0';
                        dataSample.tlGK = tpDiem.find(tp => tp.thanhPhan == 'GK')?.phanTram || '0';
                    }

                    const codeFile = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam }, email);

                    let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + idExam + Date.now() + '.png');
                    app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
                    await genBarCode(codeFile, barCodeImage);
                    dataSample.code = barCodeImage;
                    listBarCodeImg.push(barCodeImage);

                    listStudentExam = await handleGetStudent(listStudentExam, listDinhChi, maHocPhan);

                    listStudentExam = handleParseStudent(listStudentExam, kyThi);

                    let lastSv = listStudentExam.splice(listStudentExam.length - 1);

                    while (listStudentExam.length) {
                        page = page + 1;
                        let dataStudent = listStudentExam.length > 20 ? listStudentExam.splice(0, 28) : listStudentExam.splice(0, 20);
                        if (dataStudent.length < 20) {
                            dataStudent.push(...lastSv);
                            lastSv = [];
                        }
                        dataToPrint.push({
                            ...dataSample, p: page, idExam,
                            ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
                            gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
                            phongThi: phong, a: dataStudent
                        });
                    }

                    if (lastSv.length) {
                        page = page + 1;
                        dataToPrint.push({
                            ...dataSample, p: page, idExam,
                            ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
                            gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
                            phongThi: phong, a: lastSv
                        });
                    }

                    dataToPrint = dataToPrint.map(i => ({ ...i, pT: page, isGen: i.p == page }));
                } else {
                    let [listTpThi, listDinhChi, listStudent] = await Promise.all([
                        app.model.dtAssignRoleNhapDiem.getAll({
                            statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL',
                            parameter: { maHocPhan, shcc },
                        }, 'kyThi'),
                        app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan }),
                        app.model.dtDangKyHocPhan.getAll({ maHocPhan }),
                    ]);

                    listStudent = await handleGetStudent(listStudent, listDinhChi, maHocPhan);

                    for (let tpThi of listTpThi) {
                        const kyThi = tpThi.kyThi;
                        if (kyThi == 'CK') {
                            const tp = tpDiem.find(tp => tp.thanhPhan == kyThi);
                            dataSample.tenKyThi = tp.tenThanhPhan;
                            dataSample.tyLe = tp.phanTram;
                            dataSample.titleThi = kyThiMapper[kyThi];
                        } else {
                            dataSample.tlTX = tpDiem.find(tp => tp.thanhPhan == 'DGTX')?.phanTram || '0';
                            dataSample.tlGK = tpDiem.find(tp => tp.thanhPhan == 'GK')?.phanTram || '0';
                        }

                        const codeFile = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi }, email);

                        let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + kyThi + Date.now() + '.png');
                        listBarCodeImg.push(barCodeImage);
                        app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
                        await genBarCode(codeFile, barCodeImage);

                        let listStudentExam = listStudent.filter(i => !i.idDinhChiThi || i.kyThiDinhChi == kyThi),
                            page = 0;

                        listStudentExam = handleParseStudent(listStudentExam, kyThi);

                        let lastSv = listStudentExam.splice(listStudentExam.length - 1);

                        while (listStudentExam.length) {
                            page = page + 1;
                            let dataStudent = listStudentExam.length > 20 ? listStudentExam.splice(0, 28) : listStudentExam.splice(0, 20);
                            if (dataStudent.length < 20) {
                                dataStudent.push(...lastSv);
                                lastSv = [];
                            }
                            dataToPrint.push({
                                ...dataSample, idExam, a: dataStudent,
                                ngayThi: '', gioThi: '', phongThi: '',
                                code: barCodeImage, p: page,
                                kyThi
                            });
                        }

                        if (lastSv.length) {
                            page = page + 1;
                            dataToPrint.push({
                                ...dataSample, p: page, idExam,
                                ngayThi: '', gioThi: '', phongThi: '',
                                code: barCodeImage, kyThi, a: lastSv
                            });
                        }

                        dataToPrint = dataToPrint.map(i => i.kyThi == kyThi ? ({ ...i, pT: page, isGen: i.p == page }) : i);
                    }
                }

                dataToPrint = dataToPrint.map((item, index) => ({
                    ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
                }));

                const source = app.path.join(__dirname, './resource', 'FormConfirm.docx'),
                    sourceQt = app.path.join(__dirname, './resource', 'FormConfirmQT.docx');
                let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFileHasImage(data.kyThi == 'CK' ? source : sourceQt, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') }, [90, 93])
                    .then(buf => {
                        let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                        app.fs.writeFileSync(filepath, buf);
                        return filepath;
                    })
                ));
                let mergedPath = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `output_${printTime.getTime()}.pdf`);
                await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
                app.fs.deleteFolder(outputFolder);
                listBarCodeImg.map(i => app.fs.deleteFile(i));
                res.download(mergedPath, `${maHocPhan}.pdf`);
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/import-diem/template', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const { id } = req.query,
                { shcc } = req.session.user,
                item = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: shcc, idRole: id }));

            let dataStudent = [], listTpThi = [], listDinhChi = [];

            if (item.rows.length) {
                const { maHocPhan, idExam, kyThi, tpHocPhan, tpMonHoc, configDefault } = item.rows[0];
                let tpDiem = tpHocPhan || tpMonHoc || configDefault;

                tpDiem = tpDiem ? app.utils.parse(tpDiem) : [];
                tpDiem.sort((a, b) => b.priority - a.priority);

                [listTpThi, listDinhChi] = await Promise.all([
                    app.model.dtAssignRoleNhapDiem.getAll({
                        statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL AND kyThi != :kyThi',
                        parameter: { maHocPhan, shcc, kyThi },
                    }, 'kyThi'),
                    app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi, idExam }),
                ]);

                if (idExam) {
                    listTpThi = [];
                    dataStudent = await app.model.dtExamDanhSachSinhVien.getAll({
                        statement: 'idExam = :idExam AND idDinhChiThi IS NULL',
                        parameter: { idExam }
                    });
                } else {
                    dataStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
                }

                listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id, maHocPhanThi: i.maHocPhan }));
                listDinhChi = await Promise.all(listDinhChi.map(async stu => {
                    let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: stu.mssv.toString(), maHocPhan: stu.maHocPhanThi, isHoanThi: 1 }));
                    return { ...dataStu.rows[0], ...stu };
                }));

                await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: dataStudent.map(i => i.mssv).toString(), maHocPhan })).then(i => dataStudent = i.rows);

                dataStudent.push(...listDinhChi);
                dataStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);

                dataStudent = dataStudent.map(item => ({
                    ...item, diem: item.diem ? app.utils.parse(item.diem) : {}, diemDacBiet: item.diemDacBiet ? app.utils.parse(item.diemDacBiet) : {}
                }));

                tpDiem = tpDiem.filter(tp => (listTpThi.length || (kyThi == 'CK' ? tp.thanhPhan == 'CK' : tp.loaiThanhPhan != 'CK')));

                const workBook = app.excel.create();
                const ws = workBook.addWorksheet('Diem');
                ws.columns = [
                    { header: 'Mssv', key: 'mssv', width: 20 },
                    { header: 'Họ và tên', key: 'hoTen', width: 20 },
                    ...tpDiem.map(i => ({ header: i.tenThanhPhan, key: i.thanhPhan, width: 20 })),
                    { header: 'Ghi chú', key: 'ghiChu', width: 20 },
                ];

                dataStudent.forEach((item, index) => {
                    ws.addRow({
                        mssv: item.mssv, hoTen: item.ho + ' ' + item.ten,
                        ...tpDiem.reduce((acc, cur) => {
                            let tp = cur.thanhPhan;
                            acc[tp] = item.diemDacBiet[tp] || item.diem[tp] || '';
                            return acc;
                        }, {}),
                        ghiChu: item.ghiChu
                    }, index === 0 ? 'n' : 'i');
                });

                app.excel.attachment(workBook, res, 'ImportDiem.xlsx');
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/gv/import-diem/save', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { changes } = req.body,
                { dataStudent, tpDiem, dataHocPhan } = JSON.parse(changes),
                userModified = req.session.user.email,
                timeModified = Date.now();

            for (let stu of dataStudent) {
                let { mssv, ghiChu, idDinhChiThi } = stu,
                    { maHocPhan, namHoc, hocKy, maMonHoc } = dataHocPhan;

                let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv };

                if (idDinhChiThi) {
                    let loaiDiem = '';
                    await app.model.dtDinhChiThi.get({ id: idDinhChiThi }).then(dinhChi => {
                        maHocPhan = dinhChi.maHocPhan;
                        namHoc = dinhChi.namHoc;
                        hocKy = dinhChi.hocKy;
                        loaiDiem = dinhChi.kyThi;
                    });

                    const configTpDiem = await app.model.dtDinhChiThi.getInfoDinhChi(maHocPhan, loaiDiem);
                    if (!configTpDiem || configTpDiem.phanTram == null || configTpDiem.phanTram == '0') continue;

                    condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv };
                    let isExist = await app.model.dtDiemAll.get({ ...condition, loaiDiem }),
                        diemSv = stu[loaiDiem] || '',
                        diemDb = stu.dataDacBiet[loaiDiem] || '';

                    if (diemSv) {
                        if ((((isExist?.diemDacBiet || isExist?.diem) ?? '') != ((diemDb || diemSv)))) {
                            if (isExist) {
                                await app.model.dtDiemAll.update({ ...condition, loaiDiem }, { diem: diemSv, diemDacBiet: diemDb });
                            } else {
                                await app.model.dtDiemAll.create({ ...condition, loaiDiem, phanTramDiem: configTpDiem.phanTram, diem: diemSv, diemDacBiet: diemDb });
                            }
                            await app.model.dtDiemHistory.create({ userModified, timeModified, ...condition, phanTramDiem: configTpDiem.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem, diemDacBiet: diemDb, hinhThucGhi: 3 });
                        }
                    }
                } else {
                    for (let tp of tpDiem) {
                        let isExist = await app.model.dtDiemAll.get({ ...condition, loaiDiem: tp.thanhPhan }),
                            diemSv = stu[tp.thanhPhan] || '',
                            diemDb = stu.dataDacBiet[tp.thanhPhan] || '';

                        if (diemSv) {
                            if ((((isExist?.diemDacBiet || isExist?.diem) ?? '') != ((diemDb || diemSv)))) {
                                if (isExist) {
                                    await app.model.dtDiemAll.update({ ...condition, loaiDiem: tp.thanhPhan }, { diem: diemSv, diemDacBiet: diemDb });
                                } else {
                                    await app.model.dtDiemAll.create({ ...condition, loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram, diem: diemSv, diemDacBiet: diemDb });
                                }
                                await app.model.dtDiemHistory.create({ userModified, timeModified, ...condition, phanTramDiem: tp.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem: tp.thanhPhan, diemDacBiet: diemDb, hinhThucGhi: 3 });
                            }
                        }
                    }
                }
                let isWrite = await app.model.dtDiemHistory.get({ timeModified, ...condition });
                if (isWrite) {
                    const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK({ ...condition });

                    if (isTK) {
                        await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                    } else {
                        await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                    }
                }

                await app.model.dtDiemGhiChu.delete({ mssv, maHocPhan });
                await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, userModified, timeModified });
            }

            if (dataHocPhan.idExam) {
                let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified });
                if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: dataHocPhan.kyThi }, userModified);
            } else {
                let listTpThi = await app.model.dtAssignRoleNhapDiem.getAll({
                    statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL',
                    parameter: { maHocPhan: dataHocPhan.maHocPhan, shcc: req.session.user.shcc },
                }, 'kyThi');
                for (let tp of listTpThi) {
                    let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified, loaiDiem: tp.kyThi });
                    if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: tp.kyThi }, userModified);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('GvImportDiem', (req, fields, files, params, done) =>
        app.permission.has(req, () => GvImportDiem(req, fields, files, params, done), done, 'staff:teacher')
    );

    const GvImportDiem = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'GvImportDiem' && files.GvImportDiem && files.GvImportDiem.length) {
            const srcPath = files.GvImportDiem[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);
                if (worksheet) {
                    try {
                        let { listTpThi, tpDiem, kyThi, dataStudent, configQC, codeStatus } = app.utils.parse(params.data),
                            items = [], falseItems = [], index = 2;

                        let i = 1, columns = [];
                        while (true) {
                            let column = app.excel.numberToExcelColumn(i),
                                value = worksheet.getCell(`${column}1`).text?.trim();
                            if (value) {
                                columns.push({ column, name: value });
                            } else {
                                break;
                            }
                            i++;
                        }

                        if (!columns.length) done({ error: 'Không đọc được dữ liệu cột!' });

                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(val)) val = Number(val).toFixed(2);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };

                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    hoTen: getVal('B'),
                                    ghiChu: getVal(columns.find(i => i.name == 'Ghi chú').column),
                                    row: index, dataDacBiet: {}
                                };

                                tpDiem.forEach(loai => {
                                    let exist = columns.find(i => i.name.trim().toLowerCase() == loai.tenThanhPhan.trim().toLowerCase());
                                    if (exist) {
                                        data[loai.thanhPhan] = getVal(exist.column)?.toUpperCase();
                                    }
                                });

                                //Check data
                                let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv');
                                if (!sv) {
                                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                                    index++;
                                    continue;
                                }

                                if (!dataStudent.map(i => i.mssv).includes(data.mssv)) {
                                    falseItems.push({ ...data, error: 'Sinh viên không học lớp học phần' });
                                    index++;
                                    continue;
                                }

                                if (items.map(i => i.mssv).includes(data.mssv)) {
                                    falseItems.push({ ...data, error: 'Trùng dữ liệu sinh viên' });
                                    index++;
                                    continue;
                                }

                                // check valid diem
                                tpDiem.forEach(tp => {
                                    const value = data[tp.thanhPhan];
                                    if ((listTpThi.length || (kyThi == 'CK' ? tp.thanhPhan == 'CK' : tp.thanhPhan != 'CK'))) {
                                        if (isNaN(value)) {
                                            const key = configQC.filter(i => !Number(i.tinhTongKet)).find(item => item.loaiApDung.split(', ').includes(tp.thanhPhan) && item.ma == value);
                                            if (key) {
                                                data[tp.thanhPhan] = '0.0';
                                                data.dataDacBiet[tp.thanhPhan] = value;
                                            } else {
                                                falseItems.push({ ...data, error: 'Điểm không hợp lệ!' });
                                            }
                                        } else {
                                            if (!falseItems.find(i => i.row == index)) {
                                                if (parseFloat(value) < 0 || parseFloat(value) > 10) {
                                                    falseItems.push({ ...data, error: 'Điểm không hợp lệ!' });
                                                } else if (parseFloat(value) >= 0 || parseFloat(value) <= 10) {
                                                    const rate = parseFloat(tp.loaiLamTron) / 0.1;
                                                    data[tp.thanhPhan] = (Math.round(value * (10 / rate)) / (10 / rate)).toString();
                                                }
                                            }
                                        }
                                    }

                                    let lockDiem = dataStudent.find(i => i.mssv == data.mssv)?.lockDiem;
                                    if (lockDiem && lockDiem[tp.thanhPhan] && Number(lockDiem[tp.thanhPhan])) delete data[tp.thanhPhan];

                                    if (!(listTpThi.length || (kyThi == 'CK' ? tp.thanhPhan == 'CK' : tp.thanhPhan != 'CK'))) delete data[tp.thanhPhan];

                                    if (codeStatus.length && codeStatus.filter(i => tp.thanhPhan == 'CK' ? i == 'CK' : i != 'CK').length) delete data[tp.thanhPhan];
                                });

                                if (!falseItems.find(i => i.row == index)) {
                                    items.push({ ...data });
                                }
                            }
                            index++;
                        }

                        done({ items, falseItems });
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

    app.get('/api/dt/gv/get-lich-day', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
        try {
            let { filter, groupBy } = req.query, user = req.session.user, shcc = user.shcc;
            let [items, listNgayLe] = await Promise.all([
                app.model.dtThoiKhoaBieuGiangVien.getLichDay(shcc, app.utils.stringify(filter)),
                app.model.dmNgayLe.getAllNgayLeTrongNam(),
            ]);

            items = items.rows;

            if (filter.lichDay && filter.lichDay != 0) {
                items = items.filter(i => !i.isNghi && !i.isVang);
            }

            if (items.length == 0) {
                items = {};
            }
            else if (typeof groupBy == 'string' && groupBy in items[0]) {
                items = items.groupBy(groupBy);
            }

            res.send({ items, listNgayLe });
        } catch (error) {
            res.send(error);
        }
    });

    app.post('/api/dt/gv/lich-giang-day/bao-nghi', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let data = req.body.data, { idTuan, ngayKetThuc, ghiChu, isGiangVienBaoNghi, maHocPhan, thu, tietBatDau, soTietBuoi, phong, ngayHoc, subject, noiDung, mailCc } = data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { ghiChu, isNghi: 1, isGiangVienBaoNghi, modifier: userModified, timeModified, timeAction: timeModified, userAction: userModified }).catch(error => console.error('Update TKB', { error }));
            await app.model.dtThoiKhoaBieuGiangVien.update({ idTuan }, { idNgayNghi: idTuan, userModified, timeModified }).catch(error => console.error('Update GV', { error }));

            const [listDangKy, listGiangVien] = await Promise.all([
                app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                app.model.dtThoiKhoaBieuGiangVien.getList(idTuan).then(items => items.rows.map(i => i.email).filter(i => i != userModified)),
            ]), title = `Ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`;

            listDangKy.map(async i => app.notification.send({
                toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                subTitle: title,
            }));

            app.notification.send({
                toEmail: userModified, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                subTitle: title,
            });

            listGiangVien.map(async gv => app.notification.send({
                toEmail: gv, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                subTitle: title,
            }));

            if (ngayKetThuc >= Date.now()) {
                let listMail = listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`);
                if (mailCc) listMail.push(mailCc);
                listMail.push(...listGiangVien.filter(i => i != mailCc));
                app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', userModified, listMail.toString(), null, subject, '', noiDung, null);
            }

            let dataTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: dataTuan[0].ngayHoc, ngayKetThuc: dataTuan.slice(-1)[0].ngayHoc });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-giang-day/bao-bu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            const giangVien = req.session.user.shcc;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: items } = await app.model.dtThoiKhoaBieuBaoBu.searchPage(1, 50, app.utils.stringify({ isAll: 1, giangVien, maHocPhan: req.query.maHocPhan }));
            res.send({ totalItem, pageNumber, pageSize, pageTotal, items });
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    const checkTrungLich = async (thoiGianBatDau, thoiGianKetThuc, shcc) => {
        return app.model.dtThoiKhoaBieuGiangVien.get({
            statement: 'giangVien = :shcc AND NOT ((:thoiGianBatDau > ngayKetThuc) OR (:thoiGianKetThuc < ngayBatDau)) AND idNgayNghi IS NULL',
            parameter: { thoiGianBatDau, thoiGianKetThuc, shcc },
        });
    };

    app.post('/api/dt/gv/lich-giang-day/bao-bu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { data, dataTuan } = req.body,
                { ngayBatDau, ngayKetThuc, ngayBu, coSo } = data,
                { idThoiKhoaBieu, maHocPhan, maMonHoc, namHoc, hocKy, idTuan } = dataTuan,
                user = req.session.user;

            if (await checkTrungLich(ngayBatDau, ngayKetThuc, user.shcc)) throw { message: 'Trùng lịch giảng dạy' };

            let userModified = user.email;
            let timeModified = Date.now();

            await app.model.dtThoiKhoaBieuBaoBu.create({ ...data, ngayHoc: ngayBu, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayKetThuc, idNgayNghi: idTuan, idThoiKhoaBieu, maHocPhan, maMonHoc, namHoc, hocKy, coSo, modifier: userModified, timeModified, timeCreated: timeModified, userCreated: userModified, status: 0, shcc: user.shcc });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/gv/lich-giang-day/bao-bu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { data, dataTuan } = req.body,
                { ngayBatDau, ngayKetThuc, ngayBu } = data,
                { idTuan } = dataTuan;

            if (await checkTrungLich(ngayBatDau, ngayKetThuc, req.session.user.shcc)) throw { message: 'Trùng lịch giảng dạy' };

            let modifier = req.session.user.email;
            let timeModified = Date.now();

            await app.model.dtThoiKhoaBieuBaoBu.update({ id: idTuan }, { ...data, ngayHoc: ngayBu, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayKetThuc, modifier, timeModified });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/gv/lich-giang-day/bao-bu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let { idTuan } = req.body;
            await app.model.dtThoiKhoaBieuBaoBu.delete({ id: idTuan });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/gv/lich-nghi-bu', app.permission.check('staff:teacher'), async (req, res) => {
        try {
            let items = await app.model.dtThoiKhoaBieuGiangVien.getLichNghiBu(req.session.user.shcc, app.utils.stringify(req.query.filter));
            items = items.rows.map(i => {
                i.dataBu = i.dataBu ? app.utils.parse(i.dataBu) : [];
                i.dataNghi = i.dataNghi ? app.utils.parse(i.dataNghi) : [];
                i.dataVang = i.dataVang ? app.utils.parse(i.dataVang) : [];
                i.customBu = i.customBu ? app.utils.parse(i.customBu) : [];

                i.dataBu = [...i.dataBu, ...i.customBu];
                i.dataBu.sort((a, b) => Number(a.thoiGianBatDau) - Number(b.thoiGianBatDau));
                return i;
            });

            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};