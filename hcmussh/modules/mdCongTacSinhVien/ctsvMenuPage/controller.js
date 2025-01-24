module.exports = app => {
    const menuDrl = {
        parentMenu: app.parentMenu.students,
        menus: {
            6129: {
                title: 'Điểm rèn luyện', link: '/user/ctsv/diem-ren-luyen', groupIndex: 2, icon: 'fa-calculator', backgroundColor: '#ac2d34'
            },
        }
    };

    const menuSvQtKyLuat = {
        parentMenu: app.parentMenu.students,
        menus: {
            6140: { title: 'Kỷ luật sinh viên', link: '/user/ctsv/ky-luat', icon: 'fa-ban', backgroundColor: '#B8492F', groupIndex: 2 },
        }
    };

    const menuTuDien = {
        parentMenu: app.parentMenu.students,
        menus: {
            6150: {
                title: 'Từ điển dữ liệu', link: '/user/ctsv/tu-dien-du-lieu', groupIndex: 3
            },
        }
    };
    const menuChungNhanTrucTuyen = {
        parentMenu: app.parentMenu.students,
        menus: {
            6107: {
                title: 'Chứng nhận trực tuyến', link: '/user/ctsv/chung-nhan-truc-tuyen', icon: 'fa-snowflake-o', backgroundColor: '#25316D', groupIndex: 2
            },
        }
    };

    const menuQuanLyQuyetDinh = {
        parentMenu: app.parentMenu.students,
        menus: {
            6111: {
                title: 'Quản lý quyết định', link: '/user/ctsv/quyet-dinh', icon: 'fa-file-text-o', backgroundColor: '#FF7B54', groupIndex: 2
            },
        }
    };
    const menuTotNghiep = {
        parentMenu: app.parentMenu.students,
        menus: {
            6155: {
                title: 'Tốt Nghiệp', link: '/user/ctsv/tot-nghiep', icon: 'fa-graduation-cap', backgroundColor: '#FF7B54', groupIndex: 2
            },
        }
    };
    const menuSuKien = {
        parentMenu: app.parentMenu.students,
        menus: {
            6156: {
                title: 'Sự kiện', link: '/user/ctsv/su-kien', icon: 'fa-file-text-o', backgroundColor: '#FF7B54', groupIndex: 2
            },
        }
    };
    
    app.permission.add(
        { name: 'ctsvDrl:manage', menu: menuDrl },
        { name: 'ctsvTddl:manage', menu: menuTuDien },
        { name: 'ctsvCntt:manage', menu: menuChungNhanTrucTuyen },
        { name: 'ctsvKyLuat:read', menu: menuSvQtKyLuat },
        { name: 'ctsvQlqd:manage', menu: menuQuanLyQuyetDinh},
        { name: 'ctsvTn:manage', menu: menuTotNghiep},
        { name: 'ctsvSuKien:manage', menu: menuSuKien}
    );

    app.get('/user/ctsv/diem-ren-luyen', app.permission.check('ctsvDrl:manage'), app.templates.admin);
    app.get('/user/ctsv/tu-dien-du-lieu', app.permission.check('ctsvTddl:manage'), app.templates.admin);
    app.get('/user/ctsv/ky-luat', app.permission.check('ctsvKyLuat:read'), app.templates.admin);
    app.get('/user/ctsv/chung-nhan-truc-tuyen', app.permission.check('ctsvCntt:manage'), app.templates.admin);
    app.get('/user/ctsv/quyet-dinh', app.permission.check('ctsvQlqd:manage'), app.templates.admin);
    app.get('/user/ctsv/tot-nghiep', app.permission.check('ctsvTn:manage'), app.templates.admin);
    app.get('/user/ctsv/su-kien', app.permission.check('ctsvSuKien:manage'), app.templates.admin);
    

    app.permissionHooks.add('staff', 'addRolesMenu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvBhyt:manage', 'ctsvDrl:manage', 'ctsvTddl:manage', 'ctsvKyLuat:read', 'ctsvCntt:manage', 'ctsvQlqd:manage', 'ctsvTn:manage', 'ctsvSuKien:manage');
            resolve();
        } else resolve();
    }));
};
