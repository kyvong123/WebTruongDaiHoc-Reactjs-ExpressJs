module.exports = (app, appConfig) => {
    const checkPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user, division = Date.now() - req.session.user.expiration;
            if (division < 60 * 60 * 2000 || app.isDeveloper(user.email) || (user.isStaff && user.maDonVi != 33)) {
                req.session.user.expiration = Date.now();
                req.session.save();

                if (user.permissions && user.permissions.contains(permissions)) {
                    next();
                } else if (permissions.length == 0) {
                    next();
                } else {
                    responseError(req, res);
                }
            } else {
                req.session.user = null;
                req.session.save();
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const checkOrPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user, division = Date.now() - req.session.user.expiration;
            if (division < 60 * 60 * 2000 || app.isDeveloper(user.email) || (user.isStaff && user.maDonVi != 33)) {
                req.session.user.expiration = Date.now();
                req.session.save();
                if (user.permissions && user.permissions.exists(permissions)) {
                    next();
                } else if (permissions.length == 0) {
                    next();
                } else {
                    responseError(req, res);
                }
            } else {
                req.session.user = null;
                req.session.save();
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const responseError = (req, res) => {
        if (!req.session.user) {
            res.redirect('/request-login');
        } else {
            if (req.method.toLowerCase() === 'get') { // is get method
                if (req.originalUrl.startsWith('/api')) {
                    res.send({ error: 'request-permissions' });
                } else {
                    res.redirect('/request-permissions');
                }
            } else {
                res.send({ error: 'You don\'t have permission!' });
            }
        }

    };
    const responseWithPermissions = (req, success, fail, permissions) => {
        if (req.session.user) {
            if (req.session.user.permissions && req.session.user.permissions.contains(permissions)) {
                success();
            } else {
                fail && fail();
            }
        } else if (permissions.length == 0) {
            success();
        } else {
            fail && fail();
        }
    };

    const systemPermission = [];
    const menuTree = {};
    app.permission = {
        all: () => [...systemPermission],

        tree: () => app.clone(menuTree),

        add: (...permissions) => {
            permissions.forEach(permission => {
                if (typeof permission == 'string') {
                    permission = { name: permission };
                } else if (permission.menu) {
                    if (permission.menu.parentMenu) {
                        const { index, subMenusRender } = permission.menu.parentMenu;
                        if (menuTree[index] == null) {
                            menuTree[index] = {
                                parentMenu: app.clone(permission.menu.parentMenu),
                                menus: {}
                            };
                        }
                        if (permission.menu.menus == null) {
                            menuTree[index].parentMenu.permissions = [permission.name];
                        }
                        menuTree[index].parentMenu.subMenusRender = menuTree[index].parentMenu.subMenusRender || (subMenusRender != null ? subMenusRender : true);
                    }

                    const menuTreeItem = menuTree[permission.menu.parentMenu.index],
                        submenus = permission.menu.menus;
                    if (submenus) {
                        Object.keys(submenus).forEach(menuIndex => {
                            if (menuTreeItem.menus[menuIndex]) {
                                const menuTreItemMenus = menuTreeItem.menus[menuIndex];
                                if (menuTreItemMenus.title == submenus[menuIndex].title && menuTreItemMenus.link == submenus[menuIndex].link) {
                                    menuTreItemMenus.permissions.push(permission.name);
                                } else {
                                    console.error(`Menu index #${menuIndex} is not available!`);
                                }
                            } else {
                                menuTreeItem.menus[menuIndex] = app.clone(submenus[menuIndex], { permissions: [permission.name] });
                            }
                        });
                    }
                }

                (systemPermission.includes(permission.name) && !permission.name.startsWith('developer:')) || systemPermission.push(permission.name);
            });
        },

        check: (...permissions) => (req, res, next) => {
            if (req.query.accessToken) { // Của QS
                app.model.fwAccessToken.get({ token: req.query.accessToken }, (error, item) => {
                    if (error || !item) {
                        res.send({ error: 'Permission denied!' });
                    } else {
                        const tokenPermissions = (item.permissions || '').split(',');

                        if (tokenPermissions.contains(permissions) || permissions.length == 0) {
                            next();
                        } else {
                            res.send({ error: 'Permission denied!' });
                        }
                    }
                });
            } else if (app.isDebug && req.session.user == null) {
                const personId = req.cookies.personId || '003379';
                const condition = {
                    statement: 'shcc=:personId OR studentId=:personId OR email=:personId',
                    parameter: { personId }
                };
                app.model.fwUser.get(condition, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkPermissions(req, res, next, permissions));
                    }
                });
            }
            else {
                checkPermissions(req, res, next, permissions);
            }
        },

        orCheck: (...permissions) => (req, res, next) => {
            if (app.isDebug && req.session.user == null) {
                const personId = req.cookies.personId || '003379';
                const condition = {
                    statement: 'shcc=:personId OR studentId=:personId OR email=:personId',
                    parameter: { personId }
                };
                app.model.fwUser.get(condition, (error, user) => {
                    if (error || user == null) {
                        // res.setHeader('Clear-Site-Data', '“cache”, “cookies”');
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkOrPermissions(req, res, next, permissions));
                    }
                });
            } else {
                checkOrPermissions(req, res, next, permissions);
            }
        },

        has: (req, success, fail, ...permissions) => {
            if (typeof fail == 'string') {
                permissions.unshift(fail);
                fail = null;
            }
            if (app.isDebug && (req.session.user == null || req.session.user == undefined)) {
                const personId = req.cookies.personId || '003379';
                app.model.fwUser.get({ shcc: personId }, (error, user) => {
                    if (error || user == null) {
                        fail && fail({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => responseWithPermissions(req, success, fail, permissions));
                    }
                });
            } else {
                responseWithPermissions(req, success, fail, permissions);
            }
        },

        isLocalIp: (req, res, next) => { // ::ffff:10.22.1.53
            const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
            app.isDebug || ip.startsWith(appConfig.localIpPrefix) || ip.startsWith('::ffff:' + appConfig.localIpPrefix) ?
                next() : res.send({ error: 'Invalid IP!' });
        },

        getTreeMenuText: () => {
            let result = '';
            Object.keys(menuTree).sort().forEach(parentIndex => {
                result += `${parentIndex}. ${menuTree[parentIndex].parentMenu.title} (${menuTree[parentIndex].parentMenu.link})\n`;

                Object.keys(menuTree[parentIndex].menus).sort().forEach(menuIndex => {
                    const submenu = menuTree[parentIndex].menus[menuIndex];
                    result += `\t${menuIndex} - ${submenu.title} (${submenu.link})\n`;
                });
            });
            app.fs.writeFileSync(app.path.join(app.assetPath, 'menu.txt'), result);
        }
    };

    // Update user's session ------------------------------------------------------------------------------------------------------------------------
    const initManager = async (user) => {
        if (!(user && user.staff && user.staff.listChucVu && user.staff.listChucVu.length)) {
            return [];
        } else {
            const listMaChucVuQuanLy = await app.model.dmChucVu.getAll({
                statement: '(ten LIKE :truongDonVi or lower(ten) like :giamDoc) or ten LIKE :phoDonVi or lower(ten) like :phoGiamDoc',
                parameter: { truongDonVi: '%Trưởng%', phoDonVi: '%Phó%', giamDoc: '%giám đốc%', phoGiamDoc: '%phó giám đốc%' }
            }, 'ma,ten');
            let [listManager, listDeputy] = listMaChucVuQuanLy.reduce(([listManager, listDeputy], item) => {
                if (item.ten.toLowerCase().includes('phó')) listDeputy.push(item.ma);
                else listManager.push(item.ma);
                return [listManager, listDeputy];
            }, [[], []]);
            const listChucVu = user.staff.listChucVu;
            return listChucVu.filter(item => listMaChucVuQuanLy.map(item => item.ma).includes(item.maChucVu)).map(item => app.clone(item, { isManager: listManager.includes(item.maChucVu), isDeputy: listDeputy.includes(item.maChucVu) }));
        }
    };

    const hasPermission = (userPermissions, menuPermissions) => {
        for (let i = 0; i < menuPermissions.length; i++) {
            if (userPermissions.includes(menuPermissions[i])) return true;
        }
        return false;
    };

    const listMssvForTest = ['12345', 'SV01', 'SV02', 'SV03', 'SV04', 'SV05'];
    const handleStudentLogin = async (user) => {
        let student = null;
        if (user.email == 'ctsv05@hcmussh.edu.vn') {
            student = (await app.model.fwStudent.getData('12345')).rows[0];
        } else {
            student = (await app.model.fwStudent.getData(user.email?.replace('@hcmussh.edu.vn', '').toUpperCase())).rows[0];
        }
        if (!student) {
            return false;
        }

        // app.permissionHooks.pushUserPermission(user, 'student:login');
        // student.tinhTrang === 11 && app.permissionHooks.pushUserPermission(user, 'student:pending');
        app.permissionHooks.pushUserPermission(user, student.tinhTrang === 11 ? 'student:pending' : 'student:login');

        const { khoa, khoaSinhVien, namTuyenSinh, mssv, emailTruong, loaiHinhDaoTao, tinhTrang, lop, ngayNhapHoc, ho, ten, image, loaiSinhVien, ngaySinh, gioiTinh, noiSinh, hoTen } = student;
        user.tenDonVi = student.tenKhoa || '';
        user.isStudent = 1;
        user.active = 1;
        listMssvForTest.includes(mssv) && app.permissionHooks.pushUserPermission(user, 'student:test');

        let khoaSV = lop ? khoaSinhVien : namTuyenSinh;
        // let lopInfo = '';
        // try {
        //     lopInfo = await app.model.dtLop.get({ maLop: lop }, 'khoaSinhVien');
        // } catch (error) {
        //     if (error) lopInfo = { khoaSinhVien: namTuyenSinh };
        // }
        user.data = { khoa, namTuyenSinh, mssv, emailTruong, loaiHinhDaoTao, tinhTrang, lop, khoaSV, loaiSinhVien, ngaySinh, gioiTinh, noiSinh, hoTen };
        user.ngayNhapHoc = ngayNhapHoc;
        user.studentId = mssv;
        user.mssv = mssv;
        user.lastName = ho;
        user.firstName = ten;
        user.image = image || user.image;
        console.log(` + Student ${mssv} logged in at: ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}`);

        await app.permissionHooks.run('student', user);

        // // AssignRole hooks
        // try {
        //     if (user.isStudent) {
        //         const roles = await app.model.fwAssignRole.getAll({ nguoiDuocGan: user.studentId });
        //         if (roles != []) {
        //             const checkExpire = role => !role.ngayKetThuc || new Date(role.ngayKetThuc).getTime() > new Date().getTime();
        //             // Xóa các role đã hết hạn
        //             const validRoles = roles.filter(checkExpire);
        //             const invalidRoles = roles.filter(role => !checkExpire(role));
        //             if (invalidRoles.length) {
        //                 await app.model.fwAssignRole.delete({
        //                     statement: 'id IN (:roles)',
        //                     parameter: { roles: invalidRoles.map(role => role.id) }
        //                 });
        //             }
        //             if (validRoles.length) {
        //                 await app.permissionHooks.run('assignRoleStudent', user, validRoles);
        //             }
        //         }
        //     }
        // } catch (e) {
        //     // 
        // }


        return true;
    };

    const handleGraduatedStudentLogin = async (user) => {
        let student = await app.model.fwSinhVienSdh.get({
            statement: 'LOWER(email) = :email',
            parameter: { email: user.email?.toLowerCase() }
        });
        let studentDetail = await app.model.fwSinhVienSdh.getData(student.mssv);
        if (!student) {
            return false;
        }
        app.permissionHooks.pushUserPermission(user, 'studentSdh:login');
        let { lop, khoaSinhVien, khoa, namTuyenSinh, mssv, email } = studentDetail.rows[0];
        let khoaSV = lop ? khoaSinhVien : namTuyenSinh;
        user.isStudentSdh = 1;
        user.active = 1;
        user.data = { khoa, namTuyenSinh, mssv, email, khoaSV, lop };
        user.studentId = student.mssv;
        user.lastName = student.ho;
        user.firstName = student.ten;
        return true;
    };

    const listStaffForTest = ['thanhtra01@hcmussh.edu.vn', 'giaovien01@hcmussh.edu.vn'];
    const handleSdhThiSinhLogin = async (user) => {
        try {
            if (user.isThiSinhSdh) {
                const dot = await app.model.sdhTsInfoTime.get({ processingTs: 1 });
                if (dot && dot.id) {
                    let items = await app.model.sdhTsThongTinCoBan.getAll({ email: user.email, idDot: dot.id });
                    if (items.length) {
                        let item = '';
                        // Trường hợp có 1 hoặc 2 hồ sơ nhưng chưa đăng nhập lần nào, cần trigger 1 bộ hồ sơ lên: 
                        if (items.filter(item => item.triggerPh == 1).length == 0) { //triggerPh: cờ phân hệ đang xử lý, null do đăng nhập lần dầu;
                            item = items[0];
                            app.model.sdhTsThongTinCoBan.update({ email: user.email, idDot: dot.id, phanHe: item.phanHe }, { triggerPh: 1 });//default 1 trên phân hệ đăng ký trước (id min)
                        } else {
                            // Trường hợp đã đăng nhập thì kiểm tra trạng thái hồ sơ == 2 tức là hồ sơ bị từ chối, ta chỉ trigger phân hệ cho hồ sơ đang chờ duyệt hoặc hồ sơ đã duyệt.
                            item = items.find(i => i.triggerPh == 1);
                            if (item.isXetDuyet == 2) {
                                // Đổi sang hồ sơ khác nếu có khi hồ sơ đang triggerPh bị từ chối
                                items = items.filter(i => i.isXetDuyet != 2);
                                if (items.length) {
                                    app.model.sdhTsThongTinCoBan.update({ email: user.email, idDot: dot.id, phanHe: items[0].phanHe }, { triggerPh: 1 });
                                    item = items[0];
                                }
                            }
                        }
                        user.lastName = item.ho;
                        user.firstName = item.ten;
                        user.ngaySinh = item.ngaySinh;
                        user.dienThoai = item.dienThoai;
                        user.sbd = item.sbd;
                        user.idThiSinh = item.id;
                        user.phanHe = item.phanHe;
                        user.isXetDuyet = item.isXetDuyet;
                        user.dot = dot;
                        if (!item.isXetDuyet) {
                            // isXetDuyet == 0 or null là hồ sơ đang chờ duyệt
                            app.permissionHooks.pushUserPermission(user, 'sdhTsUngVien:login');
                            return true;
                        } else if (item.isXetDuyet == 1) {
                            // isXetDuyet == 1 là hồ sơ được duyệt
                            app.permissionHooks.pushUserPermission(user, 'sdhTsThiSinh:login');
                            return true;
                        }
                        else {
                            // isXetDuyet == 2 là hồ sơ bị từ chối
                            app.permissionHooks.pushUserPermission(user, 'sdhTsThiSinh:reject');
                            return false;
                        }
                    }
                }

            }
        }
        catch (e) {
            //
        }
    };
    const handleStaffLogin = async (user) => {
        user.isStaff && app.permissionHooks.pushUserPermission(user, 'staff:login', 'user:login');
        let item = null;
        try {
            item = await app.model.tchcCanBo.get({
                statement: 'email = :email AND ngayNghi IS NULL',
                parameter: { email: user.email }
            });
        }
        catch (e) {
            if (!user.isStaff) {
                user.permissions = user.permissions.filter(item => item != 'staff:login');
            } else {
                user.isUnit = 1;
            }
        }
        if (listStaffForTest.includes(user.email)) user.isStaffTest = 1;

        if (item == null) {
            let cbnt = await app.model.dtCanBoNgoaiTruong.get({ email: user.email });
            if (cbnt) {
                user.permissions.push('staff:teacher');
                user.isStaffTeacher = 1;
            }

            if (!user.isStaff) {
                user.permissions = user.permissions.filter(item => item != 'staff:login');
            } else {
                user.isUnit = 1;
            }
        } else {
            user.isStaff = 1;
            user.permissions = user.permissions.filter(item => !['student:login', 'studentSdh:login'].includes(item));
            if (item.phai == '02') app.permissionHooks.pushUserPermission(user, 'staff:female');
            user.shcc = item.shcc;
            user.firstName = item.ten;
            user.lastName = item.ho;
            user.maDonVi = item.maDonVi;
            user.isPhongDaoTao = Number(item.maDonVi == 80);
            const dm = await app.model.dmDonVi.get({ ma: item.maDonVi }, 'maPl,ten');
            user.loaiDonVi = dm?.maPl || 0;
            user.tenDonVi = dm?.ten || '';
            user.ngach = item.ngach;
            user.staff = {
                shcc: item.shcc,
                listChucVu: [],
                maDonVi: item.maDonVi
            };
            if (item.tienSi || item.chucDanh || item.hocVi == '02' || item.hocVi == '01') app.permissionHooks.pushUserPermission(user, 'staff:doctor'); //Tiến sĩ trở lên
            app.permissionHooks.pushUserPermission(user, 'staff:login'); // Add staff permission: staff:login
            try {
                const { rows: listChucVu } = await app.model.qtChucVu.getList(app.utils.stringify({ userShcc: item.shcc, today: Date.now() }));
                user.staff.listChucVu = listChucVu || [];
                user.tenChucVu = (listChucVu.find(item => item.chucVuChinh) || { tenChucVu: '' }).tenChucVu;
                let permissionLoaiDonVi = {
                    1: 'faculty:login',
                    2: 'department:login',
                    3: 'center:login',
                    4: 'union:login'
                };
                if (user.staff.maDonVi) {
                    app.permissionHooks.pushUserPermission(user, permissionLoaiDonVi[dm?.maPl]);
                }
            }
            catch (e) { /**/
            }
        }

        //Check cán bộ đặc biệt
        if (user.isStaff && user.email != 'thanhtra01@hcmussh.edu.vn') {
            // Cán bộ quản lý
            try {
                user.staff.donViQuanLy = await initManager(user);
                // user.staff.donViQuanLy.length ? app.permissionHooks.pushUserPermission(user, 'manager:login', 'manager:read', 'manager:write', 'fwAssignRole:write', 'fwAssignRole:read') : (user.permissions = user.permissions.filter(item => !['manager:login', 'manager:read', 'fwAssignRole:read'].includes(item)));
                if (user.staff.donViQuanLy.length) {
                    if (user.staff.donViQuanLy.some(chucVu => chucVu.isManager)) app.permissionHooks.pushUserPermission(user, 'manager:login', 'manager:read', 'manager:write', 'fwAssignRole:write', 'fwAssignRole:read');
                    if (user.staff.donViQuanLy.some(chucVu => chucVu.isDeputy)) app.permissionHooks.pushUserPermission(user, 'deputy:login', 'deputy:read', 'deputy:write',);
                } else {
                    user.permissions = user.permissions.filter(item => !['manager:login', 'manager:read', 'deputy:login', 'deputy:read', 'deputy:write', 'fwAssignRole:read'].includes(item));
                }
                if (user.staff.donViQuanLy.length) {
                    user.staff.donViQuanLy.some(item => item.isManager) && app.permissionHooks.pushUserPermission(user, 'manager:login', 'manager:read', 'manager:write', 'fwAssignRole:write', 'fwAssignRole:read');
                    user.staff.donViQuanLy.some(item => item.isDeputy) && app.permissionHooks.pushUserPermission(user, 'deputy:login', 'deputy:read', 'deputy:write');
                } else {
                    user.permissions = user.permissions.filter(item => !['manager:login', 'manager:read', 'deputy:login', 'deputy:read', 'deputy:write', 'fwAssignRole:read'].includes(item));
                }
                if (user.staff.maDonVi == 68) {
                    app.permissionHooks.pushUserPermission(user, 'rectors:login');
                    if (user.staff.listChucVu.some(item => item.maChucVu == '001')) {
                        app.permissionHooks.pushUserPermission(user, 'president:login', 'tccbDanhGiaPheDuyetTruong:manage', 'tccbDanhGiaPheDuyetTruong:write');
                    } else {
                        app.permissionHooks.pushUserPermission(user, 'vice-president:login');
                    }
                } else if (user.staff.donViQuanLy.length && user.staff.maDonVi == 30) {
                    app.permissionHooks.pushUserPermission(user, 'tccbDanhGiaPheDuyetTruong:manage', 'tccbDanhGiaPheDuyetTruong:write');
                }
                await app.permissionHooks.run('staff', user, user.staff);
            }
            catch (e) { /**/
            }
        }
        if (user.email == 'thanhtra01@hcmussh.edu.vn') {
            user.staff.donViQuanLy = [{
                maDonVi: user.maDonVi, maChucVu: '009',
                tenChucVu: 'Trưởng khoa', isManager: true,
            }];
        }

        // AssignRole hooks
        try {
            if (user.isStaff) {
                const roles = await app.model.fwAssignRole.getAll({ nguoiDuocGan: user.shcc });
                if (roles != []) {
                    const checkExpire = role => !role.ngayKetThuc || new Date(role.ngayKetThuc).getTime() > new Date().getTime();
                    // Xóa các role đã hết hạn
                    const validRoles = roles.filter(checkExpire);
                    const invalidRoles = roles.filter(role => !checkExpire(role));
                    if (invalidRoles.length) {
                        await app.model.fwAssignRole.delete({
                            statement: 'id IN (:roles)',
                            parameter: { roles: invalidRoles.map(role => role.id) }
                        });
                    }
                    if (validRoles.length) {
                        await app.permissionHooks.run('assignRole', user, validRoles);
                    }
                }
            }
        }
        catch (e) { /**/
        }
        return null;
    };

    app.updateSessionUser = async (req, user, done) => {
        user = app.clone(user, { permissions: [], menu: {} });
        delete user.password;
        try {
            app.permissionHooks.pushUserPermission(user, 'user:login');
            user.deviceToken = (await app.model.fwUserDeviceToken.get({ email: user.email }) || { deviceToken: '' }).deviceToken;
            // 1. Student
            const [isStudent, result] = await Promise.all([
                handleStudentLogin(user),
                app.model.fwUser.getUserRoles(user.email)
            ]);
            user.roles = result.rows;
            for (let i = 0; i < user.roles.length; i++) {
                let role = user.roles[i];
                if (role.name == 'admin') {
                    user.permissions = app.permission.all().filter(permission => permission != 'developer:login' && permission != 'developer:switched' && !permission.endsWith(':classify') && (permission.endsWith(':login') || permission.endsWith(':read')));
                } else {
                    (role.permission ? role.permission.split(',') : []).forEach(permission => app.permissionHooks.pushUserPermission(user, permission.trim()));
                }
            }
            if (!isStudent) {
                // 2. Developers
                if (app.developers.includes(user.email)) {
                    app.permissionHooks.pushUserPermission(user, 'developer:login', ...app.permission.all());
                    user.permissions = user.permissions.filter(item => !['student:login', 'student:test', 'staff:login'].includes(item));
                }
                // 3. Graduated Student, Staff
                if (user.isStudentSdh) {
                    await handleGraduatedStudentLogin(user);
                } else {
                    await handleStaffLogin(user);
                }
            }
            user.originalEmail && app.permissionHooks.pushUserPermission(user, 'developer:switched');

            user.menu = app.permission.tree();
            Object.keys(user.menu).forEach(parentMenuIndex => {
                let flag = true;
                const menuItem = user.menu[parentMenuIndex];
                if (menuItem.parentMenu && menuItem.parentMenu.permissions) {
                    if (hasPermission(user.permissions, menuItem.parentMenu.permissions)) {
                        delete menuItem.parentMenu.permissions;
                    } else {
                        delete user.menu[parentMenuIndex];
                        flag = false;
                    }
                }

                flag && Object.keys(menuItem.menus).forEach(menuIndex => {
                    const menu = menuItem.menus[menuIndex];
                    if (hasPermission(user.permissions, menu.permissions)) {
                        delete menu.permissions;
                    } else {
                        delete menuItem.menus[menuIndex];
                        if (Object.keys(menuItem.menus).length == 0) delete user.menu[parentMenuIndex];
                    }
                });
            });

            if (user.isStaffTeacher) {
                delete user.menu['400'];
                delete user.menu['4000'];
            }

            if (req) {
                req.session.user = user;
                req.session.user.expiration = new Date().getTime();
                req.session.save();
            }
            done && done(user);
        }
        catch (error) {
            console.error('app.updateSessionUser', error);
        }
    };

    app.updateSessionUserSdh = async (req, user, done) => {
        user = app.clone(user, { permissions: [], menu: {} });
        delete user.password;
        try {
            app.permissionHooks.pushUserPermission(user, 'user:login');
            user.deviceToken = (await app.model.fwUserDeviceToken.get({ email: user.email }) || { deviceToken: '' }).deviceToken;
            if (user.isThiSinhSdh) {
                let reCheck = await handleSdhThiSinhLogin(user);
                if (!reCheck) {
                    user.permissions = user.permissions.filter(item => !['sdhTsUngVien:login', 'sdhTsThiSinh:login'].includes(item));
                }
            }
            user.menu = app.permission.tree();
            Object.keys(user.menu).forEach(parentMenuIndex => {
                let flag = true;
                const menuItem = user.menu[parentMenuIndex];
                if (menuItem.parentMenu && menuItem.parentMenu.permissions) {
                    if (hasPermission(user.permissions, menuItem.parentMenu.permissions)) {
                        delete menuItem.parentMenu.permissions;
                    } else {
                        delete user.menu[parentMenuIndex];
                        flag = false;
                    }
                }

                flag && Object.keys(menuItem.menus).forEach(menuIndex => {
                    const menu = menuItem.menus[menuIndex];
                    if (hasPermission(user.permissions, menu.permissions)) {
                        delete menu.permissions;
                    } else {
                        delete menuItem.menus[menuIndex];
                        if (Object.keys(menuItem.menus).length == 0) delete user.menu[parentMenuIndex];
                    }
                });
            });

            if (req) {
                req.session.user = user;
                req.session.user.expiration = new Date().getTime();
                req.session.save();
            }
            done && done(user);
        }
        catch (error) {
            console.error('app.updateSessionUser', error);
        }
    };

    // Permission Hook ------------------------------------------------------------------------------------------------------------------------------
    const permissionHookContainer = { student: {}, staff: {}, assignRole: {}, assignRoleStudent: {} };
    app.permissionHooks = {
        add: (type, name, hook) => {
            if (permissionHookContainer[type]) {
                permissionHookContainer[type][name] = hook;
            } else {
                console.log('Invalid hook type!');
            }
        },
        remove: (type, name) => {
            if (permissionHookContainer[type] && permissionHookContainer[type][name]) {
                delete permissionHookContainer[type][name];
            }
        },

        run: (type, user, role) => new Promise((resolve) => {
            const hookContainer = permissionHookContainer[type],
                hookKeys = hookContainer ? Object.keys(hookContainer) : [];
            const runHook = (index = 0) => {
                if (index < hookKeys.length) {
                    const hookKey = hookKeys[index];
                    hookContainer[hookKey](user, role).then(() => runHook(index + 1));
                } else {
                    resolve();
                }
            };
            runHook();
        }),

        pushUserPermission: function () {
            if (arguments.length >= 1) {
                const user = arguments[0];
                for (let i = 1; i < arguments.length; i++) {
                    const permission = arguments[i];
                    if (!user.permissions.includes(permission)) user.permissions.push(permission);
                }
            }
        }
    };

    // Assign roles Hook ------------------------------------------------------------------------------------------------------------------------------
    const assignListContainer = {}; // Ex: { quanLyDonVi: [{ id: 'dnDoanhNghiep:manage', text: 'Quản lý doanh nghiệp' }] }
    const assignRolePermissionHookContainer = {};
    // Hook: Trả về true hoặc false ==> hook trúng, trả về undefined|null => không hook
    app.assignRoleHooks = {
        addRoles: async (name, ...roles) => {
            if (typeof roles[0] == 'function') {
                let list = await roles[0]();
                roles = list;
            }
            if (assignListContainer[name]) {
                const currentId = assignListContainer[name].map(role => role.id);
                const filteredRoles = roles.filter(role => !currentId.includes(role.id));
                assignListContainer[name].push(...filteredRoles);
            } else {
                assignListContainer[name] = roles;
            }
        },
        get: (name) => {
            if (typeof name == 'string') name = [name];
            let listPermission = [];
            name.forEach(roleName => {
                if (assignListContainer[roleName]) {
                    listPermission.push(...assignListContainer[roleName].map(item => app.clone(item, { nhomRole: roleName })));
                }
            });
            return listPermission;
        },

        addHook: (name, hook) => assignRolePermissionHookContainer[name] = hook, // Hook is Promise object | parameters: req, roles
        check: async (req, roles) => {
            const hooks = Object.values(assignRolePermissionHookContainer);
            let checkFlag = null;
            for (const hook of hooks) {
                checkFlag = await hook(req, roles);
                if (typeof checkFlag == 'boolean') break; // Hook trúng => Break luôn
            }

            if (checkFlag) {
                return true;
            } else {
                throw 'Permission denied!';
            }
        }
    };

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('permissionInit', {
        ready: () => app.database.oracle.connected && app.model.fwRole,
        run: () => app.isDebug && app.permission.getTreeMenuText()
    });

    app.use((req, res, next) => {
        if (req.session && req.session.user && ['POST', 'PUT', 'DELETE'].includes(req.method) && req.url.startsWith('/api') &&
            ((req.session.user.originalEmail || req.session.user.permissions?.includes('developer:login') || req.session.user.permissions?.includes('developer:switched') || req.session.user.roles?.some(role => role.name == 'admin')) || req.session.user.maDonVi == '80' || req.url.startsWith('/api/ctsv/quyet-dinh'))) {
            try {
                app.model.fwTrackingLog.create({
                    reqMethod: req.method,
                    originalUserEmail: req.session.user.originalEmail,
                    userEmail: req.session.user.email,
                    url: req.url,
                    reqBody: app.utils.stringify(req.body),
                    reqAt: Date.now()
                });
            }
            catch (error) {
                console.error('TrackUser:', error);
            }
        }
        if (req.session && req.session.user && ['POST', 'PUT', 'DELETE'].includes(req.method) && req.url.startsWith('/api/sdh')) {
            try {
                app.model.fwTrackingLogSdh.create({
                    reqMethod: req.method,
                    originalUserEmail: req.session.user.originalEmail,
                    userEmail: req.session.user.email,
                    url: req.url,
                    reqBody: app.utils.stringify(req.body),
                    reqAt: Date.now(),
                    reqAtExplicity: Date('dd/mm/yyyy HH:MM')
                });
            }
            catch (error) {
                console.error('TrackUser:', error);
            }
        }
        next();
    });

    app.use((req, res, next) => {
        try {
            if (req.url.startsWith('/api/hcth') && (req.session?.user?.email && ['giaovien01@hcmussh.edu.vn', 'thanhtra01@hcmussh.edu.vn'].includes(req.session?.user?.email))) {
                res.status(401).send({ error: 'permission denied' });
            } else {
                next();
            }
        } catch (error) {
            console.error(error);
            next();
        }
    });
};