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

app.readyHooks.add('Run tool.importTKB.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.dkhp.xlsx')); if (workbook) {
            const worksheet = workbook.getWorksheet('Table1');
            const unknownStudents = [], unknownSubjects = [];
            if (worksheet) {
                await app.model.dtDangKyHocPhan.delete();
                let index = 2;
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = worksheet.getCell(column + index).text.trim();
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (worksheet.getCell('A' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        unknownStudents.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownStudents.json'), JSON.stringify(unknownStudents));
                        unknownSubjects.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownSubjects.json'), JSON.stringify(unknownSubjects));
                        process.exit();
                    } else {
                        const data = {
                            mssv: getVal('C'),
                            maHocPhan: getVal('F')
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Import line ${index}`);
                        const checkSv = await app.model.fwStudent.get({ mssv: data.mssv });
                        if (!checkSv) {
                            if (!unknownStudents.includes(data.mssv)) {
                                unknownStudents.push(data.mssv);
                                console.log(`, STUD: ${data.mssv} 's not exists`);
                            }
                        }
                        const checkHphan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan }, 'maHocPhan,maMonHoc');
                        if (!checkHphan) {
                            if (!unknownSubjects.includes(data.maHocPhan)) {
                                unknownSubjects.push(data.maHocPhan);
                                console.log(`, ID: ${data.maHocPhan} 's not exists`);
                            }
                        } else {
                            await app.model.dtDangKyHocPhan.create({ ...data, ...checkHphan, modifier: 'tien.trantan@hcmut.edu.vn' });
                        }
                        index++;

                    }
                }
            }
            else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});