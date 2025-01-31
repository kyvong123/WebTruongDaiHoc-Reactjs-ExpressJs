module.exports = app => {
    const menuEnrollmentPeriodSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7557: {
                title: 'Quản lý học phần', link: '/user/sau-dai-hoc/enrollment-period', groupIndex: 2, backgroundColor: '#80E4F8', icon: 'fa-calendar-check-o'
            }
        }
    };

    app.permission.add(
        { name: 'sdhEnrollmentPeriod:manage', menu: menuEnrollmentPeriodSdh },
    );

    app.get('/user/sau-dai-hoc/enrollment-period', app.permission.check('sdhEnrollmentPeriod:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhEnrollment', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhEnrollmentPeriod:manage');
            resolve();
        } else resolve();
    }));
};