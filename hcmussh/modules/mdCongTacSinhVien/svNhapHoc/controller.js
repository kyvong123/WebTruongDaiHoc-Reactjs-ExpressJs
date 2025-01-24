module.exports = app => {
    const conHoc = 1, choNhapHoc = 11;
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6103: { title: 'Nhập học', link: '/user/ctsv/nhap-hoc', icon: 'fa-bookmark', backgroundColor: '#fcba03', groupIndex: 0 },
        },
    };


    const mySecretCode = '$qL9F5rM5ab70zpF',
        mySecretPassword = 'ctsv#2022';

    app.permission.add({ name: 'ctsvNhapHoc:write', menu });

    // Temp
    app.permissionHooks.add('staff', 'addRoleCtsvNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:write');
            resolve();
        } else resolve();
    }));

    const socketIoEmit = (email, data, error) => !error && app.io.to(email).emit('scan-nhap-hoc', data);

    app.get('/user/ctsv/nhap-hoc', app.permission.check('ctsvNhapHoc:write'), app.templates.admin);

    app.post('/api/ctsv/nhap-hoc/login', async (req, res) => {
        try {
            const data = req.body.data;
            const { email, password, secretCode } = data;

            if (!email || !password || !secretCode || secretCode != mySecretCode || password != mySecretPassword) throw 'Permission denied!';
            let user = await app.model.fwUser.get({ email });
            if (!user) user = await app.model.fwUser.create({ email, active: 1 });
            if (!user) throw 'System error!';

            app.updateSessionUser(null, user, sessionUser => {
                if ((sessionUser.permissions || []).contains(['student:write', 'ctsvNhapHoc:write'])) {
                    req.session.user = sessionUser;
                    req.session.user.expiration = new Date().getTime();
                    req.session.save();
                    res.send({ user: sessionUser });
                } else res.send({ error: 'Permission denied!' });
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/get-data', app.permission.check('ctsvNhapHoc:write'), async (req, res) => {
        try {
            const secretCode = req.body.secretCode;
            if (secretCode == mySecretCode) {
                const mssv = req.body.mssv.trim();
                const config = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy'),
                    timeModified = Date.now();
                let dataNhapHoc = await app.model.svNhapHoc.getData(mssv, app.utils.stringify(config, ''));
                dataNhapHoc = dataNhapHoc.rows ? dataNhapHoc.rows[0] : {};
                let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
                if (!cauHinhNhapHoc) res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
                else {
                    const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc,
                        { loaiHinhDaoTao, namTuyenSinh } = dataNhapHoc;
                    if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) res.send({ error: 'Không thuộc thời gian thao tác' });
                    else if (!heDaoTao.split(',').includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                        dataNhapHoc.tinhTrang = 'Không thuộc đối tượng nhập học!';
                        dataNhapHoc.ngayNhapHoc = null;
                        dataNhapHoc.invalid = true;
                        await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                        res.send({ dataNhapHoc });
                    } else {
                        // const isUpToDate = (
                        //     !!dataNhapHoc.tenMe && !!dataNhapHoc.ngaySinhMe && !!dataNhapHoc.thuongTruMaXaMe &&
                        //     !!dataNhapHoc.tenCha && !!dataNhapHoc.ngaySinhCha && !!dataNhapHoc.thuongTruMaXaCha);
                        // if (dataNhapHoc.congNo && parseInt(dataNhapHoc.congNo) <= 0) dataNhapHoc.congNo = 0;
                        if (dataNhapHoc.ngayNhapHoc == -1) {
                            dataNhapHoc.ngayNhapHoc = null;
                            dataNhapHoc.tinhTrang = 'Chờ xác nhận nhập học' + (dataNhapHoc.isUpToDate == 1 ? ' (Đã cập nhật thông tin trực tuyến)' : ' (Chưa cập nhật thông tin trực tuyến)');
                        } else {
                            if (dataNhapHoc.isUpToDate == 1) dataNhapHoc.tinhTrang = 'Đã cập nhật thông tin trực tuyến';
                            else dataNhapHoc.tinhTrang = 'Chưa cập nhật thông tin trực tuyến'.toUpperCase();
                        }
                        await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                        res.send({ dataNhapHoc });
                    }
                }
            } else {
                res.send({ error: 'Permission denied!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/set-data', app.permission.check('ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let data = req.body.data;
            let { mssv, thaoTac, secretCode } = data, timeModified = new Date().getTime();
            if (secretCode != mySecretCode) {
                return res.send({ error: 'Permission denied!' });
            }

            const student = await app.model.fwStudent.get({ mssv }, 'ho,ten,mssv,emailTruong,loaiHinhDaoTao,namTuyenSinh,tinhTrang');
            if (!student) {
                res.send({ error: 'Không tìm thấy sinh viên' });
            } else {
                let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
                if (!cauHinhNhapHoc) {
                    res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
                } else {
                    const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc, { loaiHinhDaoTao, namTuyenSinh } = student;
                    if (!heDaoTao.includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                        res.send({ error: 'Không thuộc đối tượng nhập học!' });
                    } else if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) {
                        res.send({ error: 'Không thuộc thời gian thao tác' });
                    } else {
                        if (thaoTac == 'A' || thaoTac == 'D') {
                            await app.model.fwStudent.update({ mssv }, { ngayNhapHoc: thaoTac == 'A' ? timeModified : -1 });
                            if (thaoTac == 'A') {
                                await app.model.svNhapHoc.create({ mssv, thaoTac, ghiChu: '', email: user.email, timeModified });
                                // let data = await app.model.svSetting.getEmail();
                                // if (data.index == 0) {
                                //     return res.send({ error: 'Không có email no-reply-ctsv nào đủ lượt gửi nữa!' });
                                // }

                                // let { ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml } = await app.model.svSetting.getValue('ctsvEmailXacNhanNhapHocTitle', 'ctsvEmailXacNhanNhapHocEditorText', 'ctsvEmailXacNhanNhapHocEditorHtml');
                                // [ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml] = [ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml].map(item => item?.replaceAll('{ten}', `${student.ho} ${student.ten}`).replaceAll('{mssv}', student.mssv));

                                app.notification.send({
                                    toEmail: student.emailTruong,
                                    title: 'Xác nhận nhập học thành công',
                                    subTitle: `${app.date.viTimeFormat(new Date())} ${app.date.viDateFormat(new Date())}`,
                                    icon: 'fa-check', iconColor: 'primary'
                                });

                                // try {
                                //     await app.email.normalSendEmail(data.email, data.password, student.emailTruong, '', ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml, '');
                                //     app.model.svSetting.updateLimit(data.index);

                                // } catch (_) {
                                //     console.log(`Sent mail to ${student.emailTruong} failed`);
                                // }
                                res.end();
                            } else {
                                res.end();
                            }
                        } else {
                            res.end();
                        }
                    }
                }
            }
        } catch (error) {
            res.send({ error: 'Thao tác nhập học gặp lỗi' });
        }
    });

    app.readyHooks.add('initLimitCtsvMail', {
        ready: () => app.database.redis && app.model && app.model.svSetting,
        run: () => {
            app.primaryWorker && app.schedule('10 0 * * *', () => {
                app.model.svSetting.initLimitCtsvMail();
            });
        },
    });

    app.get('/api/ctsv/nhap-hoc/hot-init-email', app.permission.check('developer:login'), (req, res) => {
        app.model.svSetting.initLimitCtsvMail();
        res.end();
    });

    app.get('/api/ctsv/nhap-hoc/get-ctsv-data', app.permission.check('developer:login'), async (req, res) => {
        let data = await app.model.svSetting.getEmail();
        res.send({ data });
    });

    app.post('/api/ctsv/nhap-hoc/check-svnh-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const mssv = req.body.mssv.trim();
            const config = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy'),
                timeModified = Date.now();

            let [dataNhapHoc] = await Promise.all(
                [
                    app.model.svNhapHoc.getData(mssv, app.utils.stringify(config, '')),
                    // app.model.tcHocPhi.getAll({ mssv }, 'congNo')
                ]
            );
            dataNhapHoc = dataNhapHoc.rows?.length ? dataNhapHoc.rows[0] : { loaiHinhDaoTao: '', namTuyenSinh: '', maNganh: '', tinhTrang: 11 };
            let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            if (!cauHinhNhapHoc) res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
            else {
                const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc,
                    { loaiHinhDaoTao, namTuyenSinh, tinhTrang } = dataNhapHoc || { loaiHinhDaoTao: '', namTuyenSinh: '', tinhTrang: 11 };
                dataNhapHoc.congNo = await app.model.svNhapHoc.daThanhToanHocPhi(mssv);
                if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) res.send({ error: 'Không thuộc thời gian thao tác' });
                else if (!heDaoTao.split(',').includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                    dataNhapHoc.tinhTrang = 'Không thuộc đối tượng nhập học!';
                    dataNhapHoc.ngayNhapHoc = null;
                    dataNhapHoc.invalid = true;
                    socketIoEmit(req.session.user.email, { dataNhapHoc });
                    res.send({ dataNhapHoc });
                } else {
                    // const isUpToDate = (
                    //     !!dataNhapHoc.tenMe && !!dataNhapHoc.ngaySinhMe && !!dataNhapHoc.thuongTruMaXaMe &&
                    //     !!dataNhapHoc.tenCha && !!dataNhapHoc.ngaySinhCha && !!dataNhapHoc.thuongTruMaXaCha);
                    // if (dataNhapHoc.congNo != null && parseInt(dataNhapHoc.congNo) < 0) dataNhapHoc.congNo = 0;
                    if (dataNhapHoc.ngayNhapHoc == -1) {
                        dataNhapHoc.ngayNhapHoc = null;
                        dataNhapHoc.tinhTrang = 'Chờ xác nhận nhập học' + (dataNhapHoc.isUpToDate == 1 ? ' (Đã cập nhật thông tin trực tuyến)' : ' (Chưa cập nhật thông tin trực tuyến)');
                    } else {
                        if (dataNhapHoc.isUpToDate == 1) dataNhapHoc.tinhTrang = 'Đã cập nhật thông tin trực tuyến';
                        else dataNhapHoc.tinhTrang = ('Chưa cập nhật thông tin trực tuyến').toUpperCase();
                    }
                    if (dataNhapHoc.lopSinhVien == null) {
                        let { loaiHinhDaoTao, namTuyenSinh, maNganh } = dataNhapHoc;
                        let dataLop = await app.model.dtLop.get({ maNganh, khoaSinhVien: namTuyenSinh, heDaoTao: loaiHinhDaoTao, maChuyenNganh: null, kichHoat: 1 }, '*', 'maLop DESC');
                        if (dataLop) {
                            dataNhapHoc.lopSinhVien = dataLop.maLop;
                            dataNhapHoc.maCtdt = dataLop.maCtdt;
                        }
                        else dataNhapHoc.lopSinhVien = null;
                    }
                    dataNhapHoc.tinhTrangSinhVien = tinhTrang;
                    let khoaDtSv = await app.model.dtKhoaDaoTao.get({ he: dataNhapHoc.loaiHinhDaoTao, namTuyenSinh: dataNhapHoc.namTuyenSinh, bac: 'DH' }, '*', 'maKhoa DESC');
                    dataNhapHoc.maKhoa = khoaDtSv ? khoaDtSv.maKhoa : null;

                    //Check BHYT
                    const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC');
                    if (currentDotDangKy && currentDotDangKy.heDaoTao.split(',').includes(dataNhapHoc.loaiHinhDaoTao)) {
                        const lichSuDangKy = await app.model.svBaoHiemYTe.get({ mssv, namDangKy: currentDotDangKy ? currentDotDangKy.namDangKy : new Date().getFullYear() }, '*');
                        dataNhapHoc.isCompleteBhyt = 0;
                        if (lichSuDangKy) {
                            dataNhapHoc.isCompleteBhyt = 1;
                            const { dienDong, maBhxhHienTai, benhVienDangKy, matTruocThe, giaHan, id } = lichSuDangKy;
                            switch (parseInt(dienDong)) {
                                case 0: {
                                    if (maBhxhHienTai && matTruocThe && app.fs.existsSync(app.path.join(app.assetPath, 'bhyt', 'front', matTruocThe)))
                                        dataNhapHoc.isCompleteBhytInfo = 1;
                                    break;
                                }
                                case 12:
                                case 15: {
                                    if (giaHan == 1) {
                                        if (maBhxhHienTai && benhVienDangKy)
                                            dataNhapHoc.isCompleteBhytInfo = 1;
                                    } else {
                                        const dataChuHo = await app.model.svBhytPhuLucChuHo.get({ idDangKy: id }, '*');
                                        if (dataChuHo && benhVienDangKy)
                                            dataNhapHoc.isCompleteBhytInfo = 1;
                                    }
                                }
                            }
                        }
                    }

                    await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                    socketIoEmit(req.session.user.email, { dataNhapHoc });
                    res.send({ dataNhapHoc });
                }
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/nhap-hoc/get-lich-su', app.permission.check('ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let currentDot = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            const filter = { fromNhapHoc: currentDot.thoiGianBatDau, toNhapHoc: currentDot.thoiGianKetThuc };
            const { listthaotac: listThaoTac, rows: data } = await app.model.svNhapHoc.getDashboard(app.utils.stringify(filter));
            const { rows: dataFee } = await app.model.tcHocPhi.CheckPhiNhapHoc();
            let dsSinhVien = [];
            if (listThaoTac.length && data.length) {
                const mssvFilter = listThaoTac.filter(item => item.email == user.email);
                dsSinhVien = data.filter(item => mssvFilter.some(sv => sv.mssv == item.mssv));
            }
            res.send({ dsSinhVien, dataFee, listThaoTac });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/set-svnh-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let data = req.body.data;
            let { mssv, thaoTac, lopSinhVien = '', maCtdt = '', maKhoa = '' } = data, timeModified = new Date().getTime();
            const student = await app.model.fwStudent.get({ mssv }, 'ho,ten,mssv,emailTruong,loaiHinhDaoTao,namTuyenSinh');
            if (!student) {
                res.send({ error: 'Không tìm thấy sinh viên' });
            } else {
                let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
                if (!cauHinhNhapHoc) {
                    res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
                } else {
                    const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc, { loaiHinhDaoTao, namTuyenSinh } = student;
                    if (!heDaoTao.split(',').includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                        res.send({ error: 'Không thuộc đối tượng nhập học!' });
                    } else if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) {
                        res.send({ error: 'Không thuộc thời gian thao tác' });
                    } else {
                        if (thaoTac == 'A' || thaoTac == 'D') {
                            await app.model.svNhapHoc.create({ mssv, thaoTac, ghiChu: '', email: user.email, timeModified });
                            await app.model.fwStudent.update({ mssv }, { ...(thaoTac == 'A' ? { ngayNhapHoc: timeModified, tinhTrang: conHoc } : { ngayNhapHoc: - 1, tinhTrang: choNhapHoc }), canEdit: 0, lop: lopSinhVien, maKhoa, maCtdt });
                            if (thaoTac == 'A') {
                                // let data = await app.model.svSetting.getEmail();
                                // if (data.index == 0) {
                                //     return res.send({ error: 'Không có email no-reply-ctsv nào đủ lượt gửi nữa!' });
                                // }

                                // let { ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml } = await app.model.svSetting.getValue('ctsvEmailXacNhanNhapHocTitle', 'ctsvEmailXacNhanNhapHocEditorText', 'ctsvEmailXacNhanNhapHocEditorHtml');
                                // [ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml] = [ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml].map(item => item?.replaceAll('{ten}', `${student.ho} ${student.ten}`).replaceAll('{mssv}', student.mssv));

                                app.notification.send({
                                    toEmail: student.emailTruong,
                                    title: 'Xác nhận nhập học thành công',
                                    subTitle: `${app.date.viTimeFormat(new Date())} ${app.date.viDateFormat(new Date())}`,
                                    icon: 'fa-check', iconColor: 'primary'
                                });
                                // try {
                                //     student.emailTruong && await app.email.normalSendEmail(data.email, data.password, student.emailTruong, '', ctsvEmailXacNhanNhapHocTitle, ctsvEmailXacNhanNhapHocEditorText, ctsvEmailXacNhanNhapHocEditorHtml, '');
                                //     app.model.svSetting.updateLimit(data.index);
                                // } catch (_) {
                                //     console.error(`Sent mail to ${student.emailTruong} failed`);
                                // }

                                res.end();
                            } else {
                                res.end();
                            }
                        } else {
                            res.end();
                        }
                    }
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/cau-hinh-nhap-hoc', app.permission.check('ctsvNhapHoc:adminNhapHoc'), async (req, res) => {
        try {
            let data = req.body.data;
            let warn = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            if (!!warn && !parseInt(data.ghiDe)) res.send({ warn });
            else {
                let item = await app.model.svCauHinhNhapHoc.create(app.clone(data, {
                    userModified: req.session.user.email,
                    timeModified: Date.now()
                }));
                if (item) res.send({ item });
                else res.send({ error: 'Database error!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/cau-hinh-nhap-hoc', app.permission.check('ctsvNhapHoc:write'), async (req, res) => {
        try {
            let item = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    //Phân quyền cho đơn vị ------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('ctsvNhapHoc', { id: 'ctsvNhapHoc:adminNhapHoc', text: 'CTSV - Nhập học: Chuyên viên quản lý cấu hình' }, { id: 'ctsvNhapHoc:write', text: 'CTSV - Nhập học: Chuyên viên xử lý nhập học' });


    app.assignRoleHooks.addHook('ctsvNhapHoc', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'ctsvNhapHoc' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('ctsvNhapHoc').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleAdminNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:adminNhapHoc', 'ctsvNhapHoc:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleAdminNhapHoc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'ctsvNhapHoc');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'ctsvNhapHoc:adminNhapHoc') {
                app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:adminNhapHoc');
            } else if (role.tenRole == 'ctsvNhapHoc:write') {
                app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:write');
            }
        });
        resolve();
    }));
};