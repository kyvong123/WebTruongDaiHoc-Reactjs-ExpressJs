let package = require('../../package.json');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../', 'public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../config.json'));
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/hooks')(app);
require('../../config/lib/utils')(app);
require('../../config/lib/string')(app);
require('../../config/lib/date')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.changeIdScanFile.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const filter = { namHoc: '2023 - 2024', hocKy: 1 };
        let [items, statusCode] = await Promise.all([
            app.model.dtAssignRoleNhapDiem.parseData({ ...filter, isAll: 1 }),
            app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
        ]);

        items = items.map(item => {
            const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                { idCode, userPrint, printTime } = code || {};
            return { ...item, isVerified: code && code.isVerified, idCode, userPrint, printTime };
        });

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('MA_XAC_THUC');

        ws.columns = [
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
        ];

        items = await Promise.all(items.map(async item => {
            item.tenMonHoc = app.utils.parse(item.tenMonHoc || { vi: '' }).vi;
            item.loaiDiem = item.thanhPhan == 'CK' ? item.tenThanhPhan : 'Quá trình';
            item.caThi = item.idExam ? `Ca thi: ${item.caThi} \r\n Phòng:${item.phong} \r\n Ngày:${item.batDau ? app.date.viDateFormat(new Date(Number(item.batDau))) : ''}` : '';
            item.maXacThuc = item.idCode;
            item.tinhTrang = item.isVerified ? 'Đã xác nhận' : 'Chưa xác nhận';
            const roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan));
            item.nguoiNhapDiem = roleNhapDiem.length ? roleNhapDiem.map(role => role.tenGiangVien).map(gv => `${gv}`).join(', \r\n') : '';

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

            return { ...item };
        }));

        items.forEach((item, index) => {
            ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
        });

        await workBook.xlsx.writeFile(app.path.join(__dirname, 'nhap_diem.xlsx'));
    }
});