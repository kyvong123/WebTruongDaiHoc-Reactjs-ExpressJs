module.exports = app => {
    const PERMISSION = 'student:test';
    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7711: { title: 'Lịch nghỉ bù', link: '/user/lich-nghi-bu' },
            }
        }
    });

    app.get('/user/lich-nghi-bu', app.permission.check(PERMISSION), app.templates.admin);

    // API

    app.get('/api/sv/lich-nghi-bu', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId;

            let filter = req.query.filter, semester = {};

            if (!filter) {
                semester = await app.model.dtSemester.getCurrent();
                filter = { namHoc: semester.namHoc, hocKy: semester.hocKy };
            }
            let items = await app.model.dtThoiKhoaBieu.getLichNghiBuSV(mssv, app.utils.stringify(filter));
            res.send({ itemsBu: items.rows, itemsNghi: items.datangaynghi, semester });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};