const { rejects } = require('assert');
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

const yearMilli = 31556926000;


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
require('../../../config/database.redisDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);

const POSITION_MAPPER = {
    'CN': 'Giáo viên chủ nhiệm',
    'LT': 'Lớp trưởng',
    'LP': 'Lớp phó',
    'BT': 'Bí thư (Đoàn)',
    'PBT': 'Phó bí thư (Đoàn)',
    'UVBCH': ' Ủy viên BCH (Đoàn)',
    'CHT': 'Chi hội trưởng (Hội sinh viên)',
    'CHP': 'Chi hội phó (Hội sinh viên)',
    'UVBCH-HSV': 'Ủy viên BCH (Hội sinh viên)',
};

const getClassAsignment = (chucVu = '') => {
    chucVu = chucVu.toLowerCase();
    if (chucVu.includes('lớp trưởng')) {
        return 'LT';
    } else if (chucVu.includes('lớp phó')) {
        return 'LP';
    }
}

app.readyHooks.add('Run tool.importLoaiDangKy.js', {
    ready: () => (app.database.oracle.connected
        && app.model
        && app.model.svQuanLyLop
        && app.database.dkhpRedis
        && app.dkhpRedis),
    run: async () => {
        try {
            let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.bancansu.xlsx'));
            if (!workbook) throw 'Error: workbook not found';
            let worksheet = workbook.getWorksheet('Câu trả lời biểu mẫu 1');
            if (!worksheet) throw 'Error: worksheet not found';

            let result = app.excel.create();
            let resultSheet = result.addWorksheet('main');
            resultSheet.columns = [
                { header: 'userId', key: 'userId' },
                { header: 'maLop', key: 'maLop' },
                { header: 'maChucVu', key: 'maChucVu' },
            ];

            const listMssv = new Set();

            for (let index = 2; index < worksheet.rowCount; ++index) {
                const row = worksheet.getRow(index);
                const userId = row.getCell('C').text;
                const chucVu = row.getCell('K').text;
                const maLop = row.getCell('O').text;

                const maChucVu = getClassAsignment(chucVu);
                if (!maChucVu) continue;

                listMssv.add(userId);

                const data = {
                    userId, maLop, maChucVu
                }

                let item = await app.model.svQuanLyLop.get(data);
                if (!item) {
                    item = await app.model.svQuanLyLop.create(data);
                }
            }

            for (let userId of listMssv) {
                await app.dkhpRedis.syncWithDb(userId);
            }
            // await result.xlsx.writeFile('./data/result.banCanSu.xlsx');
            console.log('Finish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
