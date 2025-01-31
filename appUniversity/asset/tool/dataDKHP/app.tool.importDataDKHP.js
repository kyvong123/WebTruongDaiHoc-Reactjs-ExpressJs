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

app.loadModules(false);

app.readyHooks.add('Run tool.importDKHPNew.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const unknownStudents = [], unknownSubjects = [], errorImportDKHP = [];
        const mapperloaiDangKy = {
            'Kế Hoạch': 'KH',
            'Ngoài kế hoạch': 'NKH',
            'Cải Thiện': 'CT',
            'Học Lại': 'HL',
            'Học Vượt': 'HV',
            'Ngoài CTĐT': 'NCTDT',
        }

        const mapperData = {
            '19-20_HK1': { namHoc: '2019 - 2020', hocKy: 1 },
            '19-20_HK2': { namHoc: '2019 - 2020', hocKy: 2 },
            '19-20_HK3': { namHoc: '2019 - 2020', hocKy: 3 },
            '20-21_HK1': { namHoc: '2020 - 2021', hocKy: 1 },
            '20-21_HK2': { namHoc: '2020 - 2021', hocKy: 2 },
            '20-21_HK3': { namHoc: '2020 - 2021', hocKy: 3 },
            '21-22_HK1': { namHoc: '2021 - 2022', hocKy: 1 },
            '21-22_HK2': { namHoc: '2021 - 2022', hocKy: 2 },
            '21-22_HK3': { namHoc: '2021 - 2022', hocKy: 3 }
        }

        const listMonHoc = ['LUU032.22', 'BCH017.11', 'NVA1882', 'DAI0172', 'DAI0154', 'DAI0122', 'BCH032.11', 'BCH026.11', 'BCH0321', 'BCH0681', 'NVA177.13', 'DAI0071', 'DAI0291', 'DAI0222', 'DAI0233', 'VNH0631', 'NVA0791', 'DAI0212', 'DAI0232', 'DAI0162', '2BCH0421', 'BCH1102', 'BCH0351', 'BCH0282', 'BCH0991', 'BCH0941', 'BCH011.41', 'BCH050.21', 'LUU040.11', 'LUU034.11', 'LUU032.21', 'LUU0561', 'LUU0031', 'LSU1581', 'DAI0131', 'DAI0171', 'LUU024.11', 'DAI0121', 'NVA177.12', 'NVA0292', 'LUU0781', 'NHA0412', 'NHA022.11', 'NHA0161', 'NHA0641', 'NHA0731', 'QTE1281', 'BCH0921', 'DAI0152', 'NVA1841', 'NVA1851', 'DAI0512', 'DAI0471', 'DAI0502', 'DAI0482', 'DAI0492', 'DAI0282', 'BCH0731', 'BCH071.21', 'NVA009.32', 'NVA081.42', 'NVA1062', 'NHA0361', 'NHA0271', 'NVA200.13', 'NVA057.14', 'NVA0793', 'QTP0201', 'NVA1363', 'NVA0771'];

        const mapperLoaiHinh = await app.model.dmSvLoaiHinhDaoTao.getAll({}, 'maLop, ma');

        for (const dataFolderName of ['19-20_HK1', '19-20_HK2', '19-20_HK3', '20-21_HK1', '20-21_HK2', '20-21_HK3', '21-22_HK1', '21-22_HK2', '21-22_HK3']) {
            console.log(`Reading folder ${dataFolderName}`);
            try {
                for (let fileName of app.fs.readdirSync(app.path.join(__dirname, `./${dataFolderName}`))) {
                    try {
                        let workbook = await app.excel.readFile(app.path.join(__dirname, `./${dataFolderName}/${fileName}`)), error = [];
                        if (workbook) {
                            const worksheet = workbook.getWorksheet(1);
                            if (worksheet) {
                                console.log(`Reading worksheet ${fileName}`);
                                let index = 2;
                                while (true) {
                                    const getVal = (column, type = 'text', Default) => {
                                        Default = Default ? Default : '';
                                        let val = worksheet.getCell(column + index).text.trim();
                                        return val === '' ? Default : (val == null ? '' : val);
                                    }

                                    if (!(worksheet.getCell('A' + index).value && worksheet.getCell('B' + index).value)) {
                                        console.log(`Running done ${fileName}!`);
                                        break;
                                    } else {
                                        const data = {
                                            maHocPhan: getVal('A'),
                                            mssv: getVal('B'),
                                            maLoaiDky: getVal('D'),
                                            tinhPhi: 1,
                                            modifier: 'htnhung@hcmussh.edu.vn',
                                            timeModified: Date.now(),
                                            loaiMonHoc: 1,
                                            ...mapperData[dataFolderName],
                                        };
                                        data.maMonHoc = data.maHocPhan.substring(4, data.maHocPhan.length - 2);
                                        if (listMonHoc.includes(data.maMonHoc)) {
                                            data.maMonHoc = data.maMonHoc.substring(0, data.maMonHoc.length - 1);
                                        } else {
                                            index++;
                                            continue;
                                        }
                                        data.maLoaiDky = mapperloaiDangKy[data.maLoaiDky];
                                        console.log(`Import line ${index} file ${fileName}`);
                                        const checkSv = await app.model.fwStudent.get({ mssv: data.mssv });
                                        if (!checkSv) {
                                            if (!unknownStudents.includes(data.mssv)) {
                                                unknownStudents.push({ line: index, dataFolderName, fileName, mssv: data.mssv });
                                                console.log(`, STUD: ${data.mssv} 's not exists`);
                                            }
                                        }
                                        const checkMonHoc = await app.model.dmMonHoc.get({ ma: data.maMonHoc });
                                        if (!checkMonHoc) {
                                            if (!unknownSubjects.includes(data.maMonHoc)) {
                                                unknownSubjects.push({ line: index, fileName, maMonHoc: data.maMonHoc });
                                                console.log(`, ID: ${data.maMonHoc} 's not exists`);
                                            }
                                        } else {
                                            const checkDK = await app.model.dtDangKyHocPhan.getAll({ mssv: data.mssv, maMonHoc: data.maMonHoc, namHoc: data.namHoc, hocKy: data.hocKy });
                                            if (checkDK.find(dk => dk.maHocPhan.includes(data.maHocPhan.substr(0, 4)))) {
                                                errorImportDKHP.push({ folder: dataFolderName, fileName, maHocPhan: data.maHocPhan, mssv: data.mssv, error: 'Trùng môn học của cùng 1 học phần' });
                                            } else {
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

                                                const checkTKB = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan });
                                                if (!checkTKB) {
                                                    await app.model.dtThoiKhoaBieu.create({
                                                        maHocPhan: data.maHocPhan, maMonHoc: data.maMonHoc,
                                                        nhom: data.maHocPhan.substr(data.maHocPhan.length - 2).toString(),
                                                        namHoc: data.namHoc, hocKy: data.hocKy, tinhTrang: 1, bacDaoTao: 'DH',
                                                        loaiHinhDaoTao: mapperLoaiHinh.find(i => i.maLop == data.maHocPhan.substring(3, 4))?.ma || '',
                                                    });
                                                }
                                            }
                                        }
                                        index++;
                                    }
                                }
                            } else {
                                console.log(`Error: worksheet ${fileName} not found`);
                            }
                        } else {
                            console.log(`Error: workbook ${fileName} not found`);
                        }
                    } catch (error) {
                        errorImportDKHP.push({ folder: dataFolderName, fileName, error });
                    }
                }
            } catch (error) {
                errorImportDKHP.push({ folder: dataFolderName, error });
            }
        }
        unknownStudents.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownStudents.json'), JSON.stringify(unknownStudents));
        unknownSubjects.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'unknownSubjects.json'), JSON.stringify(unknownSubjects));
        errorImportDKHP.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'errorImportDKHP.json'), JSON.stringify(errorImportDKHP));
    }
});