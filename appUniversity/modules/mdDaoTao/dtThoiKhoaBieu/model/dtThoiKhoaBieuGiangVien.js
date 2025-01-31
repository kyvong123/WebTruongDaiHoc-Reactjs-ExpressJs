// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieuGiangVien.foo = () => { };
    // const DATE_UNIX = 24 * 60 * 60 * 1000;
    // lichThu: Lịch của thứ
    const bwipjs = require('bwip-js');

    Number.prototype.isBetween = function (from, to) {
        return (this >= from && this <= to);
    };

    app.model.dtThoiKhoaBieuGiangVien.checkValid = async (data) => {
        let { giangVien, tietBatDau, soTietBuoi, thu, coSo } = data;
        const currentSched = await app.model.dtThoiKhoaBieu.getScheduleGiangVien(giangVien),
            dataSched = currentSched.rows;

        let lichThu = dataSched.find(item => item.thu == thu);
        if (lichThu) {
            let { tietBatDau: currentTietBatDau, soTietBuoi: currentSoTietBuoi, coSo: currentCoSo } = lichThu;
            tietBatDau = parseInt(tietBatDau);
            soTietBuoi = parseInt(soTietBuoi);
            const tietKetThuc = tietBatDau + soTietBuoi - 1,
                currentTietKetThuc = currentTietBatDau + currentSoTietBuoi - 1;
            if (tietBatDau.isBetween(currentTietBatDau, currentTietKetThuc)
                || tietKetThuc.isBetween(currentTietBatDau, currentTietKetThuc)
                || (tietBatDau < currentTietBatDau && tietKetThuc > currentTietKetThuc)) {
                return { errorCode: 1 };
            }
            else {
                if (coSo != currentCoSo) {
                    if (tietBatDau - currentTietKetThuc > 1) {
                        return { errorCode: 2 };
                    }
                }
            }
        }

        return currentSched;
    };

    app.model.dtThoiKhoaBieuGiangVien.exportDiemDanh = async (maHocPhan, worksheet) => {
        const [dataTuan, listStudent, dataDiemDanh, infoHocPhan] = await Promise.all([
            app.model.dtThoiKhoaBieuCustom.getAll({ maHocPhan }, '*', 'id'),
            app.model.dtDangKyHocPhan.getStudent(maHocPhan, app.utils.stringify({}), 'mssv', 'ASC'),
            app.model.dtThoiKhoaBieuDiemDanh.getAll({ maHocPhan }),
            app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
        ]);

        const { namHoc, hocKy, maMonHoc, tenMonHoc, tenHe, listNienKhoa } = infoHocPhan.rows[0],
            cells = [], alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };

        worksheet.getCell('A7').value = `Năm học: ${namHoc}`;
        worksheet.getCell('D7').value = `Học kỳ: ${hocKy}`;
        worksheet.getCell('G7').value = `Khóa học: ${listNienKhoa}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('A9').value = `Mã học phần: ${maHocPhan}`;
        worksheet.getCell('F9').value = `Tên học phần: ${maMonHoc} - ${app.utils.parse(tenMonHoc, { vi: '' }).vi}`;

        dataTuan.forEach((tuan, index) => cells.push({
            cell: `${app.excel.numberToExcelColumn(8 + index)}12`, border: '1234', value: `${app.date.viDateFormat(new Date(Number(tuan.ngayHoc)))} \r\n Tiết ${tuan.tietBatDau} - ${tuan.tietBatDau + tuan.soTietBuoi - 1}`,
            alignment, font: { size: 9 },
        }));

        cells.push({
            cell: `${app.excel.numberToExcelColumn(8 + dataTuan.length)}12`, border: '1234', value: 'Ghi chú', alignment
        });

        listStudent.rows.forEach((stu, index) => {
            const pos = 13 + index,
                diemDanh = dataDiemDanh.find(dd => dd.mssv == stu.mssv);

            worksheet.mergeCells(`B${pos}:C${pos}`);
            worksheet.mergeCells(`D${pos}:F${pos}`);

            cells.push(
                { cell: `A${pos}`, border: '1234', value: index + 1, alignment },
                { cell: `B${pos}`, border: '1234', value: stu.mssv, alignment },
                { cell: `D${pos}`, border: '1234', value: stu.ho, alignment },
                { cell: `G${pos}`, border: '1234', value: stu.ten, alignment },
                { cell: `${app.excel.numberToExcelColumn(8 + dataTuan.length)}${pos}`, border: '1234', value: diemDanh?.ghiChu || '', alignment },
            );
            dataTuan.forEach((tuan, idx) => {
                const isAbsent = diemDanh && diemDanh.listTuan ? diemDanh.listTuan.split(',').includes(tuan.id.toString()) : false;
                cells.push({
                    cell: `${app.excel.numberToExcelColumn(8 + idx)}${pos}`, border: '1234', value: isAbsent ? 'X' : '', alignment
                });
            });
        });

        return cells;
    };

    app.model.dtThoiKhoaBieuGiangVien.exportLichDay = async (maHocPhan, worksheet) => {
        let [infoHocPhan, dataTuan] = await Promise.all([
            app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
            app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({})),
        ]);

        dataTuan = dataTuan.rows.map(tuan => {
            let ngayNghi = dataTuan.rows.find(ngay => ngay.idTuan == tuan.idNgayNghi);
            return { ...tuan, tuanBatDau: new Date(tuan.ngayHoc).getWeek(), ngayNghi: ngayNghi ? ngayNghi.ngayHoc : '' };
        });

        const { namHoc, hocKy, maMonHoc, tenMonHoc, tenHe, listNienKhoa } = infoHocPhan.rows[0],
            alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };

        worksheet.getCell('E5').value = 'LỊCH GIẢNG DẠY';
        worksheet.getCell('A7').value = `Năm học: ${namHoc}`;
        worksheet.getCell('D7').value = `Học kỳ: ${hocKy}`;
        worksheet.getCell('G7').value = `Khóa học: ${listNienKhoa}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('A9').value = `Mã học phần: ${maHocPhan}`;
        worksheet.getCell('F9').value = `Tên học phần: ${maMonHoc} - ${app.utils.parse(tenMonHoc, { vi: '' }).vi}`;
        worksheet.unMergeCells('B12');
        worksheet.unMergeCells('D12');

        let cells = [
            { cell: 'A12', value: 'STT', bold: true, border: '1234' },
            { cell: 'B12', value: 'TUẦN', bold: true, border: '1234' },
            { cell: 'C12', value: 'NGÀY HỌC', bold: true, border: '1234' },
            { cell: 'D12', value: 'THỨ', bold: true, border: '1234' },
            { cell: 'E12', value: 'TIẾT HỌC', bold: true, border: '1234' },
            { cell: 'F12', value: 'THỜI GIAN HỌC', bold: true, border: '1234' },
            { cell: 'G12', value: 'PHÒNG', bold: true, border: '1234' },
            { cell: 'H12', value: 'GIẢNG VIÊN', bold: true, border: '1234' },
            { cell: 'I12', value: 'TRỢ GIẢNG', bold: true, border: '1234' },
            { cell: 'J12', value: 'GHI CHÚ', bold: true, border: '1234' },
        ];

        for (let [index, item] of dataTuan.entries()) {
            let ghiChu = '';

            if (item.isBu) {
                ghiChu = `Học bù cho ngày ${app.date.viDateFormat(new Date(item.ngayNghi))}`;
            } else if (item.isNgayLe) {
                ghiChu = `Nghỉ lễ: ${item.tenNgayLe}`;
            } else if (item.isNghi) {
                ghiChu = `Giảng viên báo nghỉ: ${item.ghiChu}`;
            }

            cells.push({ cell: 'A' + (index + 13), border: '1234', number: index + 1, alignment });
            cells.push({ cell: 'B' + (index + 13), border: '1234', value: item.tuanBatDau, alignment });
            cells.push({ cell: 'C' + (index + 13), border: '1234', value: app.date.viDateFormat(new Date(item.ngayHoc)), alignment });
            cells.push({ cell: 'D' + (index + 13), border: '1234', value: item.thu, alignment });
            cells.push({ cell: 'E' + (index + 13), border: '1234', value: `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}`, alignment });
            cells.push({ cell: 'F' + (index + 13), border: '1234', value: `${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`, alignment });
            cells.push({ cell: 'G' + (index + 13), border: '1234', value: item.phong || '', alignment });
            cells.push({ cell: 'H' + (index + 13), border: '1234', value: item.dataTenGiangVien || '', alignment });
            cells.push({ cell: 'I' + (index + 13), border: '1234', value: item.dataTenTroGiang || '', alignment });
            cells.push({ cell: 'J' + (index + 13), border: '1234', value: ghiChu, alignment });
        }
        return cells;
    };

    app.model.dtThoiKhoaBieuGiangVien.exportDanhSachSinhVien = async (maHocPhan, worksheet) => {
        const [listStudent, infoHocPhan] = await Promise.all([
            app.model.dtDangKyHocPhan.getStudent(maHocPhan, app.utils.stringify({}), 'mssv', 'ASC'),
            app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
        ]);

        const { namHoc, hocKy, maMonHoc, tenMonHoc, tenHe, listNienKhoa } = infoHocPhan.rows[0],
            cells = [], alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };

        worksheet.getCell('E5').value = 'DANH SÁCH SINH VIÊN';
        worksheet.getCell('A7').value = `Năm học: ${namHoc}`;
        worksheet.getCell('D7').value = `Học kỳ: ${hocKy}`;
        worksheet.getCell('G7').value = `Khóa học: ${listNienKhoa}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('J7').value = `Hệ: ${tenHe}`;
        worksheet.getCell('A9').value = `Mã học phần: ${maHocPhan}`;
        worksheet.getCell('F9').value = `Tên học phần: ${maMonHoc} - ${app.utils.parse(tenMonHoc, { vi: '' }).vi}`;

        cells.push(
            { cell: 'H12', border: '1234', value: 'Lớp', alignment },
            { cell: 'I12', border: '1234', value: 'Ngành', alignment },
            { cell: 'J12', border: '1234', value: 'Khóa sinh viên', alignment },
            { cell: 'K12', border: '1234', value: 'Hệ', alignment },
            { cell: 'L12', border: '1234', value: 'Ghi chú', alignment },
        );

        listStudent.rows.forEach((stu, index) => {
            const pos = 13 + index;

            worksheet.mergeCells(`B${pos}:C${pos}`);
            worksheet.mergeCells(`D${pos}:F${pos}`);

            cells.push(
                { cell: `A${pos}`, border: '1234', value: index + 1, alignment },
                { cell: `B${pos}`, border: '1234', value: stu.mssv, alignment },
                { cell: `D${pos}`, border: '1234', value: stu.ho, alignment: { ...alignment, horizontal: 'left' } },
                { cell: `G${pos}`, border: '1234', value: stu.ten, alignment: { ...alignment, horizontal: 'left' } },
                { cell: `H${pos}`, border: '1234', value: stu.lop, alignment },
                { cell: `I${pos}`, border: '1234', value: stu.tenNganh, alignment },
                { cell: `J${pos}`, border: '1234', value: stu.khoaSinhVien, alignment },
                { cell: `K${pos}`, border: '1234', value: stu.heDaoTao, alignment },
                { cell: `L${pos}`, border: '1234', value: '', alignment },
            );
        });
        return cells;
    };

    app.model.dtThoiKhoaBieuGiangVien.exportDanhSachThi = async (maHocPhan, kyThi, dataToPrint) => {
        const kyThiMapper = {
            'CK': 'THI CUỐI KỲ',
            'GK': 'THI GIỮA KỲ',
        };

        const tenKyThiMapper = {
            'CK': 'Cuối kỳ',
            'GK': 'Giữa kỳ',
        };

        let [infoHocPhan, listDinhChi, listCamThi] = await Promise.all([
            app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
            app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi }),
            app.model.dtDiemAll.getAll({ diemDacBiet: 'CT', maHocPhan, loaiDiem: kyThi }, 'mssv'),
        ]);

        listCamThi = listCamThi.map(i => i.mssv);

        let { namHoc, hocKy, tenMonHoc, tenHe, listNienKhoa, tenNganh, ngayBatDau, ngayKetThuc, lichThi } = infoHocPhan.rows[0],
            dataSample = { maHocPhan, kyThi, namHoc, hocKy };

        const { configDefault, tpHocPhan, tpMonHoc } = await app.model.dtAssignRoleNhapDiem.getData(1, 5, app.utils.stringify({ namHoc, hocKy, maHocPhan })).then(i => i.rows[0]);
        let tpDiem = tpHocPhan || tpMonHoc || configDefault;
        tpDiem = tpDiem ? JSON.parse(tpDiem) : [];

        dataSample.tenKyThi = tenKyThiMapper[kyThi];
        dataSample.tyLeDiem = tpDiem.find(tp => tp.thanhPhan == kyThi)?.phanTram || '';
        dataSample.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
        dataSample.tenHe = tenHe || '';
        dataSample.listNienKhoa = listNienKhoa || '';
        dataSample.tenNganh = tenNganh || '';
        dataSample.titleThi = kyThiMapper[kyThi];
        dataSample.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
        dataSample.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
        if (dataSample.ngayBatDau && dataSample.ngayKetThuc) dataSample.ngayBatDau = `${dataSample.ngayBatDau} - `;

        lichThi = lichThi ? JSON.parse(lichThi).filter(item => item.kyThi == kyThi) : [];

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

                dataToPrint.forEach(data => {
                    if (data.idExam == idExam) {
                        data.pT = page;
                        data.isGen = data.p == page;
                    }
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
                dataToPrint.push({ ...dataSample, p: page, ngayThi: '', phongThi: '', gioThi: '', a: dataStudent });
            }

            if (lastSv.length) {
                page = page + 1;
                dataToPrint.push({ ...dataSample, p: page, ngayThi: '', phongThi: '', gioThi: '', a: lastSv });
            }

            dataToPrint.forEach(data => {
                if (data.maHocPhan == maHocPhan) {
                    data.pT = page;
                    data.isGen = data.p == page;
                }
            });
        }
    };

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

    app.model.dtThoiKhoaBieuGiangVien.exportBangDiemXacNhan = async (maHocPhan, kyThi, email, listBarCodeImg, dataToPrint) => {
        const kyThiMapper = {
            'CK': 'ĐIỂM CUỐI KỲ',
            'GK': 'ĐIỂM GIỮA KỲ',
        };
        app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-xac-nhan'));

        let infoHocPhan = await app.model.dtThoiKhoaBieu.getInfo(maHocPhan);

        let { namHoc, hocKy, maMonHoc, tenMonHoc, tenHe, listNienKhoa, tenNganh, ngayBatDau, ngayKetThuc } = infoHocPhan.rows[0],
            dataSample = { maHocPhan, namHoc, hocKy, dd: new Date().getDate(), mm: new Date().getMonth() + 1, yyyy: new Date().getFullYear() };
        dataSample.titleThi = kyThiMapper[kyThi];
        dataSample.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
        dataSample.tenHe = tenHe || '';
        dataSample.listNienKhoa = listNienKhoa || '';
        dataSample.tenNganh = tenNganh || '';
        dataSample.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
        dataSample.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
        if (dataSample.ngayBatDau && dataSample.ngayKetThuc) dataSample.ngayBatDau = `${dataSample.ngayBatDau} - `;

        let dataAssignRole = await app.model.dtAssignRoleNhapDiem.parseData({ namHoc, hocKy, maHocPhan });

        if (kyThi == 'CK') dataAssignRole = dataAssignRole.filter(i => i.thanhPhan && i.thanhPhan == 'CK');
        else dataAssignRole = dataAssignRole.filter(i => i.thanhPhan && i.thanhPhan != 'CK');
        for (let data of dataAssignRole) {
            const { thanhPhan, tenThanhPhan, phanTram, idExam, batDau, ketThuc, phong, tpDiem } = data;
            kyThi = thanhPhan;
            if (kyThi != 'CK') {
                dataSample.tlTX = tpDiem.find(tp => tp.thanhPhan == 'DGTX')?.phanTram || '0';
                dataSample.tlGK = tpDiem.find(tp => tp.thanhPhan == 'GK')?.phanTram || '0';
            }

            dataSample.tenKyThi = tenThanhPhan;
            dataSample.tyLe = phanTram;
            dataSample.kyThi = thanhPhan;

            const codeFile = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam }, email);

            let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + idExam + Date.now() + '.png');
            app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
            await genBarCode(codeFile, barCodeImage);
            dataSample.code = barCodeImage;
            listBarCodeImg.push(barCodeImage);

            if (idExam) {
                let [listStudentExam, listDinhChi] = await Promise.all([
                    app.model.dtExamDanhSachSinhVien.getAll({
                        statement: 'idExam = :idExam AND idDinhChiThi IS NULL',
                        parameter: { idExam }
                    }),
                    app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi, idExam }),
                ]),
                    page = 0;

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
                        ...dataSample, idExam, p: page,
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

                dataToPrint.forEach(data => {
                    if (data.idExam == idExam) {
                        data.pT = page;
                        data.isGen = data.p == page;
                    }
                });
            } else {
                let [listDinhChi, listStudent] = await Promise.all([
                    app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi }),
                    app.model.dtDangKyHocPhan.getAll({ maHocPhan }),
                ]), page = 0;

                listStudent = await handleGetStudent(listStudent, listDinhChi, maHocPhan);

                let listStudentExam = listStudent.filter(i => !i.idDinhChiThi || i.kyThiDinhChi == kyThi);

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

                dataToPrint.forEach(data => {
                    if (data.maHocPhan == maHocPhan) {
                        data.pT = page;
                        data.isGen = data.p == page;
                    }
                });
            }
        }
    };
};