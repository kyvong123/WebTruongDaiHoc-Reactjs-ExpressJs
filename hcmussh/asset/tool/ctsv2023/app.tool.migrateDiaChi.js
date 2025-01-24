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
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.datasinhvien.xlsx'));
        if (workbook) {
            const dataSheet = workbook.getWorksheet('SV VN');
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
                            mssv: getVal('A'),
                            noiSinh: getVal('R').trim().toLowerCase().replaceAll('tp. ', ''),
                            thuongTruSoNha: getVal('Y'),
                            thuongTruMaTinh: getVal('AC').trim().toLowerCase().replaceAll('tp. ', ''),
                            thuongTruMaHuyen: getVal('AE').trim().toLowerCase(),
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Reading line ${index}`);

                        const tinh = await app.model.dmTinhThanhPho.get({
                            statement: 'lower(ten) LIKE :ten',
                            parameter: { ten: `%${data.thuongTruMaTinh}%` }
                        });

                        if (!tinh) console.log(` ${data.thuongTruMaTinh} not found`);
                        else {
                            const huyen = await app.model.dmQuanHuyen.get({
                                statement: 'lower(tenQuanHuyen) LIKE :ten AND maTinhThanhPho = :tinh',
                                parameter: {
                                    ten: `%${data.thuongTruMaHuyen.replaceAll('quận 2', 'thủ đức')
                                        .replaceAll('quận 9', 'thủ đức').replaceAll('quận thủ đức', 'thủ đức').replaceAll('thị xã dĩ an', 'dĩ an').replaceAll('thị xã thuận an', 'thuận an').replaceAll('huyện ', '')
                                        }%`,
                                    tinh: tinh.ma
                                }
                            });
                            if (!huyen) console.log(` ${data.thuongTruMaHuyen} not found`);
                            else await app.model.fwStudent.update({ mssv: data.mssv }, { thuongTruSoNha: data.thuongTruSoNha, thuongTruMaHuyen: huyen.maQuanHuyen });
                        }

                        index++
                    }
                }
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});
