module.exports = app => {
    const menuDrl = {
        parentMenu: app.parentMenu.students,
        menus: {
            6160: {
                title: 'Điểm rèn luyện', subTitle: 'Cấp khoa', link: '/user/tccb/diem-ren-luyen', groupIndex: 2, icon: 'fa-vcard', backgroundColor: '#ac2d34'
            },
        }
    };

    app.permission.add(
        { name: 'staff:drl-manage', menu: menuDrl },
    );

    app.get('/user/tccb/diem-ren-luyen', app.permission.check('staff:drl-manage'), app.templates.admin);
};
