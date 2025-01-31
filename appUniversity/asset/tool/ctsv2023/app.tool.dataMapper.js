let package = require('../../../package.json');
const path = require('path');
// const file = require('modules/mdHanhChinhTongHop/hcthCongVanDen/controller/file');
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
            let dataMapper = null
            if (app.fs.existsSync('./data/DataMapper.json')) {
                dataMapper = app.utils.parse(app.fs.readFileSync('./data/DataMapper.json'));
            } else {
                dataMapper = {};
            }
            const modelMapper = app.utils.parse(app.fs.readFileSync('./data/TableMapper.json'));

            // 
            const normalize = (text, type = 'dialy') => {
                if (typeof text == 'string') {
                    switch (type) {
                        case 'dialy':
                            return text.toLowerCase().replace(/(tỉnh|thành phố|tp.|quận|huyện đảo|huyện|phường|thị xã|tx|cao đẳng|học viện|đại học|trường)/, '')
                                .replaceAll("òa", "oà")
                                .replaceAll(/(ăk|ak|ák)/g, "ắk")
                                .replaceAll("uk", "úk")
                                .replaceAll(/[-_\s]/g, "")
                                .trim().normalize();
                        // .replace("òa", "oà")
                        default:
                            return '';
                    }
                }
            }

            await Promise.all(worksheets.map(async (sheet, index) => {
                let models = modelMapper[sheet.name];
                if (!Array.isArray(models)) {
                    models = [models];
                }
                const sheetValue = sheet.getSheetValues().slice(1);
                await Promise.all(models.map(async model => {
                    if (model.model) {
                        const { mappedCol, mappedId } = model;
                        if (!dataMapper[model.colName]) dataMapper[model.colName] = { notFound: [] };
                        else dataMapper[model.colName].notFound = [];
                        let list = await app.model[model.model].getAll();
                        list.forEach(item => {
                            let itemText = item[mappedCol];
                            let parsed = app.utils.parse(itemText, itemText);
                            parsed = parsed.vi ? parsed.vi : parsed;
                            const candidate = sheetValue.find(row => {
                                const [, id, text] = row;
                                return normalize(parsed) == normalize(text)
                            })
                            try {
                                if (candidate) {
                                    const [, id, text] = candidate;
                                    dataMapper[model.colName][item[mappedId]] = { id, text };
                                } else {
                                    dataMapper[model.colName].notFound.push({ id: item[mappedId], text: item[mappedCol] });
                                }
                            } catch (error) {
                                console.log({ candidate, error });
                            }
                        })
                    }
                }));
            }))

            await app.fs.writeFileSync('./data/DataMapper.json', app.utils.stringify(dataMapper));

            console.log('Finish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
