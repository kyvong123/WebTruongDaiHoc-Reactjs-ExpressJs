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
app.readyHooks.add('Run tool.import.dkhp.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const mapLDK = {
            'Kế Hoạch': 'KH',
            'Cải Thiện': 'CT',
            'Học Lại': 'HL',
            'Học Vượt': 'HV',
            'Ngoài CTĐT': 'NCTDT',
            'Ngoài kế hoạch': 'NKH'
        };

        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/dkhp.1803.xlsx'));
        if (workbook) {
            const dataSheet = workbook.getWorksheet('DSDK');
            if (!dataSheet) {
                console.log('Error: dataSheet not found');
                process.exit(1);
            } else {
                await app.model.dtDangKyHocPhan.delete({ timeModified: -1 });
                let index = 2,
                    unknownStudents = [], errorList = [], fullData = [];
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = dataSheet.getCell(column + index).text;
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (dataSheet.getCell('A' + index).text == '') {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        await Promise.all(fullData.map(item =>
                            app.model.dtDangKyHocPhan.get({ maHocPhan: item.maHocPhan, mssv: item.mssv })
                                .then(check => check ?
                                    app.model.dtDangKyHocPhan.update({ maHocPhan: item.maHocPhan, mssv: item.mssv }, { namHoc: item.namHoc, hocKy: item.hocKy }) :
                                    app.model.dtDangKyHocPhan.create(item))
                                .catch(error => errorList.push({ error, item })))
                        );
                        console.log('Import done', { errorList });
                        process.exit(1);
                    } else {
                        const data = {
                            mssv: getVal('B').toUpperCase(),
                            maHocPhan: getVal('A').toUpperCase(),
                            tinhPhi: 1,
                            maLoaiDky: mapLDK[getVal('D')],
                            loaiMonHoc: 0,
                            timeModified: -1,
                            namHoc: '2022 - 2023',
                            hocKy: 1,
                            modifier: 'tien.trantan@hcmut.edu.vn'
                        };
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Importing line ${index}`);
                        data.maMonHoc = data.maHocPhan.replace(/.{2}$/, '').substring(4);
                        if (data.maLoaiDky == 'NCTDT') data.loaiMonHoc = 1;
                        fullData.push(data);
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
