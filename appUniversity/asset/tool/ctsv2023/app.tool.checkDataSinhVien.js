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
    ready: () => app.database.oracle.connected && app.model && app.model.fwStudent,
    run: async () => {
        try {
            let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.datasinhvien.xlsx'));
            if (!workbook) throw 'Error: workbook not found';
            const dataSheet = workbook.getWorksheet('SV VN');
            if (!dataSheet) throw 'Error: dataSheet not found';

            // Some variable
            // const failed = []
            const report = app.excel.create();
            const rps = report.addWorksheet('Result');
            rps.columns = [
                { header: 'Index', key: 'index', width: 5 },
                { header: 'MSSV', key: 'mssv', width: 10 },
                { header: 'Error', key: 'error', width: 50 },
            ]

            let [, , ...dataSheetValues] = dataSheet.getSheetValues();
            // dataSheetValues = dataSheetValues.slice(0, 10000);
            console.log('Found ', dataSheetValues.length, ' rows');


            // Some helper function

            const getValue = function (val, type = 'text', _default = null) {
                const value = typeof val == 'string' ? val.trim() : val;
                switch (type) {
                    case 'text':
                        return value || _default;
                    case 'date':
                        if (value) {
                            const [d, m, y] = value.split(/[,.\s\/-_]/),
                                mil = new Date(y, m - 1, d).getTime();
                            return isNaN(mil) ? _default : mil;
                        } else {
                            return _default
                        }
                    case 'phone':
                        if (value && !['0', 'Không biết'].includes(value)) {
                            let phone = value.split(/[,.\s\/-_]/)[0];
                            phone = phone.replace('+84', '0').replace('(84)', '').replaceAll(/[()]/g, '');
                            if (isNaN(parseInt(phone))) {
                                return _default;
                            } else {
                                return phone
                            }
                        } else {
                            return _default;
                        }
                    default:
                        return _default;
                }
            }

            // const list = await app.model.fwStudent.getAll();
            for (let index = 0; index < dataSheetValues.length; ++index) {
                // console.log(row[1]);
                const row = dataSheetValues[index];
                if (!row || !row[1]) continue;
                const mssv = row[1].trim();
                try {
                    const sv = await app.model.fwStudent.get({ mssv });
                    if (sv) {
                        const changes = {
                            gioiTinh: sv.gioiTinh || (row[18] == '0' ? '02' : '01'),
                            loaiSinhVien: sv.loaiSinhVien || 'L1',
                            dienThoaiCaNhan: sv.dienThoaiCaNhan || getValue(row[63], 'phone'),
                            emailCaNhan: sv.emailCaNhan || getValue(row[64]),
                            cmnd: sv.cmnd || getValue(row[31]),
                            cmndNoiCap: sv.cmndNoiCap || getValue(row[33]),
                            cmndNgayCap: sv.cmndNgayCap || getValue(row[32], 'date'),
                            tenCha: sv.tenCha || getValue(row[67]),
                            ngheNghiepCha: sv.ngheNghiepCha || getValue(row[68]),
                            ngheNghiepMe: sv.ngheNghiepCha || getValue(row[68]),
                            tenMe: sv.tenMe || getValue(row[70]),
                            hoTenNguoiLienLac: sv.hoTenNguoiLienLac || getValue(row[73]),
                            diemThi: sv.diemThi || getValue(row[47], 'text', 0),
                            ngaySinh: sv.ngaySinh || getValue(row[15], 'date'),
                        };
                        const item = await app.model.fwStudent.update({ mssv }, changes)
                        if (!item) {
                            console.log(`Failed at ${index + 2}`);
                            throw `Failed at ${index + 2}`;
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Done ${index + 1}/${dataSheetValues.length}`);
                    } else {
                        throw 'Student not found';
                    }
                } catch (error) {
                    console.log('\x1b[31m%s\x1b[0m', `Error at ${index + 2}`);
                    console.error({ index, error });
                    rps.addRow({ index, mssv, error });
                    await report.xlsx.writeFile(app.path.join(__dirname, './data/report.datasinhvien.test.xlsx'));
                }
            }
            console.log('Finish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
