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
require('../../config/lib/date')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.adjustTrinhDoPhoThong.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const data = await app.model.dtDiemScanFile.getAll({
            statement: 'idSemester = 1 AND id between 1510 and 1693',
            parameter: {}
        });

        const dataFile = [];

        let workbook = await app.excel.readFile(app.path.join(__dirname, './errorScan.xlsx')); if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            if (worksheet) {
                let index = 2;
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = worksheet.getCell(column + index).text.trim();
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (worksheet.getCell('A' + index).value == null) {
                        break;
                    } else {
                        const x = {
                            maHocPhan: getVal('A'),
                            stuIdIndex: getVal('B'),
                            kyThi: getVal('C'),
                            quantity: getVal('D'),
                            idFile: getVal('E'),
                        }
                        dataFile.push({ ...x });
                    }
                    index++;
                }
            } else {
                console.log('Error: worksheet not found');
            }
        } else {
            console.log('Error: workbook not found');
        }

        const list = [1705, 1706];
        const error = [];

        for (const item of data) {
            if (!list.includes(Number(item.id))) {
                const dataUpdate = dataFile.find(i => i.idFile == parseInt(item.id) + 1)
                if (dataUpdate) {
                    const { maHocPhan, stuIdIndex, kyThi, quantity } = dataUpdate;
                    await app.model.dtDiemScanFile.update({ id: item.id }, { maHocPhan, stuIdIndex, quantity, kyThi });
                    console.log('Done: ', item.id);
                } else {
                    error.push(item.id);
                }
            } else {
                error.push(item.id);
            }
        }

        app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'error.json'), JSON.stringify(error));
    },
});