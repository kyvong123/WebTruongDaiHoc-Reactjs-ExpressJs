module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.giangVien,
        menus: {
            7621: {
                title: 'Lịch dạy theo ngày',
                link: '/user/lich-day', icon: 'fa-calendar'
            }
        }
    };

    app.permission.add({
        name: 'staff:teacher', menu
    });

    app.get('/user/lich-day', app.permission.check('staff:teacher'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleTeacher', (user, staff) => new Promise(resolve => {
        if (staff.shcc) {
            app.model.dtThoiKhoaBieuGiangVien.get({ giangVien: staff.shcc }, (error, item) => {
                if (!error && item) {
                    app.permissionHooks.pushUserPermission(user, 'staff:teacher');
                }
                resolve();
            });
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/dt/gv/get-lich-day', app.permission.orCheck('staff:teacher', 'gvLichGiangDay:manage'), async (req, res) => {
    //     try {
    //         let { filter, groupBy } = req.query, user = req.session.user, shcc = user.shcc;
    //         let [items, listNgayLe] = await Promise.all([
    //             app.model.dtThoiKhoaBieuGiangVien.getLichDay(shcc, app.utils.stringify(filter)),
    //             app.model.dmNgayLe.getAllNgayLeTrongNam(),
    //         ]);

    //         items = items.rows;
    //         items = items.map(item => ({
    //             ...item,
    //             thu: new Date(item.ngayBatDau).getDay() == 0 ? 8 : new Date(item.ngayBatDau).getDay() + 1
    //         }));

    //         if (filter.lichDay && filter.lichDay != 0) {
    //             items = items.filter(i => !i.isNghi);
    //         }

    //         if (items.length == 0) {
    //             items = {};
    //         }
    //         else if (typeof groupBy == 'string' && groupBy in items[0]) {
    //             items = items.groupBy(groupBy);
    //         }

    //         res.send({ items, listNgayLe });
    //     } catch (error) {
    //         res.send(error);
    //     }
    // });
};
