module.exports = app => {
    const menuFacultyProgramSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7540: {
                title: 'Quản lý Khoa, Ngành đào tạo', link: '/user/sau-dai-hoc/faculty-program', groupIndex: 0, backgroundColor: '#80E4F8', icon: 'fa-certificate'
            }
        }
    };

    const menuEduProgramSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7541: {
                title: 'Quản lý Chương trình đào tạo', link: '/user/sau-dai-hoc/edu-program', groupIndex: 1, backgroundColor: '#EAA315', icon: 'fa fa-university'
            }
        }
    };

    const menuSubjectProgramSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7542: {
                title: 'Quản lý môn học', link: '/user/sau-dai-hoc/subject-program', groupIndex: 1, backgroundColor: '#FF8C66', icon: 'fa fa-book'
            }
        }
    };

    const menuTopicProgramSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7543: {
                title: 'Quản lý đề tài', link: '/user/sau-dai-hoc/topic-program', groupIndex: 2, backgroundColor: '#FF8C66', icon: 'fa fa-cubes'
            }
        }
    };
    const menuEnrollment = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7544: {
                title: 'Tuyển sinh', link: '/user/sau-dai-hoc/tuyen-sinh', groupIndex: 1, backgroundColor: '#007BFF', icon: 'fa fa-users',
            }
        }
    };

    const menuDiemSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7560: {
                title: 'Quản lý điểm học phần', link: '/user/sau-dai-hoc/quan-ly-diem', groupIndex: 4, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-cogs'
            }
        }
    };
    const menuTuDienDuLieu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7570: {
                title: 'Từ điển dữ liệu', link: '/user/sau-dai-hoc/data-dictionary', groupIndex: 2,
            }
        }
    };
    app.permission.add(
        { name: 'sdhEduProgram:manage', menu: menuEduProgramSdh },
        { name: 'sdhFacultyProgram:manage', menu: menuFacultyProgramSdh },
        { name: 'sdhSubjectProgram:manage', menu: menuSubjectProgramSdh },
        { name: 'sdhTopicProgram:manage', menu: menuTopicProgramSdh },
        { name: 'sdhEnrollment:manage', menu: menuEnrollment },
        { name: 'sdhMenuDiem:manage', menu: menuDiemSdh },
        { name: 'sdhTuDienDuLieu:manage', menu: menuTuDienDuLieu }
    );

    app.get('/user/sau-dai-hoc/edu-program', app.permission.check('sdhEduProgram:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/faculty-program', app.permission.check('sdhFacultyProgram:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/subject-program', app.permission.check('sdhSubjectProgram:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/topic-program', app.permission.check('sdhTopicProgram:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/tuyen-sinh', app.permission.check('sdhEnrollment:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/quan-ly-diem', app.permission.check('sdhMenuDiem:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/data-dictionary', app.permission.check('sdhTuDienDuLieu:manage'), app.templates.admin);
};