module.exports = app => {
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7712: { title: 'Lịch thi', link: '/user/lich-thi' },
            }
        }
    });

    app.get('/user/lich-thi', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sv/lich-thi', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { filter, groupBy } = req.query, user = req.session.user, mssv = user.studentId;
            let [items, semester] = await Promise.all([
                app.model.dtExam.getExamSinhVien(mssv, app.utils.stringify(filter)),
                app.model.dtSemester.getCurrent(),
            ]);

            items = items.rows;
            items = items.map(item => ({
                ...item,
                thu: new Date(item.batDau).getDay() == 0 ? 8 : new Date(item.batDau).getDay() + 1
            }));

            if (items.length == 0) {
                items = {};
            }
            else if (typeof groupBy == 'string' && groupBy in items[0]) {
                items = items.groupBy(groupBy);
            }

            res.send({ items: items, semester });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
