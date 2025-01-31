module.exports = app => {
    app.executeTask.exportDiem = async ({ filter, dataThanhPhan }) => {
        let { rows } = await app.model.dtDiemAll.searchPage(1, 10000000, filter);
        dataThanhPhan = JSON.parse(dataThanhPhan);

        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Họ tên', key: 'hoTen', width: 20 },
            { header: 'Học phần', key: 'maHocPhan', width: 20 },
            { header: 'Tên học phần', key: 'tenHocPhan', width: 20 },
            { header: 'Thành phần điểm', key: 'thanhPhanDiem', width: 25 },
            ...dataThanhPhan.map(i => ({ header: i.loaiDiem, key: i.ma, width: 25 })),
            { header: 'Tổng kết', key: 'tongKet', width: 25 },
        ];

        rows = rows.map(item => {
            let diem = item.diem ? JSON.parse(item.diem) : {},
                diemDacBiet = item.diemDacBiet ? JSON.parse(item.diemDacBiet) : {},
                phanTramDiem = item.phanTramDiem ? JSON.parse(item.phanTramDiem) : {},
                tp = dataThanhPhan.filter(i => Object.keys(phanTramDiem).includes(i.ma));

            let rowData = {
                ...item,
                tenHocPhan: app.utils.parse(item.tenMonHoc || { vi: '' }).vi,
                thanhPhanDiem: tp.map(i => `${i.loaiDiem}: ${phanTramDiem[i.ma]}%`).join('\r\n'),
                tongKet: diem['TK'],
            };
            dataThanhPhan.forEach(i => rowData[i.ma] = diemDacBiet[i.ma] ? `${diem[i.ma]} (${diemDacBiet[i.ma]})` : diem[i.ma]);
            return rowData;
        });
        return ({ defaultColumns, rows, filename: 'DataDiem.xlsx' });
    };

    app.executeTask.exportHistoryDiem = async ({ filter }) => {
        let { rows } = await app.model.dtDiemHistory.searchPage(1, 10000000, filter);

        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Họ tên', key: 'hoTen', width: 20 },
            { header: 'Học phần', key: 'maHocPhan', width: 20 },
            { header: 'Tên học phần', key: 'tenMon', width: 20 },
            { header: 'Loại', key: 'tenLoaiDiem', width: 25 },
            { header: '%', key: 'phanTramDiem', width: 25 },
            { header: 'Điểm mới', key: 'newDiem', width: 25 },
            { header: 'Điểm cũ', key: 'oldDiem', width: 25 },
            { header: 'Điểm khác', key: 'diemDacBiet', width: 25 },
            { header: 'Người chỉnh sửa', key: 'userModified', width: 25 },
            { header: 'Thời gian chỉnh sửa', key: 'timeMod', width: 25 },
            { header: 'Ghi chú', key: 'ghiChu', width: 25 },
            { header: 'Hình thức ghi', key: 'hinhThucGhi', width: 25 },
        ];

        rows.forEach((item) => {
            let rowData = {
                ...item,
                tenMon: app.utils.parse(item.tenMonHoc || { vi: '' }).vi,
                timeMod: item.timeModified ? app.date.viDateFormat(new Date(item.timeModified)) : '',
            };
            return rowData;
        });
        return ({ defaultColumns, rows, filename: 'Lich_su_nhap_diem.xlsx' });
    };

    app.executeTask.exportAssignRoleNhapDiem = async ({ filter }) => {
        let [items, statusCode] = await Promise.all([
            app.model.dtAssignRoleNhapDiem.parseData({ ...filter, isAll: 1 }),
            app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
        ]);

        let defaultColumns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
            { header: 'Tên học phần', key: 'tenMonHoc', width: 20 },
            { header: 'Điểm thành phần', key: 'diemThanhPhan', width: 20 },
            { header: 'Lớp', key: 'maLop', width: 20 },
            { header: 'Số lượng sinh viên', key: 'slsv', width: 20 },
            { header: 'Ca thi', key: 'caThi', width: 20 },
            { header: 'Giảng viên nhập điểm', key: 'giangVienNhap', width: 20 },
            { header: 'Giảng viên', key: 'giangVien', width: 20 },
            { header: 'Tình trạng', key: 'tinhTrang', width: 20 },
        ];

        items = items.filter(i => i.thanhPhan && (filter.kyThi == 'QT' ? i.thanhPhan != 'CK' : i.thanhPhan == 'CK'));
        items = await Promise.all(items.map(async item => {
            item.tenMonHoc = app.utils.parse(item.tenMonHoc || { vi: '' }).vi;
            item.caThi = item.idExam ? `Ca thi: ${item.caThi} \r\n Phòng:${item.phong} \r\n Ngày:${item.batDau ? app.date.viDateFormat(new Date(Number(item.batDau))) : ''}` : '';
            item.giangVien = item.tenGiangVien ? item.tenGiangVien.split(',').map(gv => `${gv}`).join(', \r\n') : '';

            const roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan));

            item.giangVienNhap = roleNhapDiem.length ? roleNhapDiem.map(role => role.tenGiangVien).map(gv => `${gv}`).join(', \r\n') : '';
            item.diemThanhPhan = item.tpDiem.filter(tp => filter.kyThi == 'QT' ? tp.thanhPhan != 'CK' : tp.thanhPhan == 'CK').sort((a, b) => a.priority - b.priority).map(tp => `${tp.tenThanhPhan}: ${tp.phanTram}%`).join(', \r\n');

            if (!item.thanhPhan) return item;
            const { maHocPhan, thanhPhan, idExam } = item;
            let countStudent = 0, countDinhChi = 0;
            if (idExam) {
                countStudent = await app.model.dtExamDanhSachSinhVien.count({ idExam }).then(count => count.rows[0]['COUNT(*)']);
            } else {
                [countStudent, countDinhChi] = await Promise.all([
                    app.model.dtDangKyHocPhan.count({ maHocPhan }).then(count => count.rows[0]['COUNT(*)']),
                    app.model.dtDinhChiThi.count({ maHocPhanThi: maHocPhan, kyThi: thanhPhan }).then(count => count.rows[0]['COUNT(*)'])
                ]);
                countStudent += countDinhChi;
            }

            const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                { idCode } = code || {};

            item.tinhTrang = code && code.isVerified ? 'Đã xác nhận' : (idCode ? 'Đã nhập điểm' : 'Chưa nhập điểm');
            return { ...item, slsv: countStudent, status: code && code.isVerified ? 3 : (idCode ? 2 : 1) };
        }));

        if (filter.status) items = items.filter(i => i.status == filter.status);

        items.forEach((item, index) => {
            item.stt = index + 1;
        });

        return ({ defaultColumns, rows: items, filename: 'DATA_TINH_TRANG_NHAP_DIEM.xlsx' });
    };

    app.executeTask.exportVerifyCode = async ({ filter }) => {
        let [items, statusCode] = await Promise.all([
            app.model.dtAssignRoleNhapDiem.parseData({ ...filter, isAll: 1 }),
            app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
        ]);

        items = items.map(item => {
            const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                { idCode, userPrint, printTime } = code || {};
            return { ...item, isVerified: code && code.isVerified, idCode, userPrint, printTime };
        });

        let defaultColumns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
            { header: 'Tên học phần', key: 'tenMonHoc', width: 20 },
            { header: 'Loại điểm', key: 'loaiDiem', width: 20 },
            { header: 'Ca thi', key: 'caThi', width: 20 },
            { header: 'Mã xác thực', key: 'maXacThuc', width: 20 },
            { header: 'Tình trạng', key: 'tinhTrang', width: 20 },
            { header: 'Người nhập điểm', key: 'nguoiNhapDiem', width: 20 },
            { header: 'Số lượng sinh viên', key: 'slsv', width: 20 },
            { header: 'Số lượng sinh viên được nhập điểm', key: 'slsvNhap', width: 20 },
            { header: 'Số lượng điểm sinh viên được xác nhận', key: 'slsvVerify', width: 20 },
            { header: 'Thời gian tạo', key: 'timeCreate', width: 20 },
        ];

        items = await Promise.all(items.map(async item => {
            item.tenMonHoc = app.utils.parse(item.tenMonHoc, { vi: '' }).vi;
            item.loaiDiem = item.thanhPhan == 'CK' ? item.tenThanhPhan : 'Quá trình';
            item.caThi = item.idExam ? `Ca thi: ${item.caThi} \r\n Phòng:${item.phong} \r\n Ngày:${item.batDau ? app.date.viDateFormat(new Date(parseInt(Number(item.batDau)))) : ''}` : '';
            item.maXacThuc = item.idCode;
            item.tinhTrang = item.isVerified ? 'Đã xác nhận' : 'Chưa xác nhận';
            item.nguoiNhapDiem = item.userPrint;
            item.timeCreate = item.printTime ? app.date.dateTimeFormat(new Date(Number(item.printTime)), 'HH:MM:ss dd/mm/yyyy') : '';

            if (!item.thanhPhan) return item;
            const { maHocPhan, thanhPhan, idExam } = item;
            let listStudent = [], listDinhChi = [], countNhap = 0, countVerify = 0;
            if (idExam) {
                listStudent = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });
            } else {
                [listStudent, listDinhChi] = await Promise.all([
                    app.model.dtDangKyHocPhan.getAll({ maHocPhan }),
                    app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi: thanhPhan })
                ]);
            }

            if (listStudent.length) {
                countNhap = await app.model.dtDiemAll.count({
                    statement: 'maHocPhan = :maHocPhan AND mssv IN (:list) AND loaiDiem = :loaiDiem',
                    parameter: { loaiDiem: item.thanhPhan, list: listStudent.map(i => i.mssv), maHocPhan }
                }).then(count => count.rows[0]['COUNT(*)']);

                countVerify = await app.model.dtDiemAll.count({
                    statement: 'maHocPhan = :maHocPhan AND mssv IN (:list) AND loaiDiem = :loaiDiem AND isLock = 1',
                    parameter: { loaiDiem: item.thanhPhan, list: listStudent.map(i => i.mssv), maHocPhan }
                }).then(count => count.rows[0]['COUNT(*)']);
            }

            item.slsv = idExam ? listStudent.length : listStudent.length + listDinhChi.length;
            item.slsvNhap = idExam ? countNhap + listDinhChi.length : countNhap;
            item.slsvVerify = idExam ? countVerify + listDinhChi.length : countVerify;
            return item;
        }));

        items.forEach((item, index) => {
            item.stt = index + 1;
        });

        return ({ defaultColumns, rows: items, filename: 'MA_XAC_THUC.xlsx' });
    };
};