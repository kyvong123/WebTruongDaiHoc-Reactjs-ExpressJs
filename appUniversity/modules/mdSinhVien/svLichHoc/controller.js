module.exports = app => {
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7710: { title: 'Lịch học', link: '/user/lich-hoc' },
            }
        }
    });

    app.get('/user/lich-hoc', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

};
