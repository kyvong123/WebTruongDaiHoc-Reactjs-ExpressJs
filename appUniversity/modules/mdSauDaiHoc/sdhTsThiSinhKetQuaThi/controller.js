module.exports = app => {
    const PERMISSION = 'sdhTsThiSinh:login';
    const PERMISSION_CANBO = 'sdhTsThiSinhMode:read';
    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.thongTinThiSinh,
            menus: {
                8103: { title: 'Kết quả thi', link: '/user/sdh/ts/thi-sinh/ket-qua-thi' },
            }
        }
    });

    app.get('/user/sdh/ts/thi-sinh/ket-qua-thi', app.permission.orCheck(PERMISSION, PERMISSION_CANBO), app.templates.admin);

};