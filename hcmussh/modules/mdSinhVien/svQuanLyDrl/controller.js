module.exports = app => {
    const menuDanhGiaDrl = {
        parentMenu: app.parentMenu.user,
        menus: {
            1017: { title: 'Quản lý điểm rèn luyện', link: '/user/lop-truong/quan-ly-drl', icon: 'fa-calculator', backgroundColor: '#eb9834', groupIndex: 1 }
        }
    };

    app.permissionHooks.add('student', 'addRoleDanhGiaDrlLopTruong', (user) => new Promise(resolve => {
        if (user) {
            app.dkhpRedis.getBanCanSuLop({ userId: user.mssv }, (item) => {
                // if (item && item.includes('LT')) {
                if (item) {
                    app.permissionHooks.pushUserPermission(user, 'svDanhGiaDrlLt:manage', 'svDanhGiaDrlLt:write');
                    resolve();
                } else resolve();
            });
        } else resolve();
    }));

    app.permission.add(
        { name: 'svDanhGiaDrlLt:manage', menu: menuDanhGiaDrl },
        { name: 'svDanhGiaDrlLt:write' }
    );

    app.get('/user/lop-truong/quan-ly-drl', app.permission.check('svDanhGiaDrlLt:manage'), app.templates.admin);
    app.get('/user/lop-truong/danh-gia-drl/:mssv', app.permission.orCheck('svDanhGiaDrlLt:manage'), app.templates.admin);

    // Thong bao so luong sinh vien nop drl trong ngay
    app.readyHooks.add('svDrlLop:sendReminder', {
        ready: () => app.database && app.model.svDiemRenLuyen,
        run: () => {
            app.primaryWorker && app.schedule('0 17 * * *', async () => {
                let now = Date.now();
                let todaySubmits = await app.model.svDiemRenLuyen.countSvSubmit(app.utils.stringify({
                    startTime: now - 24 * 60 * 60 * 1000, endTime: now
                })).then(ref => ref.rows);
                if (todaySubmits?.length) console.info(` Start sending reminder to class president ${app.date.dateTimeFormat(new Date(now), 'HH:MM:ss dd/mm/yyyy')}`);
                for (let { maLop, namHoc, hocKy, count, listBcs } of todaySubmits) {
                    if (count == 0) continue;
                    listBcs = listBcs.split(',');
                    for (let email of listBcs) {
                        app.notification.send({ toEmail: email, icon: 'fa-bell-o', iconColor: 'warning', title: `Có ${count} sinh viên thuộc lớp ${maLop} đã nộp điểm rèn luyện`, subTitle: `Ngày ${app.date.dateTimeFormat(new Date(now), 'dd/mm/yyyy')}`, link: `/user/lop-truong/quan-ly-drl?namHoc=${namHoc}&hocKy=${hocKy}` });
                    }
                }
            });
        },
    });


    //  API ============================================================================================================================
    app.get('/api/sv/lop-truong/quan-ly-drl/page/:pageNumber/:pageSize', app.permission.orCheck('svDanhGiaDrlLt:manage'), async (req, res) => {
        try {
            let now = Date.now();
            const { mssv } = req.session.user;
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            let { condition, filter, sortTerm = 'ten_ASC' } = req.query;

            const searchTerm = typeof condition === 'string' ? condition : '';

            // const thongTinUser = await app.model.fwStudent.get({ mssv }, 'mssv, lop');
            const listLop = await app.model.svQuanLyLop.getAll({ userId: mssv }).then(list => list.map(item => item.maLop).join(','));
            if (filter === undefined) {
                filter = { listLop };
            } else filter.listLop = listLop;
            const thongTinDot = await app.model.svDotDanhGiaDrl.get({ namHoc: filter.namHoc, hocKy: filter.hocKy }, '*', 'ID DESC');
            let giaHanLop = await app.model.svDrlGiaHanLop.get({ statement: 'maLop in (:listLop) and namHoc = :namHoc and hocKy = :hocKy', parameter: { listLop, namHoc: filter.namHoc, hocKy: filter.hocKy } }, '*', 'timeEnd desc');

            let canDefault = false;

            if (thongTinDot?.timeStartSv <= now && now <= thongTinDot?.timeEndLt) canDefault = true;
            if (now <= giaHanLop?.timeEnd) canDefault = true;

            let page = await app.model.svDrlDanhGia.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }, thongTinDot, canDefault });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/lop-truong/bo-tieu-chi', app.permission.check('svDanhGiaDrlLt:manage'), async (req, res) => {
        try {
            const { namHoc, hocKy, mssv } = req.query, now = Date.now();
            let { svInfo, svDot } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (svDot) {
                ({ svDot } = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(svDot, mssv));
            }
            let { dsTieuChi, lsDiemDanhGia, listSuKien, lsMinhChung, bhytData } = await app.model.svDrlDanhGia.initDiemTable(svDot, mssv, namHoc, hocKy);
            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
            let canEdit = false, isInGiaHan = false;
            let timeEnd = svDot?.timeEndLt;

            let giaHanLop = await app.model.svDrlGiaHanLop.get({ maLop: svInfo.lop, namHoc, hocKy });

            if (svInfo && svInfo.kichHoat == 1 && svDot && svDot.active == 1) {
                // Đang trong đợt và trong giai đoạn cá nhân và lớp trưởng đánh giá
                if (tongKetInfo.svSubmit && svDot?.timeStartSv && svDot?.timeEndLt && (svDot.timeStartSv <= now && svDot.timeEndLt >= now)) {
                    canEdit = true;
                }
                // Lớp trưởng chưa đánh giá (chưa bấm lưu) và còn trong hạn gia hạn
                if (!tongKetInfo.ltSubmit && (now < Math.max(svDot?.timeGiaHanEnd ?? -Infinity, giaHanLop?.timeEnd ?? -Infinity))) {
                    canEdit = true;
                    isInGiaHan = true;
                    timeEnd = Math.max(timeEnd, svDot?.timeGiaHanEnd ?? -Infinity, giaHanLop?.timeEnd ?? -Infinity);
                }
                // Gia han lop
            }
            const items = {
                svInfo,
                listSuKien, lsMinhChung, bhytData,
                lsBoTieuChi: dsTieuChi,
                lsDiemDanhGia,
                canEdit,
                //Thời gian kết thúc chỉnh sửa là thời gian kết thúc gia hạn hoặc của thời gian đợt đang kích hoạt
                timeStart: svDot?.timeStartSv,
                timeEnd,
                isInGiaHan
            };
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/lop-truong/danh-gia-drl/:mssv', app.permission.check('svDanhGiaDrlLt:write'), async (req, res) => {
        try {
            const mssv = req.params.mssv,
                { bangDanhGiaLt } = req.body,
                // user = req.session.user,
                now = new Date(),
                { namHoc, hocKy, lsMinhChung } = bangDanhGiaLt;
            const dsTuDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*');

            let { svDot: dotDanhGiaInfo, svInfo: studentInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (dotDanhGiaInfo) {
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(dotDanhGiaInfo, mssv).then(value => value.svDot);
            }
            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};

            let giaHanLop = await app.model.svDrlGiaHanLop.get({ maLop: studentInfo.lop, namHoc, hocKy });

            let canEdit = false;
            if (studentInfo && studentInfo.kichHoat == 1) {
                if (dotDanhGiaInfo && dotDanhGiaInfo.active == 1 && dotDanhGiaInfo.timeStartSv && dotDanhGiaInfo.timeEndLt && (new Date(dotDanhGiaInfo.timeStartSv) <= now && new Date(dotDanhGiaInfo.timeEndLt) >= now)) {
                    canEdit = true;
                }
                if (!tongKetInfo.ltSubmit && dotDanhGiaInfo && dotDanhGiaInfo.timeGiaHanEnd && (now < new Date(dotDanhGiaInfo.timeGiaHanEnd))) {
                    canEdit = true;
                }
                if (now < giaHanLop?.timeEnd) {
                    canEdit = true;
                }
            }
            if (canEdit == true) {
                await Promise.all([
                    // app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy }),
                    ...bangDanhGiaLt.arrDiemDanhGia.map(item => {
                        const { diemLt, maTieuChi, lyDoLt } = item;
                        if (dsTuDanhGia.some(diem => diem.maTieuChi == maTieuChi)) {
                            return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { diemLt, lyDoLt: lyDoLt || '', ltModifier: req.session.user.email, ltModifiedTime: now.getTime() });
                        } else {
                            return app.model.svDrlDanhGia.create({
                                ...item, mssv, namHoc, hocKy, ltModifier: req.session.user.email, ltModifiedTime: now.getTime()
                            });
                        }
                    }), ...lsMinhChung.map(async (item) => {
                        // const isExist = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy, maTieuChi: item.maTieuChi });
                        try {
                            const { id, diemLt } = item;
                            return app.model.svDrlMinhChung.update({ id }, { diemLt });
                        } catch (error) {
                            console.error(error);
                            res.send({ error });
                        }
                    })
                ]);
                try { await app.model.svDiemRenLuyen.update({ mssv, namHoc, hocKy }, { ltSubmit: Math.min(bangDanhGiaLt.ltSubmit, 90) }); }
                catch { await app.model.svDiemRenLuyen.create({ mssv, namHoc, hocKy, ltSubmit: Math.min(bangDanhGiaLt.ltSubmit, 90) }); }
                console.info(` +Sinh viên ${req.session.user.email} chấm điểm lớp cho ${mssv}`);
                res.end();
            } else {
                console.error(` +Sinh viên ${req.session.user.email} chấm điểm lớp cho ${mssv}: ${JSON.stringify({ dotDanhGiaInfo, studentInfo })}`);
                res.send({ error: { message: 'Bạn không thể đánh giá điểm rèn luyện lúc này' } });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/lop-truong/danh-gia-drl/minh-chung', app.permission.check('svDanhGiaDrlLt:manage'), async (req, res) => {
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

    app.get('/api/sv/lop-truong/sao-chep-sinh-vien', app.permission.check('svDanhGiaDrlLt:manage'), async (req, res) => {
        try {
            // const lop = req.session.user.data.lop;
            let user = req.session.user;
            const listLop = await app.model.svQuanLyLop.getAll({ userId: user.mssv }).then(list => list.map(item => item.maLop).join(','));
            const { namHoc, hocKy } = req.query;
            // const dsSinhVien = await app.model.fwStudent.getAll({ lop }, 'mssv');
            if (listLop) {
                const filter = { namHoc, hocKy, listLop };
                await app.model.svDrlDanhGia.saoChepDiem('sinhVienToLopTruong', app.utils.stringify({ ...filter, userEmail: req.session.user.email })).then(result => result.rows);
                console.info(` +Sao chep diem ren luyen sinh vien: ${req.session.user.email} ${listLop} ${app.utils.stringify(req.query)}`);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};