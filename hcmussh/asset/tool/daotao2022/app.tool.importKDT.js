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
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.khoadaotao.xlsx'));
        if (workbook) {
            const dataSheet = workbook.getWorksheet('Sheet1');
            if (!dataSheet) {
                console.log('Error: dataSheet not found');
                process.exit(1);
            } else {
                app.model.dtKhoaDaoTao.delete({});
                let index = 1;
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
                            maKhoa: getVal('A').toUpperCase(),
                            nienKhoa: getVal('B'),
                            he: getVal('D').toUpperCase()
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Reading line ${index}`);

                        let [namTuyenSinh, namKetThuc] = data.nienKhoa.split('-');
                        data.namTuyenSinh = namTuyenSinh;
                        data.thoiGian = parseInt(namKetThuc) - parseInt(namTuyenSinh);
                        data.dotTuyenSinh = 1;
                        const checkKhoa = await app.model.dtKhoaDaoTao.get({ he: data.he, namTuyenSinh });
                        if (checkKhoa) {
                            console.log(checkKhoa);
                            data.dotTuyenSinh = 2;
                        }
                        await app.model.dtKhoaDaoTao.create(data);
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
