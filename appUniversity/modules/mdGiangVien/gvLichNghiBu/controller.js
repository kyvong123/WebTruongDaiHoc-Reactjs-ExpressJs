module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.giangVien,
        menus: {
            7625: {
                title: 'Lịch nghỉ bù',
                link: '/user/affair/lich-nghi-bu', icon: 'fa-power-off', backgroundColor: '#366384'
            }
        }
    };

    app.permission.add(
        { name: 'staff:teacher', menu },
    );

    app.get('/user/affair/lich-nghi-bu', app.permission.orCheck('staff:teacher'), app.templates.admin);
};