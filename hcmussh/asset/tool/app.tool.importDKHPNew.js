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

app.readyHooks.add('Run tool.importDKHPNew.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const unknownStudents = [], unknownSubjects = [];
        const mapperloaiDangKy = {
            'Kế Hoạch': 'KH',
            'Ngoài kế hoạch': 'NKH',
            'Cải Thiện': 'CT',
            'Học Lại': 'HL',
            'Học Vượt': 'HV',
            'Ngoài CTĐT': 'NCTDT',
        }

        let listFile = process.argv[2].split(','),
            length = listFile.length;

        readFile: for (const [indexFile, dataFileName] of listFile.entries()) {
            let workbook = await app.excel.readFile(app.path.join(__dirname, `./dataDKHP/${dataFileName}.xlsx`));
            if (workbook) {
                const worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    console.log(`Reading worksheet ${dataFileName}`);
                    let index = 2;
                    while (true) {
                        const getVal = (column, type = 'text', Default) => {
                            Default = Default ? Default : '';
                            let val = worksheet.getCell(column + index).text.trim();
                            return val === '' ? Default : (val == null ? '' : val);
                        }

                        if (!worksheet.getCell('A' + index).value) {
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            console.log(`Running done ${dataFileName}!`);
                            unknownStudents.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownStudents.json'), JSON.stringify(unknownStudents));
                            unknownSubjects.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownSubjects.json'), JSON.stringify(unknownSubjects));
                            if (indexFile == length - 1) process.exit();
                            else continue readFile;
                        } else {
                            const data = {
                                mssv: getVal('B'),
                                maHocPhan: getVal('A'),
                                maLoaiDky: getVal('D'),
                                tinhPhi: 1,
                                modifier: 'htnhung@hcmussh.edu.vn',
                                timeModified: Date.now(),
                                loaiMonHoc: 1,
                            };
                            let length = data.maHocPhan.length,
                                oldMaHocPhan = data.maHocPhan,
                                namHoc = parseInt(data.maHocPhan.substr(0, 2)),
                                hocKy = parseInt(data.maHocPhan.substr(2, 1));
                            data.namHoc = `20${namHoc} - 20${namHoc + 1}`;
                            data.hocKy = hocKy;
                            data.maMonHoc = data.maHocPhan.substring(4, length - 2);
                            data.maHocPhan = data.maHocPhan.substr(0, length - 2) + 'L' + data.maHocPhan.substr(length - 2);
                            data.maLoaiDky = mapperloaiDangKy[data.maLoaiDky];
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            process.stdout.write(`Import line ${index}`);
                            const checkSv = await app.model.fwStudent.get({ mssv: data.mssv });
                            if (!checkSv) {
                                if (!unknownStudents.includes(data.mssv)) {
                                    unknownStudents.push({ line: index, fileName: dataFileName, mssv: data.mssv });
                                    console.log(`, STUD: ${data.mssv} 's not exists`);
                                }
                            }
                            const checkMonHoc = await app.model.dmMonHoc.get({ ma: data.maMonHoc });
                            if (!checkMonHoc) {
                                if (!unknownSubjects.includes(data.maMonHoc)) {
                                    unknownSubjects.push({ line: index, fileName: dataFileName, maMonHoc: data.maMonHoc });
                                    console.log(`, ID: ${data.maMonHoc} 's not exists`);
                                }
                            } else {
                                const checkDK = await app.model.dtDangKyHocPhan.getAll({ maMonHoc: data.maMonHoc, namHoc: data.namHoc, hocKy: data.hocKy });
                                if (checkDK.length) {
                                    for (let item of checkDK) {
                                        await app.model.dtDangKyHocPhan.delete({ id: item.id });
                                    }
                                }
                                await app.model.dtDangKyHocPhan.delete({ mssv: data.mssv, maHocPhan: oldMaHocPhan });
                                await app.model.dtDangKyHocPhan.delete({ mssv: data.mssv, maHocPhan: data.maHocPhan });
                                await app.model.dtDangKyHocPhan.create({ ...data });
                                const dataLichSu = {
                                    mssv: data.mssv,
                                    maHocPhan: data.maHocPhan,
                                    userModified: 'htnhung',
                                    timeModified: Date.now(),
                                    thaoTac: 'A',
                                    tenMonHoc: app.utils.parse(checkMonHoc.ten, { vi: '' })?.vi,
                                    ghiChu: 'Tool Import',
                                    namHoc: data.namHoc,
                                    hocKy: data.hocKy
                                };
                                await app.model.dtLichSuDkhp.create(dataLichSu);
                            }
                            index++;
                        }
                    }
                }
                else {
                    console.log(`Error: worksheet ${dataFileName} not found`);
                    continue readFile;
                }
            } else {
                console.log(`Error: workbook ${dataFileName} not found`);
                continue readFile;
            }
        }
    }
});