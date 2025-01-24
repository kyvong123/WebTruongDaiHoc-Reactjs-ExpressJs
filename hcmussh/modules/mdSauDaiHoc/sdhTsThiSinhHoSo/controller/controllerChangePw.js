module.exports = app => {


    let menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            7619: { title: 'Đổi mật khẩu', link: '/user/sdh/ts/thi-sinh/change-password', icon: 'fa-key', backgroundColor: 'green', groupIndex: 0 }
        }
    };
    app.permission.add(
        { name: 'sdhTsUngVien:login', menu },
        { name: 'sdhTsThiSinh:login', menu },
    );

    app.get('/user/sdh/ts/thi-sinh/change-password', app.permission.orCheck('sdhTsUngVien:login', 'sdhTsThiSinh:login'), app.templates.admin);

};