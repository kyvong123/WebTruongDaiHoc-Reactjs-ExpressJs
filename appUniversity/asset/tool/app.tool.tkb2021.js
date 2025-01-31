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
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.tkb.2021.official.xlsx'));
        if (workbook) {
            let dataThu = await app.model.dtDmThu.getAll();
            let dataRoom = await app.model.dmPhong.getAll();
            for (const room of dataRoom) {
                let ma = room.ma;
                delete room.ma;
                const item = await app.model.dmPhong.update({ ma }, { ...room, ten: room.ten?.replace(/\r/g, '').toString() || '', moTa: room.moTa?.replace(/\r/g, '').toString() || '' });
            }
            Promise.all([
                app.model.dtThoiKhoaBieu.delete({}),
                app.model.dtThoiKhoaBieuNganh.delete({}),
                app.model.dtThoiKhoaBieuGiangVien.delete({}),
                app.model.dtCanBoNgoaiTruong.delete({})
            ])
            let mapperThu = {};
            let unknowRoom = [];
            dataThu.forEach(item => mapperThu[item.ten.toLowerCase()] = item.ma);
            for (let sheetIndex = 1; sheetIndex <= 28; sheetIndex++) {
                console.log(`- Start reading sheet ${sheetIndex}`);
                const worksheet = workbook.getWorksheet('Sheet' + sheetIndex);
                if (worksheet) {
                    let index = 15;
                    while (true) {
                        const getVal = (column, type = 'text', Default) => {
                            Default = Default ? Default : '';
                            let val = worksheet.getCell(column + index).text.trim();
                            return val === '' ? Default : (val == null ? '' : val);
                        }
                        if (worksheet.getCell('A' + index).value == null) {
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            console.log(`Running done sheet${sheetIndex}!`);
                            break;
                        } else {
                            const data = {
                                maHocPhan: getVal('B'),
                                tenMonHoc: getVal('C'),
                                tinhTrang: '2',
                                soLuongDuKien: getVal('I') || 0,
                                nhom: getVal('B') ? getVal('B').slice(-2) : '01',
                                tiet: getVal('K'),
                                thu: getVal('J'),
                                phong: getVal('L'),
                                lop: getVal('H').replaceAll(/ - nhom ./g, ''),
                                date: getVal('N'), //date
                                namHoc: '2022 - 2023',
                                hocKy: '1',
                                khoaSinhVien: 2021,
                                isMo: 1,
                                buoi: 1,
                                loaiHinhDaoTao: 'CQ',
                                bacDaoTao: 'DH',
                                coSo: 2,
                                maCanBo: getVal('R'),
                                canBo: getVal('S').replaceAll('  ', ' ')
                            }
                            let loaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.get({ maLop: data.maHocPhan[3] });
                            if (!loaiHinhDaoTao) {
                                console.error(' + Error: Cannot find LHDT');
                            }
                            data.loaiHinhDaoTao = loaiHinhDaoTao.ma;


                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            process.stdout.write(`Importing sheet ${sheetIndex}, line ${index}`);
                            if (data.date) {
                                let date = data.date;
                                let start = data.date.split('->')[0],
                                    end = data.date.split('->')[1];

                                data.ngayBatDau = new Date(start.substring(6, 11), Number(start.substring(3, 5)) - 1, start.substring(0, 2)).getTime();
                                data.ngayKetThuc = new Date(end.substring(6, 11), Number(end.substring(3, 5)) - 1, end.substring(0, 2)).getTime();
                                if (isNaN(data.ngayBatDau)) data.ngayBatDau = '';
                                if (isNaN(data.ngayKetThuc)) data.ngayKetThuc = '';
                            }

                            if (data.thu) {
                                data.thu = data.thu.toLowerCase().replaceAll('thứ ', '');
                                data.thu = mapperThu[data.thu];
                            }

                            if (data.tiet) {
                                data.tietBatDau = data.tiet.split('-')[0];
                                data.soTietBuoi = Number(data.tiet.split('-')[1]) - Number(data.tietBatDau) + 1;
                                data.soBuoiTuan = 1;
                            }

                            data.maMonHoc = data.maHocPhan.substring(0, data.maHocPhan.length - 2).substring(4);
                            let subject = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,khoa,tietLt,tietTh');
                            if (subject) {
                                data.khoaDangKy = subject.khoa;
                                data.soTietLyThuyet = subject.tietLt;
                                data.soTietThucHanh = subject.tietTh;
                            } else {
                                console.log(`, ERROR: Subject ${data.maMonHoc}: ${data.tenMonHoc} doesn't exist in database`);
                            }
                            if (data.phong) {
                                let room = await app.model.dmPhong.get({ ten: data.phong }, 'sucChua');
                                if (room) data.sucChua = room.sucChua;
                                else {
                                    if (unknowRoom.indexOf(data.phong) == -1) unknowRoom.push(data.phong);
                                    console.log(`, ERROR: Room ${data.phong} doesn't exist in database`);
                                    data.sucChua = 0;
                                }
                            }

                            const checktkb = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan });
                            if (!checktkb) {
                                if (data.lop) {
                                    const listLop = data.lop.split(', ');
                                    if (listLop && listLop[0]) {
                                        if (listLop[0].substring(0, 2) == 'LT') {
                                            data.khoaSinhVien = `20${listLop[0].substring(5, 7)}`;
                                        } else {
                                            data.khoaSinhVien = `20${listLop[0].substring(0, 2)}`;
                                        }
                                    }
                                }
                                if (isNaN(data.khoaSinhVien)) data.khoaSinhVien = '2022';
                                const tkb = await app.model.dtThoiKhoaBieu.create(data);
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
                                const listGiangVien = data.canBo.split(', ');
                                const listMaGiangVien = data.maCanBo.split(', ');
                                let dataGiangVien = {};
                                dataGiangVien.idThoiKhoaBieu = id;
                                dataGiangVien.ngayBatDau = data.ngayBatDau;
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
                                    } else {
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
                                index++;
                            } else {
                                index++;
                            }
                        }
                    }
                } else {
                    console.log('Error: worksheet not found');
                    process.exit(1);
                }
            }
            console.log('Running done!');
            unknowRoom.forEach(phong => console.log(phong));
            process.exit();
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});