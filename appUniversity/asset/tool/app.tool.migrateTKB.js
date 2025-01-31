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
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.dataNam4.xlsx')); if (workbook) {
            const worksheet = workbook.getWorksheet('TKB HK2');
            if (worksheet) {
                let index = 3;
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
                        process.exit();
                    } else {
                        const data = {
                            maHocPhan: getVal('E'),
                            maMonHoc: getVal('B'),
                            nhom: getVal('E') ? ('0' + getVal('E')).slice(-2) : '01',
                            // thu: getVal('H'),
                            // tietBatDau: getVal('I'),
                            // soTietBuoi: getVal('J'),
                            // phong: getVal('M'),
                            lop: getVal('G'),
                            soLuongDuKien: getVal('I'),
                            startDate: getVal('M'), //date
                            endDate: getVal('N'),
                            namHoc: '2022 - 2023',
                            hocKy: '2',
                            khoaSinhVien: 2019,
                            isMo: 1,
                            // buoi: 1,
                            loaiHinhDaoTao: 'CQ',
                            bacDaoTao: 'DH',
                            coSo: 2,
                            tinhTrang: 4,
                            canBo: getVal('P').replaceAll('  ', ' '),
                            maCanBo: getVal('O')
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Import line ${index}`);
                        if (data.startDate) {
                            let date = data.startDate;
                            data.ngayBatDau = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).setHours(0, 0, 0, 0);
                            if (isNaN(data.ngayBatDau)) data.ngayBatDau = '';
                        }
                        if (data.endDate) {
                            let date = data.endDate;
                            data.ngayKetThuc = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).setHours(0, 0, 0, 0);
                            if (isNaN(data.ngayKetThuc)) data.ngayKetThuc = '';
                        }
                        let subject = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,khoa,tietLt,tietTh');
                        if (subject) {
                            data.khoaDangKy = subject.khoa;
                            data.soTietLyThuyet = subject.tietLt;
                            data.soTietThucHanh = subject.tietTh;
                        } else {
                            console.log(`- Line ${index} ERROR: Subject ${data.maMonHoc} doesn't exist in database`);
                        }
                        const tkb = await app.model.dtThoiKhoaBieu.create(data);
                        let { id } = tkb;
                        if (data.lop) {
                            await app.model.dtThoiKhoaBieuNganh.create({
                                idThoiKhoaBieu: id,
                                idNganh: data.lop.trim()
                            });
                        }
                        if (data.canBo) {
                            const listGiangVien = data.canBo.split(', ');
                            const listMaGiangVien = data.maCanBo.split(', ');
                            let dataGiangVien = {};
                            dataGiangVien.idThoiKhoaBieu = id;
                            for (let gv of listGiangVien) {
                                const i = listGiangVien.indexOf(gv);
                                let subGv = gv.replaceAll(/.*[.]/, '');
                                const giangVien = await app.model.tchcCanBo.get({
                                    statement: '(lower(ho) || \' \' || lower(ten)) LIKE :gv',
                                    parameter: { gv: `%${subGv.toLowerCase()}%` }
                                }, 'shcc');
                                if (giangVien) {
                                    dataGiangVien.giangVien = giangVien.shcc;
                                    dataGiangVien.type = 'GV';
                                }
                                else {
                                    const canBoNgoaiTruong = await app.model.dtCanBoNgoaiTruong.get({ shcc: listMaGiangVien[i] });
                                    if (canBoNgoaiTruong) {
                                        dataGiangVien.giangVien = canBoNgoaiTruong.shcc;
                                        dataGiangVien.type = 'GV';
                                    } else {
                                        const canBoCreated = await app.model.dtCanBoNgoaiTruong.create({
                                            shcc: listMaGiangVien[i],
                                            ho: subGv.substring(0, subGv.lastIndexOf(' '))?.toUpperCase() || '',
                                            ten: subGv.substring(subGv.lastIndexOf(' ') + 1)?.toUpperCase() || '',
                                            trinhDo: gv.substring(0, subGv.lastIndexOf('.') == -1 ? 0 : (subGv.lastIndexOf('.') - 1))
                                        });
                                        dataGiangVien.giangVien = canBoCreated.shcc;
                                        dataGiangVien.type = 'GV';
                                    }
                                }
                                await app.model.dtThoiKhoaBieuGiangVien.create(dataGiangVien);
                            }

                        }
                        index++;
                    }
                }
                await app.model.dtDiem.delete({});
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