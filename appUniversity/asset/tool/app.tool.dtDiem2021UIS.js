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
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.dtDiem2021UIS.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.diem2021UIS.xlsx')); if (workbook) {
            const worksheet = workbook.getWorksheet('Sheet1');
            if (worksheet) {
                await app.model.dtDiem.delete();
                let index = 2;
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = worksheet.getCell(column + index).text.trim();
                        if (type == 'number' && val != '') {
                            if (val == 'VT') {
                                val = -1
                            } else {
                                if (!isNaN(val)) val = Number(val).toFixed(2);
                                else val = ''
                            }
                        }
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (worksheet.getCell('A' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    } else {
                        const data = {
                            namHoc: getVal('A'),
                            hocKy: getVal('B'),
                            mssv: getVal('C'),
                            maMonHoc: getVal('D'),
                            maHocPhan: getVal('F'),
                            diemGk: getVal('G', 'number'),
                            diemCk: getVal('H', 'number'),
                            diemTk: getVal('I', 'number'),
                            phanTramDiemGk: getVal('J'),
                            ghiChu: getVal('K')
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Import line ${index}`);
                        data.namHoc = `${data.namHoc.split('-')[0]} - ${data.namHoc.split('-')[1]}`;
                        data.hocKy = data.hocKy.slice(-1);
                        if (data.phanTramDiemGk) {
                            data.phanTramDiemGk = Number(data.phanTramDiemGk);
                            data.phanTramDiemCk = 100 - data.phanTramDiemGk;
                        }
                        await app.model.dtDiem.create(data);
                        index++;
                    }
                }
            }
            else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});