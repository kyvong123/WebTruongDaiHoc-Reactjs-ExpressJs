let package = require('../../../package.json');
const path = require('path');
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
app.readyHooks.add('Run tool.importLoaiDangKy.js', {
    ready: () => app.database.oracle.connected && app.model.dtDangKyHocPhan,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.hinhthuc.xlsx'));
        if (workbook) {
            const dataSheet = workbook.getWorksheet('Sheet');
            if (!dataSheet) {
                console.log('Error: dataSheet not found');
                process.exit(1);
            } else {
                let index = 2;
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = dataSheet.getCell(column + index).text;
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (dataSheet.getCell('A' + index).text == '') {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.exit(1);
                    } else {
                        const data = {
                            mssv: getVal('B').toUpperCase(),
                            maHocPhan: getVal('A').toUpperCase(),
                            maLoaiDky: getVal('D')
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Importing line ${index}`);
                        const item = await app.model.dtDangKyHocPhan.get({ mssv: data.mssv, maHocPhan: data.maHocPhan });
                        if (item) {
                            await app.model.dtDangKyHocPhan.update({ id: item.id }, { maLoaiDky: data.maLoaiDky })

                            index++;
                        }
                    }
                }
            } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});
