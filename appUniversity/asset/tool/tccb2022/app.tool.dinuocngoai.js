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
app.readyHooks.add('Run tool.nghiphep.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.dinuocngoai.xlsx'));
        if (workbook) {
            forLoop: for (let i = 1; i <= 12; i++) {
                const worksheet = workbook.getWorksheet(`${2023 - i}`);
                if (worksheet) {
                    if (worksheet) {
                        let index = 2;
                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text;
                                return val === '' ? Default : (val == null ? '' : val);
                            }
                            if (worksheet.getCell('D' + index).text == '') {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                continue forLoop;
                            } else {
                                const data = {
                                    ho: getVal('D').trim(),
                                    ten: getVal('E').trim(),
                                    donVi: getVal('G').trim(),
                                }
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Reading line ${index}`);
                                // console.log(data);
                                const checkCanBo = await app.model.tchcCanBo.getAll({
                                    statement: 'lower(ho) || \' \' || lower(ten) LIKE :hoTen',
                                    parameter: {
                                        hoTen: `%${data.ho.toLowerCase()} ${data.ten.toLowerCase()}%`
                                    }
                                }, 'shcc,ho,ten,maDonVi');
                                if (!checkCanBo || !checkCanBo.length) {
                                    process.stdout.clearLine();
                                    process.stdout.cursorTo(0);
                                    console.error(`Sheet ${2023 - i}, dòng ${index}: ${data.ho} ${data.ten} || ${data.donVi}`);
                                }
                                index++
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
