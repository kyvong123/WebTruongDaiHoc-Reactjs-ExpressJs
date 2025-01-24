module.exports = app => {
    const PERMISSION = 'student:login';
    const DATE_UNIX = 24 * 60 * 60 * 1000;

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7705: { title: 'Thời khóa biểu', link: '/user/thoi-khoa-bieu' },
            }
        }
    });

    app.get('/user/thoi-khoa-bieu', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sv/thoi-khoa-bieu', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { filter, groupBy } = req.query, user = req.session.user, mssv = user.studentId, dataTuan = [];

            let [items, listNgayLe] = await Promise.all([
                app.model.dtDangKyHocPhan.getKetQuaDangKy(mssv, app.utils.stringify(filter)),
                app.model.dmNgayLe.getAll({}, 'ngay,moTa'),
            ]);
            items = items.rows;
            const data = items.groupBy('maHocPhan');
            await Promise.all(Object.keys(data).map(async maHocPhan => {
                const tkb = await app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify(filter));
                dataTuan.push(...tkb.rows);
            }));

            if (filter.lichHoc != 0) {
                dataTuan = dataTuan.filter(i => !i.isNgayLe && !i.isNghi).map(i => ({ ...i, ngayKetThuc: i.ngayKetThuc + DATE_UNIX * 7 }));
            }

            if (dataTuan.length == 0) {
                dataTuan = {};
            }
            else if (typeof groupBy == 'string' && groupBy in dataTuan[0]) {
                dataTuan = dataTuan.groupBy(groupBy);
            }

            res.send({ items, listNgayLe, dataTuan, namTuyenSinh: user.data.namTuyenSinh });
        } catch (error) {
            console.log('error', error);
            res.send({ error });
        }
    });

    app.get('/api/sv/student-info', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, items = user.data;
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/hoc-ky/all', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let items = await app.model.dtDmHocKy.getAll({ kichHoat: 1 }, '*', 'ten');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/hoc-ky/item/:ma', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let items = await app.model.dtDmHocKy.get({ ma: req.params.ma });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/thoi-khoa-bieu/export', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { filter } = req.query,
                { namHoc, hocKy } = JSON.parse(filter),
                user = req.session.user;

            const data = await app.model.dtDangKyHocPhan.generatePdfDkhpFile(user.mssv, namHoc, hocKy);
            res.download(data.filePdfPath, 'KetQuaDangKyMonHoc.pdf');
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
