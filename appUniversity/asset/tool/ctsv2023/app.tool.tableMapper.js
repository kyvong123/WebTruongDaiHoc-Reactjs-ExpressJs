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
    ready: () => app.database.oracle.connected && app.model && app.model.dmTinhThanhPho,
    run: async () => {
        try {
            let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.mapper.xlsx'));
            if (!workbook) throw 'Error: workbook not found';
            const worksheets = workbook.worksheets;
            if (!worksheets || worksheets.length == 0) throw 'Error: Empty workbook!';

            let dataTableMapper = null;
            if (app.fs.existsSync('./data/TableMapper.json')) {
                dataTableMapper = app.utils.parse(app.fs.readFileSync('./data/TableMapper.json'));
            } else {
                dataTableMapper = {}
            }

            worksheets.forEach((sheet, index) => {
                if (dataTableMapper[sheet.name]) {
                    const value = dataTableMapper[sheet.name];
                    if (typeof value == 'string' || Array.isArray(value)) {
                        dataTableMapper[sheet.name] = {
                            model: value,
                            colName: '',
                            mappedCol: '',
                            mappedId: ''
                        };
                    } else {
                        dataTableMapper[sheet.name] = {
                            ...value,
                            mappedCol: '',
                            mappedId: ''
                        };
                    }
                } else {
                    dataTableMapper[sheet.name] = {
                        model: '',
                        colName: '',
                        mappedCol: '',
                        mappedId: ''
                    };
                }
            })

            await app.fs.writeFileSync('./data/TableMapper.json', app.utils.stringify(dataTableMapper));

            console.log('Finish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
