module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6159: { title: 'Duyệt Sự Kiện', parentKey: 6156, icon: 'fa-check', link: '/user/ctsv/duyet-su-kien', backgroundColor: '#33cc33', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvSuKien:duyet', menu: menuCtsv },
    );

};