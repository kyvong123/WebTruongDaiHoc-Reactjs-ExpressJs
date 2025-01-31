module.exports = app => {
    const menuTuDien = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10100: { title: 'Từ điển dữ liệu', link: '/user/tmdt/tu-dien-du-lieu', groupIndex: 2 },
        }
    };

    app.permission.add(
        { name: 'tmdtTddl:manage', menu: menuTuDien },
    );

    app.get('/user/tmdt/tu-dien-du-lieu', app.permission.check('tmdtTddl:manage'), app.templates.admin);
};