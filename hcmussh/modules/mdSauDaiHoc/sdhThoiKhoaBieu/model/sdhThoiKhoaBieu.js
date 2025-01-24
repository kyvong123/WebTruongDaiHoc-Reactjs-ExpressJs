// eslint-disable-next-line no-unused-vars
module.exports = app => {
    const DATE_UNIX = 24 * 60 * 60 * 1000;
    // app.model.sdhThoiKhoaBieu.foo = () => { };
    app.model.sdhThoiKhoaBieu.generateSchedule = (item) => {
        let { fullData, dataTiet, listNgayLe, dataTeacher } = item;
        let newData = [];
        if (fullData.length) {
            const ngayBatDauChung = fullData[0].ngayBatDau;
            let thuBatDau = new Date(fullData[0].ngayBatDau).getDay() + 1;
            if (thuBatDau == 1) thuBatDau = 8;
            fullData = fullData.map(item => {
                if (item.thu != thuBatDau) {
                    let deviant = parseInt(item.thu) - thuBatDau;
                    if (deviant < 0) deviant += 7;
                    item.ngayBatDau = ngayBatDauChung + deviant * DATE_UNIX;
                }
                item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
                return item;
            });
            fullData.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
            let sumTiet = 0;
            let currentWeek = fullData[0].tuanBatDau;

            const tongTiet = parseInt(fullData[0].tongTiet);
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
                        cloneData[i].ngayBatDau += 7 * DATE_UNIX;
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
        }
        return newData;
    };
};