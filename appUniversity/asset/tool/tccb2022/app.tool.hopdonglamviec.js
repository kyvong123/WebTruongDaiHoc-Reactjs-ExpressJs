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
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.hdlv.xlsx'));
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
                            soHopDong: getVal('C'),
                            soQd: getVal('D'),
                            ngayKyQuyetDinh: getVal('E') ? new Date(getVal('E')).getTime() : '',
                            ho: getVal('H'),
                            ten: getVal('I'),
                            loaiHd: getVal('J'),
                            ngayBatDauLamViec: getVal('L') ? new Date(getVal('L')).getTime() : '',
                            ngayKetThucHopDong: getVal('M') ? new Date(getVal('M')).getTime() : '',
                            ngayKyHdTiepTheo: getVal('N') ? new Date(getVal('N')).getTime() : '',
                            ngayKyHopDong: getVal('P') ? new Date(getVal('P')).getTime() : '',
                            hieuLucHopDong: getVal('O') ? new Date(getVal('O')).getTime() : '',
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Reading line ${index}`);
                        // console.log(data);
                        if (isNaN(data.ngayKyQuyetDinh)) {
                            const date = getVal('E');
                            data.ngayKyQuyetDinh = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.ngayKyHopDong)) {
                            const date = getVal('P');
                            data.ngayKyHopDong = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.ngayBatDauLamViec)) {
                            const date = getVal('L');
                            data.ngayBatDauLamViec = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.ngayKetThucHopDong)) {
                            const date = getVal('M');
                            data.ngayKetThucHopDong = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.ngayKyHdTiepTheo)) {
                            const date = getVal('N');
                            data.ngayKyHdTiepTheo = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (isNaN(data.hieuLucHopDong)) {
                            const date = getVal('O');
                            data.hieuLucHopDong = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                        }
                        if (data.loaiHd != '07') {
                            data.loaiHd = '08';
                        } else {
                            data.loaiHd = '09';
                        }
                        if (typeof data.shcc == 'string') {
                            const checkCanBo = await app.model.tchcCanBo.get({ shcc: data.shcc });
                            if (!checkCanBo) {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                console.log(`- Dòng ${index}, ${data.shcc}: ${data.ho.trim().toUpperCase()} ${data.ten.trim().toUpperCase()}`);
                            } else {
                                data.diaDiemLamViec = checkCanBo.maDonVi;
                                data.maNgach = checkCanBo.ngach;
                                data.bac = checkCanBo.bacLuong || '';
                                data.heSo = checkCanBo.heSoLuong ? Number(checkCanBo.heSoLuong).toFixed(2) : '';
                                data.nguoiKy = '424.0002';
                                data.nguoiDuocThue = data.shcc;

                                const checkHopDong = await app.model.qtHopDongVienChuc.get({ soQd: data.soQd });
                                if (!checkHopDong) {
                                    await app.model.qtHopDongVienChuc.create(data);
                                } else {
                                    console.log(` - Duplicate line: ${index}: ${data.soHopDong}, ${data.soQd}`);
                                    await app.model.qtHopDongVienChuc.update({ soQd: data.soQd }, data);

                                }
                            }
                        }
                        // console.log(data);

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
