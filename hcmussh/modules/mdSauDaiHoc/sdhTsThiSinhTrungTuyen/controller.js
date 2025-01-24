module.exports = app => {
    const PERMISSION = 'sdhTsThiSinh:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.thongTinThiSinh,
            menus: {
                8114: { title: 'Kết quả tuyển sinh', link: '/user/sdh/ts/thi-sinh/trung-tuyen' },
            }
        }
    });
    app.get('/user/sdh/ts/thi-sinh/trung-tuyen', app.permission.check(PERMISSION), app.templates.admin);

};