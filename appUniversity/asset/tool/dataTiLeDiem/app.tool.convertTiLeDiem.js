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
        const mapperData = {
            '19-20_HK1': { namHoc: '2019 - 2020', hocKy: 1 },
            '19-20_HK2': { namHoc: '2019 - 2020', hocKy: 2 },
            '19-20_HK3': { namHoc: '2019 - 2020', hocKy: 3 },
            '20-21_HK1': { namHoc: '2020 - 2021', hocKy: 1 },
            '20-21_HK2': { namHoc: '2020 - 2021', hocKy: 2 },
            '20-21_HK3': { namHoc: '2020 - 2021', hocKy: 3 },
            '21-22_HK1': { namHoc: '2021 - 2022', hocKy: 1 },
            '21-22_HK2': { namHoc: '2021 - 2022', hocKy: 2 },
            '21-22_HK3': { namHoc: '2021 - 2022', hocKy: 3 },
            '22-23_HK1': { namHoc: '2022 - 2023', hocKy: 1 },
        }

        // '19-20_HK1', '19-20_HK2', '19-20_HK3', '20-21_HK1', '20-21_HK2', '20-21_HK3', '21-22_HK1', '21-22_HK2', '21-22_HK3', '22-23_HK1'
        for (const dataFileName of ['21-22_HK2', '21-22_HK3', '22-23_HK1']) {
            let workbook = await app.excel.readFile(app.path.join(__dirname, `${dataFileName}.xlsx`));
            if (workbook) {
                const worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    let index = 2, unknownMaHocPhan = [], error = [];
                    while (true) {
                        try {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text.trim();
                                if (type == 'number' && val != '') {
                                    if (val == 'VT' || val == 'I' || val == 'II') {
                                        return val;
                                    } else {
                                        if (!isNaN(val)) val = Number(val).toFixed(2);
                                        else val = ''
                                    }
                                }
                                return val === '' ? Default : (val == null ? '' : val);
                            }
                            if (worksheet.getCell('A' + index).value == null) {
                                console.log('\n', `Running done ${dataFileName}`);
                                unknownMaHocPhan.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'dataTiLeDiem', `${dataFileName}_unknown.json`), JSON.stringify(unknownMaHocPhan));
                                error.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'dataTiLeDiem', `${dataFileName}_error.json`), JSON.stringify(error));
                                break;
                            } else {
                                const data = {
                                    maHocPhan: getVal('A'),
                                    tyLe: getVal('F'),
                                    ...mapperData[dataFileName],
                                }
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Import sheet ${dataFileName}, line ${index}`);

                                data.tyLe = data.tyLe.substring(0, data.tyLe.length - 1);

                                const tkb = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan });
                                if (!tkb) {
                                    unknownMaHocPhan.push({ maHocPhan: data.maHocPhan, dataFileName, error: 'Không tìm thấy học phần' });
                                } else {
                                    if (!tkb.maMonHoc) {
                                        unknownMaHocPhan.push({ maHocPhan: data.maHocPhan, dataFileName, error: 'Không tìm thấy môn học' });
                                    } else {
                                        data.maMonHoc = tkb.maMonHoc;
                                        if (!data.tyLe) {
                                            unknownMaHocPhan.push({ maHocPhan: data.maHocPhan, dataFileName, error: 'Không tìm thấy phần trăm điểm' });
                                        } else {
                                            if (Number(data.tyLe)) {
                                                data.dataThanhPhan = [
                                                    { loaiThanhPhan: 'GK', phanTram: Number(data.tyLe), loaiLamTron: '0.5' },
                                                    { loaiThanhPhan: 'CK', phanTram: 100 - Number(data.tyLe), loaiLamTron: '0.5' },
                                                ];
                                            } else {
                                                data.dataThanhPhan = [
                                                    { loaiThanhPhan: 'CK', phanTram: 100, loaiLamTron: '0.5' },
                                                ];
                                            }

                                            const { maHocPhan, maMonHoc, namHoc, hocKy } = data,
                                                modifier = 'htnhung@hcmussh.edu.vn',
                                                lastModified = Date.now();

                                            await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
                                            for (let thanhPhan of data.dataThanhPhan) {
                                                let { loaiThanhPhan, phanTram, loaiLamTron = 0.5 } = thanhPhan;
                                                await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan, phanTram, modifier, lastModified, loaiLamTron, hinhThucThi: '' });
                                            }

                                            let listStudent = await app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify({ namHoc, hocKy }));
                                            await Promise.all(listStudent.rows.map(async stu => {
                                                if (stu.count) {
                                                    const allDiem = await app.model.dtDiemAll.getAll({ mssv: stu.mssv, maHocPhan, maMonHoc });

                                                    await app.model.dtDiemAll.delete({ mssv: stu.mssv, maHocPhan, maMonHoc });

                                                    for (let tp of data.dataThanhPhan) {
                                                        let { loaiThanhPhan, phanTram } = tp;
                                                        const exist = allDiem.find(i => i.loaiDiem == loaiThanhPhan);
                                                        if (exist) {
                                                            await app.model.dtDiemAll.create({ mssv: stu.mssv, maHocPhan, maMonHoc, namHoc, hocKy, loaiDiem: loaiThanhPhan, phanTramDiem: phanTram, diem: exist.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '' });
                                                            await app.model.dtDiemHistory.create({ maHocPhan, maMonHoc, namHoc, hocKy, mssv: stu.mssv, loaiDiem: loaiThanhPhan, oldDiem: exist?.diem ?? '', newDiem: exist?.diem ?? '', phanTramDiem: phanTram, hinhThucGhi: 5, userModified: modifier, timeModified: lastModified });
                                                        }
                                                    }

                                                    const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK({ mssv: stu.mssv, maHocPhan, maMonHoc, namHoc, hocKy });

                                                    if (isTK) {
                                                        await app.model.dtDiemAll.update({ mssv: stu.mssv, maHocPhan, maMonHoc, loaiDiem: 'TK' }, { diem: sumDiem });
                                                    } else {
                                                        await app.model.dtDiemAll.create({ mssv: stu.mssv, maHocPhan, maMonHoc, namHoc, hocKy, loaiDiem: 'TK', diem: sumDiem });
                                                    }
                                                }
                                            }));

                                        }
                                    }
                                }
                                index++;
                            }
                        } catch (err) {
                            index++;
                            error.push({ dataFileName, index, err });
                        }
                    }
                }
                else {
                    console.log('Error: worksheet not found');
                }
            } else {
                console.log('Error: workbook not found');
            }
        }

    }
});