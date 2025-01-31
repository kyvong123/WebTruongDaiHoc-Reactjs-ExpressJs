let package = require('../../package.json');
const path = require('path');
const e = require('cors');
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
require('../../config/lib/date')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.checkdatasv.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.datasinhvien.xlsx'));
        if (workbook) {
            forLoop: for (const sheet of ['SV NN', 'SV VN']) {
                const worksheet = workbook.getWorksheet(sheet);
                if (worksheet) {
                    if (worksheet) {
                        let index = 2;
                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text;
                                return val === '' ? Default : (val == null ? '' : val);
                            }
                            if (worksheet.getCell('A' + index).text == '') {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                continue forLoop;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    hoTen: getVal('B'),
                                    loaiHinhDaoTao: getVal('CE'),
                                    lop: getVal('CK'),
                                    tinhTrang: getVal('BG'),
                                    loaiSinhVien: sheet == 'SV NN' ? 'L2' : 'L1'
                                }
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Reading line ${index}`);
                                data.emailTruong = `${data.mssv}@hcmussh.edu.vn`;
                                const checkSinhVien = await app.model.fwStudent.get({ mssv: data.mssv });
                                if (!checkSinhVien) {
                                    const hoTen = data.hoTen.split(' ');
                                    data.ten = hoTen.pop().toUpperCase();
                                    data.ho = hoTen.join(' ').trim().toUpperCase();
                                    data.namTuyenSinh = `20${data.mssv.substring(0, 2)}`;
                                    console.error(`, Not found: ${data.mssv}: ${data.ho} ${data.ten}`);
                                    await app.model.fwStudent.create(data);
                                } else {
                                    const hoTen = data.hoTen.split(' ');
                                    data.ten = hoTen.pop().toUpperCase();
                                    data.ho = hoTen.join(' ').trim().toUpperCase();
                                    data.namTuyenSinh = `20${data.mssv.substring(0, 2)}`;
                                    await app.model.fwStudent.update({ mssv: data.mssv }, data);
                                }
                                index++;
                            }
                        }
                    }
                } else {
                    console.log('Error: worksheet not found');
                }
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});
