module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7635: {
                title: 'Mô phỏng góc nhìn thí sinh',
                link: '/user/sau-dai-hoc/tuyen-sinh/mo-phong',
                parentKey: 7544,
                icon: 'fa-user',
                groupIndex: 1,
                backgroundColor: 'orange'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsThiSinhMoPhong:read', menu }
    );
    app.get('/user/sau-dai-hoc/tuyen-sinh/mo-phong', app.permission.check('sdhTsThiSinhMoPhong:read'), app.templates.admin);
};
