module.exports = app => {
    let listLhdtDrl = 'CQ,CLC,SN,LK2+2';

    const menuDanhGiaDrlKhoa = {
        parentMenu: app.parentMenu.user,
        menus: {
            1027: {
                title: 'Quản lý điểm rèn luyện', parentKey: 6160,
                link: '/user/khoa/quan-ly-drl', icon: 'fa-calculator', backgroundColor: '#ac2d34', groupIndex: 0
            }
        }
    };

    app.permission.add(
        { name: 'staff:drl-manage', menu: menuDanhGiaDrlKhoa },
    );

    const ctsvDrl = 'ctsvDrl', drlPermission = 'staff:drl-manage';

    app.assignRoleHooks.addRoles(ctsvDrl, { id: drlPermission, text: 'Ctsv: Quản lý điểm rèn luyện sinh viên theo đơn vị' });

    app.assignRoleHooks.addHook(ctsvDrl, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === ctsvDrl && (userPermissions.includes('manager:login'))) {
            const assignRolesList = app.assignRoleHooks.get(ctsvDrl).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'addRoleDanhGiaDrlKhoa', (user) => new Promise(resolve => {
        if (['manager:login', 'deputy:login'].some(chucVu => (user.permissions.includes(chucVu))) && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'staff:drl-manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleManageDrl', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == ctsvDrl);
        inScopeRoles.forEach(role => {
            if (role.tenRole == drlPermission) {
                app.permissionHooks.pushUserPermission(user, drlPermission);
            }
        });
        resolve();
    }));

    app.get('/user/khoa/quan-ly-drl', app.permission.check('staff:drl-manage'), app.templates.admin);
    app.get('/user/khoa/danh-gia-drl/:mssv', app.permission.orCheck('staff:drl-manage'), app.templates.admin);

    // Helper ==================================================================================================================
    const getListDonViQuanLy = (user) => {
        let listDonViQuanLy = [...user.staff.donViQuanLy];
        (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: user.maDonVi }]);
        // Có chúc vụ trong trung tâm đào tạo quốc tế
        if (user.staff.listChucVu && user.staff.listChucVu.length) {
            let chucVuTrungTamQuocTe = user.staff.listChucVu.find(item => item.maDonVi == 42);
            chucVuTrungTamQuocTe && listDonViQuanLy.push(chucVuTrungTamQuocTe);
        }
        return listDonViQuanLy;
    };


    const getPhanCapQuanLy = async (user) => {
        const res = {};
        let listDonViQuanLy = getListDonViQuanLy(user);
        if (!user.permissions.includes('manager:login')) {
            const drlRole = await app.model.tccbDrlRole.get({ emailCanBo: user.email });
            if (!drlRole) console.error('Tccb-drl: Unassign Staff', user.email);
            const { khoaSv = '-1', heSv = '-1' } = drlRole ?? {};
            res.listFacultyQuanLy = user.maDonVi;
            res.listKhoaSvQuanLy = khoaSv;
            res.listLhdtQuanLy = heSv;
        } else {
            res.listFacultyQuanLy = listDonViQuanLy.length ? listDonViQuanLy.map(item => item.maDonVi).join(',') : user.maDonVi;
            res.listKhoaSvQuanLy = null;
            res.listLhdtQuanLy = listLhdtDrl;
        }
        return res;
    };

    // API =====================================================================================================================
    app.get('/api/tccb/danh-gia-drl/page/:pageNumber/:pageSize', app.permission.orCheck('staff:drl-manage'), async (req, res) => {
        try {
            const user = req.session.user;
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter = {}, sortTerm = 'ten_ASC' } = req.query;
            // const curSem = await app.model.dtSemester.getCurrent();
            // Lấy thông tin đọt
            let thongTinDot = await app.model.svDotDanhGiaDrl.get({ id: req.query.idDot }, '*', 'ID DESC');
            if (thongTinDot) {
                // const pkInfo = await app.model.svDrlThoiGianPhucKhao.get({ idDot: thongTinDot.id, maKhoa: user.maDonVi }, 'timePkStart');
                ({ svDot: thongTinDot } = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(thongTinDot, user.maDonVi));
                const dataGiaHan = await app.model.svDrlGiaHanKhoa.getData(thongTinDot.id);
                const now = Date.now();
                let dsGiaHan = dataGiaHan.rows.filter(item => item.maKhoa == user.maDonVi);
                let timePkStart = thongTinDot.timePkStart ? thongTinDot.timePkStart : '';
                let timeEndGiaHan = (dsGiaHan && dsGiaHan.filter(item => item.tinhTrang == 'A').length) ? dsGiaHan.filter(item => item.tinhTrang == 'A')[0].ngayHetHan : null;
                let isInGiaHan = timeEndGiaHan ? (timeEndGiaHan >= now) : false;
                let isOutDot = (thongTinDot.timeEndFaculty < now);
                let isHetHan = isInGiaHan ? false : (timePkStart ? (timePkStart < now) : (thongTinDot.timeEndFaculty < now));
                let isInPhucKhao = timePkStart ? (timePkStart < now && now < thongTinDot.timeEndFaculty) : false;
                // let canGiaHan = timePkStart <= now && now <= thongTinDot?.timeEndFaculty;
                let canGiaHan = Math.min(timePkStart, thongTinDot?.timeEndFaculty ?? Infinity) < now;
                let canDuyetGiaHan = req.session.user.permissions.includes('manager:login') && timePkStart <= now && now <= thongTinDot?.timeEndFaculty;

                let canEditPhucKhao = (thongTinDot.timeStartFaculty < now && !isHetHan) || isInPhucKhao;
                Object.assign(thongTinDot, {
                    dsGiaHan, timePkStart, timeEndGiaHan, isInGiaHan, isOutDot, isHetHan, isInPhucKhao, canEditPhucKhao,
                    canGiaHan, canDuyetGiaHan
                });
            }
            const searchTerm = typeof condition === 'string' ? condition : '';
            const phanCapQuanLy = await getPhanCapQuanLy(user);
            filter = { ...filter, ...phanCapQuanLy, idDot: req.query.idDot };
            let page = await app.model.svDrlDanhGia.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }, thongTinDot, phanCapQuanLy });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/phuc-khao/page/:pageNumber/:pageSize', app.permission.orCheck('staff:drl-manage'), async (req, res) => {
        try {
            let listDonViQuanLy = getListDonViQuanLy(req.session.user);
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            if (filter === undefined) {
                filter = { listFaculty: listDonViQuanLy.length ? listDonViQuanLy.map(item => item.maDonVi).join(', ') : req.session.user.maDonVi };
            } else {
                filter.listFaculty = listDonViQuanLy.length ? listDonViQuanLy.map(item => item.maDonVi).join(', ') : req.session.user.maDonVi;
            }
            // Lấy thông tin quản lý drl
            if (!req.session.user.permissions.includes('manager:login')) {
                const { khoaSv, heSv } = await app.model.tccbDrlRole.get({ idCanBo: req.session.user.shcc });
                filter.listKhoaSinhVien = khoaSv;
                filter.listLoaiHinhDaoTao = heSv;
            }
            let page = await app.model.svDrlPhucKhao.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/tieu-chi', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const user = req.session.user, now = Date.now();
            const { namHoc, hocKy, mssv } = req.query;
            let { svDot, svInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            // let svInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, namHoc, hocKy }, '*'),
            //     svDot = await app.model.svDotDanhGiaDrl.get({ id: svInfo.idDot }, '*', 'ID DESC'),

            if (svDot) {
                svDot = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(svDot, user.maDonVi).then(value => value.svDot);
                svDot = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(svDot, mssv).then(value => value.svDot);
                // const { rows: [giaHanInfo] } = await app.model.svDrlDssvGiaHan.getGiaHanInfo(mssv, svDot.id);
                // svDot.timeGiaHanEnd = giaHanInfo ? giaHanInfo.timeEnd : null;
            }

            // let dsTieuChi = await app.model.svBoTieuChi.getAll({ kichHoat: 1, idBo: svDot ? svDot.maBoTc : null }, '*', 'STT ASC');
            // const lsDiemDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*', 'MA ASC');
            // Build Map tiêu chí theo mã
            // dsTieuChi = await app.model.svBoTieuChi.initDiemTable(dsTieuChi, lsDiemDanhGia);
            let { dsTieuChi, lsDiemDanhGia, listSuKien, lsMinhChung, bhytData } = await app.model.svDrlDanhGia.initDiemTable(svDot, mssv, namHoc, hocKy);

            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
            tongKetInfo.kyLuat = await app.model.svQtKyLuat.getDrlMapKyLuat(mssv, namHoc, hocKy);
            if (tongKetInfo.tkSubmit) { //Đã tổng kết
                tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.tkSubmit);
            }

            let canEdit = false;
            if ((svInfo && svInfo.kichHoat == 1) && (svDot && svDot.active == 1 && svDot.timeStartFaculty && svDot.timeEndFaculty)) {
                let timeEnd = Math.min(svDot.timePkStart ?? Infinity, svDot?.timeEndFaculty ?? Infinity);
                if (now > svDot.timeStartFaculty && now < timeEnd) {
                    canEdit = true;
                }
                if (now <= svDot?.timeGiaHanEnd) {
                    canEdit = true;
                }
            }

            let diemTrungBinh;
            if (tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0))
                diemTrungBinh = tongKetInfo.diemTb;
            else
                ({ diemTrungBinh } = (await app.model.dtDiemTrungBinh.get({ mssv, namHoc, hocKy })) || {});
            const items = {
                svInfo,
                listSuKien, lsMinhChung, bhytData,
                lsBoTieuChi: dsTieuChi,
                lsDiemDanhGia,
                tongKetInfo,
                diemTrungBinh,
                timeStart: svDot?.timeStartFaculty,
                timeEnd: svDot?.timeEndFaculty,
                canEdit
            };
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/:mssv', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv,
                user = req.session.user,
                { bangDanhGiaKhoa } = req.body,
                now = new Date(),
                { namHoc, hocKy, lsMinhChung } = bangDanhGiaKhoa;
            const dsTuDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*');
            // const dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.get({ namHoc, hocKy }, '*'),
            //     studentInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, idDot: dotDanhGiaInfo.id, kichHoat: 1 }, '*', 'id DESC');
            let { svDot: dotDanhGiaInfo, svInfo: studentInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (dotDanhGiaInfo) {
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(dotDanhGiaInfo, user.maDonVi).then(value => value.svDot);
                // const pkInfo = await app.model.svDrlThoiGianPhucKhao.get({ idDot: dotDanhGiaInfo.id, maKhoa: user.maDonVi }, 'timePkStart', 'ID DESC');
                // dotDanhGiaInfo.timePkStart = pkInfo ? pkInfo.timePkStart : null;
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(dotDanhGiaInfo, mssv).then(value => value.svDot);
                // const { rows: [giaHanInfo] } = await app.model.svDrlDssvGiaHan.getGiaHanInfo(mssv, dotDanhGiaInfo.id);
                // dotDanhGiaInfo.timeGiaHanEnd = giaHanInfo ? giaHanInfo.timeEnd : null;
            }
            let canEdit = false;
            if ((studentInfo && studentInfo.kichHoat == 1) && (dotDanhGiaInfo && dotDanhGiaInfo.timeStartFaculty && dotDanhGiaInfo.timeEndFaculty)) {
                if (dotDanhGiaInfo.timePkStart) {
                    if (now > new Date(dotDanhGiaInfo.timeStartFaculty) && now < new Date(dotDanhGiaInfo.timePkStart)) {
                        canEdit = true;
                    }
                } else {
                    if (now > new Date(dotDanhGiaInfo.timeStartFaculty) && now < new Date(dotDanhGiaInfo.timeEndFaculty)) {
                        canEdit = true;
                    }
                }
                if (dotDanhGiaInfo.timeGiaHanEnd) {
                    if (now <= new Date(dotDanhGiaInfo.timeGiaHanEnd)) {
                        canEdit = true;
                    }
                }
            }
            if (canEdit == true) {
                await Promise.all([
                    // app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy }),
                    ...bangDanhGiaKhoa?.arrDiemDanhGia.map(async item => {
                        const { diemF, maTieuChi, lyDoF } = item;
                        if (dsTuDanhGia.some(diem => diem.maTieuChi == maTieuChi)) {
                            return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { diemF, lyDoF: lyDoF || '', fModifier: req.session.user.email, fModifiedTime: now.getTime() });
                        } else {
                            return app.model.svDrlDanhGia.create({
                                ...item, mssv, namHoc, hocKy, fModifier: req.session.user.email, fModifiedTime: now.getTime()
                            });
                        }
                    }),
                    ...lsMinhChung.map(async (item) => {
                        // const isExist = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy, maTieuChi: item.maTieuChi });
                        try {
                            const { id, diemF } = item;
                            return app.model.svDrlMinhChung.update({ id }, { diemF });
                        } catch (error) {
                            console.error(error);
                            res.send({ error });
                        }
                    })
                ]);
                await app.model.svDiemRenLuyen.createOrUpdate({ mssv, namHoc, hocKy }, { fSubmit: bangDanhGiaKhoa?.tongDiemKhoa, timeModified: now.getTime(), staffHandle: user.email });
                console.log(` + Cán bộ ${user.email} đánh giá điểm rèn luyện sinh viên ${mssv} vào lúc ${app.date.dateTimeFormat(now, 'HH:MM:ss dd/mm/yyyy')}`);
                res.end();
            } else {
                const { id, timePkStart, timeStartFaculty, timeEndFaculty } = dotDanhGiaInfo ?? {};
                console.error('Bạn không thể đánh giá điểm rèn luyện lúc này', { userEmail: req.email, maDot: id, timePkStart, timeStartFaculty, timeEndFaculty, mssv: studentInfo?.mssv, kichHoat: studentInfo?.kichHoat });
                res.send({ error: { message: 'Bạn không thể đánh giá điểm rèn luyện lúc này' } });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/phuc-khao/:mssv', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv,
                { bangDanhGiaKhoa } = req.body,
                now = new Date(),
                { namHoc, hocKy, lsMinhChung } = bangDanhGiaKhoa;
            const user = req.session.user;
            // Lấy các đơn vị cán bộ đang quản lý, nếu không có lấy đơn vị cán bộ thuộc về
            let listDonViQuanLy = getListDonViQuanLy(req.session.user);
            const dsTuDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*');
            // const dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.get({ namHoc, hocKy }, '*'),
            //     studentInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, idDot: dotDanhGiaInfo.id, kichHoat: 1 }, '*', 'id DESC');
            let { svDot: dotDanhGiaInfo, svInfo: studentInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (dotDanhGiaInfo) {
                // const pkInfo = await app.model.svDrlThoiGianPhucKhao.get({
                //     statement: 'idDot = :idDot AND maKhoa in (:maKhoa)',
                //     parameter: { idDot: dotDanhGiaInfo.id, maKhoa: listDonViQuanLy.map(item => item.maDonVi) }
                // }, 'timePkStart', 'ID DESC');
                // dotDanhGiaInfo.timePkStart = dotDanhGiaInfo ? dotDanhGiaInfo.timePkStart : null;
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(dotDanhGiaInfo, listDonViQuanLy.map(item => item.maDonVi).toString()).then(value => value.svDot);
                const giaHanInfo = await app.model.svDrlGiaHanKhoa.get({ idDot: dotDanhGiaInfo.id, maKhoa: user.maDonVi }, 'timeEnd', 'ID DESC');
                dotDanhGiaInfo.timeGiaHanEnd = giaHanInfo ? giaHanInfo.timeEnd : null;
            }
            if (studentInfo && dotDanhGiaInfo && dotDanhGiaInfo.timePkStart && dotDanhGiaInfo.timeEndFaculty && (new Date(dotDanhGiaInfo.timeEndFaculty) >= now && new Date(dotDanhGiaInfo.timePkStart) <= now)) {
                await Promise.all([
                    // app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy }),
                    ...bangDanhGiaKhoa.arrDiemDanhGia.map(async item => {
                        let { diemF, maTieuChi, lyDoF, minhChung } = item;
                        // Ghi nhận minh chứng đã phúc khảo
                        minhChung = typeof minhChung == 'string' ? minhChung.replaceAll('"isPhucKhao":1', '"isPhucKhao":0') : null;
                        if (dsTuDanhGia.some(diem => diem.maTieuChi == maTieuChi)) {
                            if (bangDanhGiaKhoa.lsPhucKhao.some(pk => pk.maTieuChi == maTieuChi))
                                return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { diemF, lyDoF, minhChung, fModifier: req.session.user.email, fModifiedTime: now.getTime() });
                            else
                                return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { diemF, minhChung, fModifier: req.session.user.email, fModifiedTime: now.getTime() });
                        } else {
                            return app.model.svDrlDanhGia.create({
                                ...item, mssv, namHoc, hocKy, minhChung, fModifier: req.session.user.email, fModifiedTime: now.getTime()
                            });
                        }
                    }), ...bangDanhGiaKhoa.lsPhucKhao.map(item => {
                        const { id, dataSau } = item;
                        return app.model.svDrlPhucKhao.update({ id }, { dataSau, staffHandle: user.email, timeHandle: now.getTime(), tinhTrang: 'D' });
                    }), ...lsMinhChung.map(async (item) => {
                        // const isExist = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy, maTieuChi: item.maTieuChi });
                        try {
                            const { id, diemF } = item;
                            return app.model.svDrlMinhChung.update({ id }, { diemF });
                        } catch (error) {
                            console.error(error);
                            res.send({ error });
                        }
                    })
                ]);
                console.log(` + Cán bộ ${user.email} duyệt phúc khảo vào lúc ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}: ${mssv}`);
                res.end();
            } else {
                console.error(` + Cán bộ ${user.email} không thể duyệt phúc khảo ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}: ${app.utils.stringify(dotDanhGiaInfo)}`);
                res.send({ error: { message: 'Bạn không thể đánh giá điểm rèn luyện lúc này' } });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/minh-chung', app.permission.orCheck('staff:drl-manage', 'staff:form-teacher'), async (req, res) => {
        try {
            let user = req.query.mssv,
                filePath = req.query.filePath,
                path = app.path.join(app.assetPath, '/svMinhChungDrl', user, filePath);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/sv-phuc-khao', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { namHoc, hocKy, mssv } = req.query;
            let items = await app.model.svDrlPhucKhao.getAll({ mssv, namHoc, hocKy }, '*');
            const svBoTieuChi = await app.model.svBoTieuChi.getAll({
                statement: 'ma in (:listMa)',
                parameter: { listMa: items.length ? items.map(item => item.maTieuChi) : ['-1'] }
            }, '*');
            if (items.length) {
                items = items.map(item => {
                    const tieuChiMap = svBoTieuChi.find(tieuChi => tieuChi.ma == item.maTieuChi);
                    return {
                        ...item,
                        diemMax: tieuChiMap.diemMax,
                        loaiTc: tieuChiMap.loaiTc,
                        tenTieuChi: tieuChiMap.ten,
                        maTieuChi: tieuChiMap.ma
                    };
                });
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/sao-chep/diem-lop', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            let _filter = getPhanCapQuanLy(req.session.user);
            let { idDot, listMssv, filter } = req.body;
            if (listMssv?.length) {
                let listMssvChunk = listMssv.chunk(300);
                await Promise.all(listMssvChunk.map(async (listMssv) => {
                    _filter = {
                        ..._filter, ...(filter ?? {}), idDot,
                        userEmail: req.session.user.email,
                        listMssv: listMssv.toString()
                    };
                    await app.model.svDrlDanhGia.saoChepDiem('lopTruongToKhoa', app.utils.stringify(_filter));
                }));
            } else {
                let _filter = {
                    ..._filter, ...(filter ?? {}), idDot,
                    userEmail: req.session.user.email,
                };
                await app.model.svDrlDanhGia.saoChepDiem('lopTruongToKhoa', app.utils.stringify(_filter));
            }
            console.log(`Sao chep diem ren luyen lop: ${req.session.user.email} ${app.utils.stringify(_filter)}`);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/edit/diem-tong-ket', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { listSinhVienUpdate, namHoc, hocKy } = req.body;
            let dsDanhGia = await app.model.svDiemRenLuyen.getAll({
                statement: 'namHoc = :namHoc AND hocKy = :hocKy AND mssv IN (:listSinhVienUpdate)',
                parameter: { namHoc, hocKy, listSinhVienUpdate: listSinhVienUpdate?.length ? listSinhVienUpdate.map(item => item.mssv) : ['-1'] },
            }, 'mssv, namHoc, hocKy');
            const user = req.session.user,
                now = new Date();
            listSinhVienUpdate?.length && await Promise.all(
                // app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy }),
                listSinhVienUpdate.map(async item => {
                    const { diemSv, diemLt, diemEditF, lyDoTongKetF } = item;
                    if (dsDanhGia.some(sv => sv.mssv == item.mssv)) {
                        return app.model.svDiemRenLuyen.update({ mssv: item.mssv, namHoc, hocKy }, { fSubmit: diemEditF, lyDoF: lyDoTongKetF, timeModified: now.getTime() });
                    } else {
                        return app.model.svDiemRenLuyen.create({
                            mssv: item.mssv,
                            namHoc, hocKy,
                            svSubmit: diemSv,
                            ltSubmit: diemLt,
                            fSubmit: diemEditF,
                            staffHandle: user.email,
                            timeModified: now.getTime(),
                            lyDoF: lyDoTongKetF
                        });
                    }
                }));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/thoi-gian-phuc-khao/khoa', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { changes } = req.body;
            const user = req.session.user;
            let listDonViQuanLy = req.session.user.staff.donViQuanLy.filter(donVi => donVi.maChucVu == '009');
            (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: req.session.user.maDonVi }]);
            const items = await app.model.svDrlThoiGianPhucKhao.getAll({
                statement: 'idDot = :idDot and maKhoa in (:maKhoa)',
                parameter: { idDot: changes.idDot, maKhoa: listDonViQuanLy.map(item => item.maDonVi) }
            });
            listDonViQuanLy.map(async (donVi) => {
                if (items.some(item => item.maKhoa == donVi.maDonVi)) {
                    await app.model.svDrlThoiGianPhucKhao.update({ idDot: changes.idDot, maKhoa: user.maDonVi }, { timePkStart: changes.timePkStart });
                } else {
                    await app.model.svDrlThoiGianPhucKhao.create({ ...changes, maKhoa: user.maDonVi, staffHandle: user.email });
                }
            });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/tccb/danh-gia-drl/download-excel', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            const phanCap = await getPhanCapQuanLy(req.session.user);
            const _filter = app.clone({}, app.utils.parse(filter), phanCap);
            let data = await app.model.svDrlDanhGia.downloadExcel(searchTerm, app.utils.stringify(_filter));
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SV_DRL');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ', key: 'hoSinhVien', width: 20 },
                { header: 'TÊN', key: 'tenSinhVien', width: 20 },
                { header: 'KHOA', key: 'khoa', width: 15, wrapText: false },
                { header: 'ĐIỂM SV', key: 'diemSv', width: 15 },
                { header: 'ĐIỂM LỚP', key: 'diemLt', width: 15 },
                { header: 'ĐIỂM KHOA', key: 'diemF', width: 15 },
                { header: 'ĐIỂM TỔNG KẾT', key: 'diemTk', width: 15 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };

            data.rows.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    mssv: item.mssv,
                    hoSinhVien: item.ho,
                    tenSinhVien: item.ten,
                    khoa: item.tenKhoa,
                    diemSv: item.diemSv,
                    diemLt: item.diemLt,
                    diemF: item.diemF,
                    diemTk: item.diemTk
                }, 'i');
            });
            const fileName = `DS_SV_DRL_${JSON.parse(filter).namHoc}_HK${JSON.parse(filter).hocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};