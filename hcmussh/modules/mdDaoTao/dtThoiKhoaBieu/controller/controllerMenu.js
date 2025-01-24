module.exports = app => {
    const menuTKB = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7001: {
                title: 'Thời khóa biểu', groupIndex: 0, parentKey: 7029,
                link: '/user/dao-tao/danh-muc/thoi-khoa-bieu', icon: 'fa-calendar', backgroundColor: '#1ca474'
            }
        }
    };
    const menuTraCuu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7069: {
                title: 'Tra cứu và In thời khóa biểu', groupIndex: 0, parentKey: 7001,
                link: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in', icon: 'fa-clipboard', backgroundColor: '#3ebede'
            },
        }
    };
    const menuSapXep = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7070: {
                title: 'Sắp xếp thời khóa biểu', groupIndex: 0, parentKey: 7001,
                link: '/user/dao-tao/thoi-khoa-bieu', icon: 'fa-calendar-o', backgroundColor: '#dba465'
            }
        }
    };
    const menuTcPhong = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7072: {
                title: 'Tra cứu phòng trống', groupIndex: 0, parentKey: 7069,
                link: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-phong-trong', icon: 'fa-superpowers', backgroundColor: '#f5837f'
            }
        }
    };
    const menuTcTKB = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7073: {
                title: 'Tra cứu thời khóa biểu', groupIndex: 0, parentKey: 7069,
                link: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-thoi-khoa-bieu', icon: 'fa-superpowers', backgroundColor: '#f5ed7f'
            }
        }
    };
    const menuExport = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7074: {
                title: 'Thời khóa biểu', groupIndex: 0, parentKey: 7069,
                link: '/user/dao-tao/thoi-khoa-bieu/export', icon: 'fa-print', backgroundColor: '#42bff5'
            },
        }
    };
    const menuThongKe = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7105: {
                title: 'Thống kê', groupIndex: 0, parentKey: 7069,
                link: '/user/dao-tao/thoi-khoa-bieu/thong-ke', icon: 'fa-bar-chart', backgroundColor: '#76CC30'
            },
        }
    };
    const menuLichPhong = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7110: {
                title: 'Lịch phòng', groupIndex: 0, parentKey: 7069,
                link: '/user/dao-tao/thoi-khoa-bieu/phong-scheduler', icon: 'fa-calendar', backgroundColor: '#33706C'
            },
        }
    };
    app.permission.add(
        { name: 'dtThoiKhoaBieu:manage', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:manage', menu: menuTraCuu },
        { name: 'dtThoiKhoaBieu:manage', menu: menuSapXep },
        { name: 'dtThoiKhoaBieu:manage', menu: menuTcPhong },
        { name: 'dtThoiKhoaBieu:manage', menu: menuTcTKB },
        { name: 'dtThoiKhoaBieu:manage', menu: menuExport },
        { name: 'dtThoiKhoaBieu:read', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:traCuu', menu: menuTraCuu },
        { name: 'dtThoiKhoaBieu:read', menu: menuSapXep },
        { name: 'dtThoiKhoaBieu:traCuuPhong', menu: menuTcPhong },
        { name: 'dtThoiKhoaBieu:traCuuTKB', menu: menuTcTKB },
        { name: 'dtThoiKhoaBieu:export', menu: menuExport },
        { name: 'dtThoiKhoaBieu:traCuuPhong', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:traCuuTKB', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:export', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:thongKe', menu: menuThongKe },
        { name: 'dtThoiKhoaBieu:thongKe', menu: menuTKB },
        { name: 'dtThoiKhoaBieu:lichPhong', menu: menuLichPhong },
        'dtThoiKhoaBieu:write',
        'dtThoiKhoaBieu:delete',
        'dtThoiKhoaBieu:import',
    );

    app.get('/user/dao-tao/thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/export', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/tra-cuu-in', app.permission.orCheck('dtThoiKhoaBieu:traCuu', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/danh-muc/thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:traCuuPhong', 'dtThoiKhoaBieu:traCuuTKB', 'dtThoiKhoaBieu:export'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/thong-ke-tuan-hoc', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/import-thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:import'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/import-diem/:maHocPhan', app.permission.check('dtThoiKhoaBieu:import'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/auto-generate', app.permission.check('dtThoiKhoaBieu:read'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/auto-generate-schedule', app.permission.check('dtThoiKhoaBieu:read'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/tra-cuu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:traCuuPhong', 'dtThoiKhoaBieu:traCuuTKB', 'dtThoiKhoaBieu:export'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/edit/:id', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:export'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/view/:id', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:export'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/new', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/tra-cuu-phong-trong', app.permission.orCheck('dtThoiKhoaBieu:traCuuPhong', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/tra-cuu-thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:traCuuTKB', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/import-thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/gen-schedule', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/thong-ke', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:thongKe'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/phong-scheduler', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:lichPhong'), app.templates.admin);
};