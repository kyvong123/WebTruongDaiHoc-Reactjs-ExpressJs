module.exports = app => {
    const PERMISSION = 'sdhTsThiSinh:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.thongTinThiSinh,
            menus: {
                8102: { title: 'Lịch thi', link: '/user/sdh/ts/thi-sinh/lich-thi' },
            }
        }
    });
    app.get('/user/sdh/ts/thi-sinh/lich-thi', app.permission.check(PERMISSION), app.templates.admin);

};