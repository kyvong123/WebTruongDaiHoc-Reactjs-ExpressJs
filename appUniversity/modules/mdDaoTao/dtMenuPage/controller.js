module.exports = app => {
    const menuDictionary = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7027: {
                title: 'Từ điển dữ liệu', link: '/user/dao-tao/data-dictionary', groupIndex: 2,
            }
        }
    };

    const menuEduProgram = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7028: {
                title: 'Quản lý Chương trình đào tạo', link: '/user/dao-tao/edu-program', groupIndex: 1, backgroundColor: '#38E54D', icon: 'fa-certificate'
            }
        }
    };

    const menuSchedule = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7029: {
                title: 'Quản lý Học phần', link: '/user/dao-tao/edu-schedule', groupIndex: 1, backgroundColor: '#FCE700', color: '#000', icon: 'fa-calendar-check-o'
            }
        }
    };

    const menuTuyenSinh = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7200: {
                title: 'Tuyển sinh', link: '/user/dao-tao/tuyen-sinh', groupIndex: 1, backgroundColor: '#2a9d8f', color: '#FFF', icon: 'fa-user-plus'
            }
        }
    };

    const menuDiem = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7047: {
                title: 'Quản lý điểm học phần', link: '/user/dao-tao/grade-manage', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-cogs'
            }
        }
    };

    const menuLuongGiangDay = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7050: {
                title: 'Quản lý thù lao giảng dạy', link: '/user/dao-tao/luong-giang-day', pin: false, backgroundColor: '#FFA96A', color: '#000', icon: 'fa fa-newspaper-o', groupIndex: 3
            }
        }
    };

    const menuQuanLyChungChi = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7068: {
                title: 'Quản lý chứng chỉ', link: '/user/dao-tao/certificate-management',
                groupIndex: 1, backgroundColor: '#78C1F3', color: '#000', icon: 'fa-language'
            }
        }
    };

    const menuXetTotNghiep = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7080: {
                title: 'Xét tốt nghiệp', link: '/user/dao-tao/graduation',
                groupIndex: 1, backgroundColor: '#FD8D14', color: 'black', icon: 'fa-graduation-cap'
            }
        }
    };

    app.permission.add(
        { name: 'dtDictionary:manage', menu: menuDictionary },
        { name: 'dtEduProgram:manage', menu: menuEduProgram },
        { name: 'dtSchedule:manage', menu: menuSchedule },
        { name: 'dtGrade:manage', menu: menuDiem },
        { name: 'dtTuyenSinh:manage', menu: menuTuyenSinh },
        { name: 'dtLuongGiangDay:manage', menu: menuLuongGiangDay },
        { name: 'dtCertificate:manage', menu: menuQuanLyChungChi },
        { name: 'dtGraduation:manage', menu: menuXetTotNghiep }
    );

    app.get('/user/dao-tao/data-dictionary', app.permission.check('dtDictionary:manage'), app.templates.admin);
    app.get('/user/dao-tao/edu-program', app.permission.orCheck('dtEduProgram:manage', 'manager:login'), app.templates.admin);
    app.get('/user/dao-tao/edu-schedule', app.permission.orCheck('dtSchedule:manage', 'manager:login'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage', app.permission.check('dtGrade:manage'), app.templates.admin);
    app.get('/user/dao-tao/tuyen-sinh', app.permission.check('dtTuyenSinh:manage'), app.templates.admin);
    app.get('/user/dao-tao/luong-giang-day', app.permission.check('dtLuongGiangDay:manage'), app.templates.admin);
    app.get('/user/dao-tao/certificate-management', app.permission.check('dtCertificate:manage'), app.templates.admin);
    app.get('/user/dao-tao/graduation', app.permission.check('dtGraduation:manage'), app.templates.admin);


    app.permissionHooks.add('staff', 'addRolesDtDataDictionary', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtTuyenSinh:manage', 'dtDictionary:manage', 'dtEduProgram:manage', 'dtSchedule:manage', 'dtGrade:manage', 'dtLuongGiangDay:manage', 'dtCertificate:manage', 'dtGraduation:manage');
            resolve();
        } else resolve();
    }));
};