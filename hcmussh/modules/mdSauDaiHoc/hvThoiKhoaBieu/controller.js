module.exports = app => {
    const PERMISSION = 'studentSdh:login';
    const DATE_UNIX = 24 * 60 * 60 * 1000;

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1305: { title: 'Thời khóa biểu', link: '/user/hoc-vien/thoi-khoa-bieu', groupIndex: 1 },
        }
    };
    app.permission.add(
        { name: 'studentSdh:login', menu });

    app.get('/user/hoc-vien/thoi-khoa-bieu', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/thoi-khoa-bieu', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { filter } = req.query, user = req.session.user, mssv = user.studentId;
            let items = [], listNgayLe = [], semester = {}, dataRet = [];
            if (filter.lichHoc) {
                items = await app.model.sdhDangKyHocPhan.getKetQuaDangKy(mssv, app.utils.stringify(filter));
                items = items.rows;

                let data = items.groupBy('maHocPhan');

                await Promise.all(Object.keys(data).map(async hocPhan => {
                    const data = await app.model.sdhThoiKhoaBieu.getData(hocPhan);
                    let fullData = data.rows.filter(item => item.ngayBatDau && item.ngayKetThuc && item.soTietBuoi && item.tietBatDau && item.thoiGianBatDau && item.thoiGianKetThuc && item.thu);

                    listNgayLe.push(data.datangayle);
                    const tmp = await app.model.sdhThoiKhoaBieu.generateSchedule({ fullData, dataTiet: data.datacahoc, listNgayLe: data.datangayle, dataTeacher: data.datateacher });
                    dataRet.push(tmp.filter(item => !item.isNgayLe));
                }));
                listNgayLe = listNgayLe.flat();
                let listNL = [];
                listNgayLe.map(item => {
                    if (!listNL.find(i => i.moTa == item.moTa && i.ngay == item.ngay)) {
                        listNL.push(item);
                    }
                });
                listNgayLe = listNL;

                items = dataRet.flat();
                items = items.map(item => ({ ...item, ngayKetThuc: item.ngayKetThuc + DATE_UNIX * 7 }));
            } else {
                items = await app.model.sdhDangKyHocPhan.getKetQuaDangKy(mssv, app.utils.stringify(filter));
                items = items.rows;
            }
            res.send({ items, listNgayLe, semester, namTuyenSinh: user.data.namTuyenSinh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/student-info', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, items = user.data;
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/hoc-ky/all', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let items = await app.model.dtDmHocKy.getAll({ kichHoat: 1 }, '*', 'ten');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/hoc-ky/item/:ma', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let items = await app.model.dtDmHocKy.get({ ma: req.params.ma });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });
};
