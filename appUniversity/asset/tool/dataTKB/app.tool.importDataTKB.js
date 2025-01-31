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

app.readyHooks.add('Run tool.importDataTKB.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const errorImportTKB = [];

        const mapperDataFolder = {
            'HK1 2018 2019': { namHoc: '2018 - 2019', hocKy: 1 },
            'HK1 2019 2020': { namHoc: '2019 - 2020', hocKy: 1 },
            'HK1 2020 2021': { namHoc: '2020 - 2021', hocKy: 1 },
            'HK1 2021 2022': { namHoc: '2021 - 2022', hocKy: 1 },
            'HK2 2018 2019': { namHoc: '2018 - 2019', hocKy: 2 },
            'HK2 2019 2020': { namHoc: '2019 - 2020', hocKy: 2 },
            'HK2 2020 2021': { namHoc: '2020 - 2021', hocKy: 2 },
            'HK2 2021 2022': { namHoc: '2021 - 2022', hocKy: 2 },
            'HK3 2018 2019': { namHoc: '2018 - 2019', hocKy: 3 },
            'HK3 2019 2020': { namHoc: '2019 - 2020', hocKy: 3 },
            'HK3 2020 2021': { namHoc: '2020 - 2021', hocKy: 3 },
            'HK3 2021 2022': { namHoc: '2021 - 2022', hocKy: 3 },
        }

        const mapperDataFile = {
            'CLC HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'CQ' },
            'LT HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH HK1 2018 2019.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK1 2019 2020.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK1 2020 2021.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK1 2021 2022.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH HK2 2018 2019.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK2 2019 2020.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK2 2020 2021.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK2 2021 2022.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK3 2018 2019.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'Lien thong - HK3 2019 2020.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK3 2019 2020.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VLVH - HK3 2019 2020.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK3 2020 2021.xlsx': { loaiHinhDaoTao: 'VLVH' },
            'CLC - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'CLC' },
            'CQ - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'CQ' },
            'Lien thong - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'LT' },
            'VB2 - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2' },
            'VB2 VLVH - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'VB2_VLVH' },
            'VLVH - HK3 2021 2022.xlsx': { loaiHinhDaoTao: 'VLVH' },
        }

        const listMonHoc = ['DAI0012', 'DAI0032', 'DAI0043', 'DAI0122', 'DAI0132', 'DAI0153', 'DAI0162', 'DAI0212', 'DAI0232', 'DAI0242', 'DAI0281', 'DAI0331', 'NBH007.21', 'NBH0501', 'NVA001.21', 'NVA003.31', 'NVA0452', 'NVA050.11', 'NVA0531', 'NVA063.12', 'NVA0792', 'NVA1082', 'NVA1362', 'NVA183.11', 'NVA1861', 'NVA1872', 'NVA1971', 'QTE029.21', 'QTE040.11', 'QTE052.21', 'QTE064.11', 'QTE084.11', 'QTE1351', 'QTE1361', 'QTE1421', 'QTE1431', 'QTE1491', 'QTE157.11', 'QTE1691', 'TC0011', 'TC0021', 'TC0051', 'BCH0302', 'DAI0021', 'LUU034.11', 'NVA0301', 'DAI0411', 'BCH017.11', 'NVA1882', 'DAI0071', 'NVA0791', 'NHA0411', '2BCH0421', 'BCH011.41', 'BCH0282', 'BCH0351', 'BCH050.21', 'BCH0941', 'BCH0991', 'BCH1102', 'DAI0121', 'DAI0131', 'DAI0171', 'DAI0172', 'LSU1581', 'LUU0031', 'LUU024.11', 'LUU032.21', 'LUU040.11', 'LUU0561', 'LUU0781', 'NHA0161', 'NHA022.11', 'NHA0412', 'NHA0641', 'NHA0731', 'NVA0292', 'NVA081.41', 'NVA177.12', 'BCH0281', 'BCH1101', 'DAI0022', 'DAI0042', 'DAI0052', 'DAI0152', 'DAI0201', 'DAI0211', 'DAI0221', 'DAI0231', 'DAI0241', 'DPH0341', 'DTH0251', 'DUL0191', 'NBH0022', 'NBH006.11', 'NBH011.11', 'NVA009.32', 'NVA0591', 'NVA064.11', 'NVA1061', 'NVA1361', 'NVA177.11', 'NVA1881', 'NVA1891', 'NVA1931', 'NVA200.11', 'QTE0011', 'QTE0431', 'QTE0631', 'QTE074.11', 'QTE089.11', 'QTE094.41', 'QTE1001', 'QTE1081', 'QTE1301', 'QTE131.11', 'QTE145.11', 'QTE146.11', 'QTE147.11', 'QTE148.11', 'QTE1501', 'QTE1511', 'QTE1521', 'QTE1531', 'QTE158.11', 'QTE159.11', 'QTE163.11', 'QTE1671', 'QTE1681', 'QTE1721', 'TC0031', 'TC0041', 'DAI0011', 'CXH0101', 'CXH0112', 'TLH0241', 'LUU032.22', 'BCH026.11', 'BCH032.11', 'BCH0321', 'BCH0681', 'DAI0133', 'NVA001.23', 'NVA177.13', 'QTE1281', 'BCH071.21', 'BCH0731', 'BCH0921', 'DAI0282', 'DAI0471', 'DAI0482', 'DAI0492', 'DAI0502', 'DAI0512', 'NHA0271', 'NHA0361', 'NHA0711', 'NVA057.14', 'NVA0793', 'NVA081.42', 'NVA1062', 'NVA1841', 'NVA1851', 'NVA200.13', 'QTP0201', 'QTE1291', 'DAI0051', 'DAI0061', 'NVA0771', 'NVA1363'];

        for (const dataFolderName of ['HK1 2018 2019', 'HK1 2019 2020', 'HK1 2020 2021', 'HK1 2021 2022', 'HK2 2018 2019', 'HK2 2019 2020', 'HK2 2020 2021', 'HK2 2021 2022', 'HK3 2018 2019', 'HK3 2019 2020', 'HK3 2020 2021', 'HK3 2021 2022']) {
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

                                    if (!worksheet.getCell('A' + index).value) {
                                        console.log(`Running done ${fileName}!`);
                                        break;
                                    } else {
                                        const data = {
                                            maHocPhan: getVal('A'),
                                            nhom: getVal('B') ? ('0' + getVal('B')).slice(-2) : '01',
                                            bacDaoTao: 'DH',
                                            tinhTrang: 1,
                                            lop: getVal('D').replaceAll(/ - nhom ./g, ''),
                                            userModified: 'an.le123456@hcmut.edu.vn',
                                            lastModified: Date.now(),
                                            buoi: 1,
                                            ...mapperDataFolder[dataFolderName],
                                            ...mapperDataFile[fileName],
                                        };
                                        data.maMonHoc = data.maHocPhan.substring(4);
                                        data.maHocPhan = data.maHocPhan + data.nhom;

                                        if (listMonHoc.includes(data.maMonHoc)) {
                                            data.maMonHoc = data.maMonHoc.substring(0, data.maMonHoc.length - 1);
                                        } else {
                                            index++;
                                            continue;
                                        }
                                        console.log(`Import line ${index} file ${fileName}`);
                                        let subject = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,khoa,tietLt,tietTh');
                                        if (subject) {
                                            data.khoaDangKy = subject.khoa;
                                            data.soTietLyThuyet = subject.tietLt;
                                            data.soTietThucHanh = subject.tietTh;

                                            if (data.lop) {
                                                const listLop = data.lop.split(', ');
                                                let i = listLop[0];
                                                let l = await app.model.dtLop.get({ maLop: i });
                                                if (l) {
                                                    data.khoaSinhVien = l.khoaSinhVien;
                                                }
                                            }

                                            await app.model.dtThoiKhoaBieu.delete({ maHocPhan: data.maHocPhan });
                                            const tkb = await app.model.dtThoiKhoaBieu.create({ ...data, soBuoiTuan: 1 });
                                            let { id } = tkb;

                                            if (data.lop) {
                                                const listLop = data.lop.split(', ');
                                                for (const maLop of listLop) {
                                                    await app.model.dtThoiKhoaBieuNganh.create({
                                                        idThoiKhoaBieu: id,
                                                        idNganh: maLop
                                                    });
                                                }
                                            }
                                        } else {
                                            error.push({ folder: dataFolderName, fileName, error: `Môn học ${data.maMonHoc} không tồn tại`, row: index })
                                        }
                                        index++;
                                    }
                                }
                                error.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', `${dataFolderName}_${fileName}_error.json`), JSON.stringify(error));
                            } else {
                                console.log(`Error: worksheet ${fileName} not found`);
                            }
                        } else {
                            console.log(`Error: workbook ${fileName} not found`);
                        }
                    } catch (error) {
                        errorImportTKB.push({ folder: dataFolderName, fileName, error });
                    }
                }
            } catch (error) {
                errorImportTKB.push({ folder: dataFolderName, error });
            }
        }
        errorImportTKB.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'errorImportTKB.json'), JSON.stringify(errorImportTKB));
    }
});