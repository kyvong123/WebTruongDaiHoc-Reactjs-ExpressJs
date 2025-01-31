let package = require('../../../package.json');
const path = require('path');
const e = require('cors');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../../', 'public'),
    assetPath: path.join(__dirname, '../../'),
    modulesPath: path.join(__dirname, '../../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../../config.json'));
// Configure ==================================================================
require('../../../config/common')(app);
require('../../../config/lib/fs')(app);
require('../../../config/lib/excel')(app);
require('../../../config/lib/hooks')(app);
require('../../../config/lib/utils')(app);
require('../../../config/lib/date')(app);
require('../../../config/lib/string')(app);
require('../../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.hopdonglaodong.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const loaiHopDongMapper = {
            2: '01',
            12: '04',
            24: '05'
        };
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.hdld.xlsx'));
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            if (worksheet) {
                let index = 2;
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = worksheet.getCell(column + index).value;
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (worksheet.getCell('A' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    } else {
                        const data = {
                            shcc: getVal('B'),
                            ho: getVal('E'),
                            ten: getVal('F'),
                            soHopDong: getVal('D'),
                            loaiHopDong: getVal('C'),
                            batDauLamViec: getVal('H') ? new Date(getVal('H')).getTime() : '',
                            ketThucHopDong: getVal('I') ? new Date(getVal('I')).getTime() : '',
                            ngayKyHdTiepTheo: getVal('J') ? new Date(getVal('J')).getTime() : '',
                            ngayKyHopDong: getVal('K') ? new Date(getVal('K')).getTime() : '',
                            congViecDuocGiao: 'Theo sự phân công của ',
                            thoiGianLamViec: 'Theo quy định của Nhà Trường',
                            dungCuLamViec: 'Theo quy định hiện hành',
                            phuongTienLamViec: 'Cá nhân tự túc',
                            hinhThucTraLuong: 'Được trả 01 lần vào ngày 25 hàng tháng qua hệ thống ATM của ngân hàng (BIDV hoặc VIETCOMBANK).',
                            cheDoNghiNgoi: 'Theo quy định của Luật Lao động và quy chế của Nhà trường.',
                            boiThuong: 'Theo quy định hiện hành',
                            chiuSuPhanCong: 'Chịu sự điều hành, quản lý của '
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Reading line ${index}`);
                        // console.log(data);
                        if (isNaN(data.ngayKyHopDong)) {
                            const date = getVal('K').trim();
                            data.ngayKyHopDong = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.batDauLamViec)) {
                            const date = getVal('H').trim();
                            data.batDauLamViec = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime().trim();
                        }
                        if (isNaN(data.ketThucHopDong)) {
                            const date = getVal('I').trim();
                            data.ketThucHopDong = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.ngayKyHdTiepTheo)) {
                            const date = getVal('J').trim();
                            data.ngayKyHdTiepTheo = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (data.loaiHopDong != '07') {
                            data.loaiHopDong = loaiHopDongMapper[Math.round((data.ketThucHopDong - data.batDauLamViec) / (30 * 24 * 60 * 60 * 1000))];
                        }
                        if (typeof data.shcc == 'string') {
                            const checkCanBo = await app.model.tchcCanBo.get({ shcc: data.shcc });
                            if (!checkCanBo) {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                console.log(`- Dòng ${index}, ${data.shcc}: ${data.ho.trim().toUpperCase()} ${data.ten.trim().toUpperCase()}`);
                            } else {
                                data.diaDiemLamViec = checkCanBo.maDonVi;
                                const donVi = await app.model.dmDonVi.get({ ma: checkCanBo.maDonVi });
                                if (donVi) {
                                    if (donVi.maPl == '1') {
                                        data.tenDonVi = `Trưởng Khoa ${donVi.ten}`;
                                    } else {
                                        data.tenDonVi = `Trưởng/Giám đốc ${donVi.ten}`;
                                    }
                                }
                                data.maNgach = checkCanBo.ngach;
                                data.bac = checkCanBo.bacLuong || '';
                                data.heSo = checkCanBo.heSoLuong ? Number(checkCanBo.heSoLuong).toFixed(2) : '';
                                if (checkCanBo.ngach) {
                                    const ngach = await app.model.dmNgachCdnn.get({ ma: checkCanBo.ngach });
                                    if (ngach) {
                                        data.ngach = ngach.id;
                                    }
                                }
                                data.nguoiKy = '424.0002';
                                data.chucVu = '03';
                                data.nguoiDuocThue = data.shcc;
                                data.congViecDuocGiao += `${data.tenDonVi}`;
                                data.chiuSuPhanCong += `${data.tenDonVi}`;
                            }
                        } else {
                            console.log(`+ Dữ liệu lỗi: Dòng ${index}, ${data.shcc.error} ${data.ho} ${data.ten}`);
                        }
                        // console.log(data);
                        const checkHopDong = await app.model.qtHopDongLaoDong.get({ soHopDong: data.soHopDong.trim() });
                        if (!checkHopDong) {
                            await app.model.qtHopDongLaoDong.create(data);
                        }
                        index++
                    }
                }
            } else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});
