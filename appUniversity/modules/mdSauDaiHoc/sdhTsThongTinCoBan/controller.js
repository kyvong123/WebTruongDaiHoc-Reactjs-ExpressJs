
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7607: {
                title: 'Quản lý hồ sơ',
                parentKey: 7544,
                link: '/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh',
                icon: 'fa-users',
            },
        },
    };
    app.permission.add(
        { name: 'sdhDsTs:manage', menu },
        { name: 'sdhDsTs:write', menu },
        { name: 'sdhDsTs:export', menu },
        'sdhDsTs:delete',
        'sdhDsTs:import',
        'sdhDsTs:adminManage',
    );

    app.get('/user/sdh/ts/thi-sinh/ho-so', app.permission.orCheck('sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), app.templates.admin);

    //--------------API-------------------

    app.get('/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh', app.permission.orCheck('sdhDsTs:write', 'sdhDsTs:export'), app.templates.admin);
    app.get('/user/sau-dai-hoc/thi-sinh/item/:id', app.permission.orCheck('sdhDsTs:write', 'sdhDsTs:export'), app.templates.admin);
    app.get('/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh/upload', app.permission.check('sdhDsTs:import'), app.templates.admin);


    app.get('/sdh/ts', app.templates.home);
    app.get('/sdh/dkts', app.templates.home);
    app.get('/sdh/bieu-mau-dang-ky', app.templates.home);
    app.get('/sdh/bieu-mau-dang-ky/detail', app.templates.home);


    //-------------------------------------APIs------------------------------------------------//
    //trang home khong check permission
};