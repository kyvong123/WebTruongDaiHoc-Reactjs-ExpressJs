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
        const generateSchedule = (item) => {
            let { fullData, dataTiet, listNgayLe, dataTeacher } = item;
            const ngayBatDauChung = fullData[0].ngayBatDau;
            let thuBatDau = new Date(fullData[0].ngayBatDau).getDay() + 1;
            if (thuBatDau == 1) thuBatDau = 8;
            let newData = [];

            fullData = fullData.map(item => {
                if (item.thu != thuBatDau) {
                    let deviant = parseInt(item.thu) - thuBatDau;
                    if (deviant < 0) deviant += 7;
                    item.ngayBatDau = ngayBatDauChung + deviant * 24 * 60 * 60 * 1000;
                }
                item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
                return item;
            });
            fullData.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
            let sumTiet = 0;
            let currentWeek = fullData[0].tuanBatDau;

            const tongTiet = parseInt(fullData[0].soTietThucHanh) + parseInt(fullData[0].soTietLyThuyet);
            fullData[0].thoiGianBatDau = dataTiet.find(item => item.ten == fullData[0].tietBatDau).thoiGianBatDau;
            fullData[0].thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(fullData[0].tietBatDau) + parseInt(fullData[0].soTietBuoi) - 1).thoiGianKetThuc;
            const cloneData = [];
            fullData.forEach(item => cloneData.push(Object.assign({}, item)));
            while (sumTiet < tongTiet) {
                for (let i = 0; i < cloneData.length; i++) {
                    const hocPhan = Object.assign({}, cloneData[i]);
                    if (cloneData[i].tuanBatDau == currentWeek) {
                        const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));
                        if (!checkNgayLe) {
                            sumTiet += parseInt(cloneData[i].soTietBuoi);
                            const [gioBatDau, phutBatDau] = cloneData[i].thoiGianBatDau.split(':'),
                                [gioKetThuc, phutKetThuc] = cloneData[i].thoiGianKetThuc.split(':');

                            hocPhan.ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                            hocPhan.ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                            hocPhan.giangVien = dataTeacher.filter(item => item.type == 'GV').find(item => item.ngayBatDau == hocPhan.ngayBatDau)?.hoTen || '';
                            hocPhan.troGiang = dataTeacher.filter(item => item.type == 'TG').find(item => item.ngayBatDau == hocPhan.ngayBatDau)?.hoTen || '';
                            newData = [...newData, hocPhan];
                        } else {
                            newData = [...newData, { ...hocPhan, isNgayLe: true, ngayLe: checkNgayLe.moTa }];
                        }
                        cloneData[i].tuanBatDau++;
                        cloneData[i].ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                    }
                    if (sumTiet >= tongTiet) {
                        let deviant = sumTiet - tongTiet;
                        if (deviant != 0) {
                            const lastHocPhan = newData.pop();
                            lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                            const thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                                [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                            lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                            lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                            newData.push(lastHocPhan);
                        }
                        break;
                    }
                }
                cloneData.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
                currentWeek++;
            }

            return newData;
        };
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data2021.1.xlsx')); if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            if (worksheet) {
                let nam = new Date().getFullYear();
                let [listNgayLe, dataTiet] = await Promise.all([
                    app.model.dmNgayLe.getAll({
                        statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                        parameter: {
                            startDateOfYear: new Date(nam, 0, 1).setHours(0, 0, 0, 0),
                            endDateOfYear: new Date(nam, 11, 31).setHours(23, 59, 59, 999)
                        }
                    }),
                    app.model.dmCaHoc.getAll({ maCoSo: 2 }, '*')
                ]);
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
                        process.exit();
                    } else {
                        const data = {
                            maHocPhan: getVal('A'),
                            nhom: getVal('B') ? ('0' + getVal('B')).slice(-2) : '01',
                            thu: getVal('H'),
                            tietBatDau: getVal('I'),
                            soTietBuoi: getVal('J'),
                            phong: getVal('M').trim(),
                            lop: getVal('D').replaceAll(/ - nhom ./g, ''),
                            soLuongDuKien: getVal('R'),
                            startDate: getVal('N'), //date
                            namHoc: '2022 - 2023',
                            hocKy: '2',
                            khoaSinhVien: 2021,
                            isMo: 1,
                            buoi: 1,
                            loaiHinhDaoTao: 'CQ',
                            bacDaoTao: 'DH',
                            coSo: 2,
                            tinhTrang: 1,
                            maCanBo: getVal('O'),
                            canBo: getVal('P').replaceAll('  ', ' ')
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Import line ${index}`);
                        if (data.startDate) {
                            let date = data.startDate;
                            data.ngayBatDau = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                            if (isNaN(data.ngayBatDau)) data.ngayBatDau = '';
                        }
                        if (data.endDate) {
                            let date = data.endDate;
                            data.ngayKetThuc = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).setHours(0, 0, 0, 0);
                            if (isNaN(data.ngayKetThuc)) data.ngayKetThuc = '';
                        }
                        data.maMonHoc = data.maHocPhan.substring(4);
                        data.maHocPhan = data.maHocPhan + 'L' + data.nhom;
                        let subject = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,khoa,tietLt,tietTh');
                        if (subject) {
                            data.khoaDangKy = subject.khoa;
                            data.soTietLyThuyet = subject.tietLt;
                            data.soTietThucHanh = subject.tietTh;
                            if (data.phong) {
                                let room = await app.model.dmPhong.get({ ten: data.phong }, 'sucChua');
                                if (room) data.sucChua = room.sucChua;
                                else {
                                    console.log(`- ERROR: Room ${data.phong} doesn't exist in database`);
                                    await app.model.dmPhong.create({ toaNha: 101, kichHoat: 1, sucChua: 0, coSo: 2, ten: data.phong });
                                    data.sucChua = 0;
                                }
                            }

                            const checkTkb = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan: data.maHocPhan });
                            if (checkTkb && checkTkb.length) {
                                data.buoi = checkTkb.length + 1;
                                data.soBuoiTuan = checkTkb.length + 1;
                                await app.model.dtThoiKhoaBieu.update({ maHocPhan: data.maHocPhan }, { soBuoiTuan: data.soBuoiTuan });
                            }
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
                            if (data.tietBatDau) {
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
                                    const dataToCreate = generateSchedule({
                                        fullData: [tkb],
                                        listNgayLe,
                                        dataTiet,
                                        dataTeacher: [dataGiangVien]
                                    });
                                    let ngayKetThuc = new Date(dataToCreate.slice(-1)[0].ngayKetThuc).setHours(0, 0, 0, 0);
                                    await app.model.dtThoiKhoaBieu.update({ id: tkb.id }, { ngayKetThuc });
                                    if (gv.trim()) {
                                        for (let item of dataToCreate.filter(item => !item.isNgayLe)) {
                                            await app.model.dtThoiKhoaBieuGiangVien.create({
                                                idThoiKhoaBieu: item.id,
                                                giangVien: dataGiangVien.giangVien,
                                                type: 'GV',
                                                ngayBatDau: item.ngayBatDau,
                                                ngayKetThuc: item.ngayKetThuc,
                                            });
                                        }
                                    }

                                }
                            }
                        } else {
                            console.log(`- Line ${index} ERROR: Subject ${data.maMonHoc} doesn't exist in database`);
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