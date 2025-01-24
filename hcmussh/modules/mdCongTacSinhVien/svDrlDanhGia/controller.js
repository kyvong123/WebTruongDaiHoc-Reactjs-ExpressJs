module.exports = app => {
    const menuDanhGiaDrl = {
        parentMenu: app.parentMenu.students,
        menus: {
            6121: { title: 'Quản lý điểm rèn luyện', parentKey: 6129, link: '/user/ctsv/danh-gia-drl', icon: 'fa-calculator', backgroundColor: '#ac2d34' }
        }
    };

    app.permission.add(
        { name: 'ctsvDanhGiaDrl:manage', menu: menuDanhGiaDrl },
        { name: 'ctsvDanhGiaDrl:write' },
        { name: 'ctsvDanhGiaDrl:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDanhGiaDrl', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvDanhGiaDrl:manage', 'ctsvDanhGiaDrl:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/danh-gia-drl', app.permission.check('ctsvDanhGiaDrl:manage'), app.templates.admin);
    app.get('/user/ctsv/danh-gia-drl/chi-tiet/:mssv', app.permission.orCheck('ctsvDanhGiaDrl:manage'), app.templates.admin);
    app.get('/user/ctsv/danh-gia-drl/upload', app.permission.orCheck('ctsvDanhGiaDrl:manage'), app.templates.admin);

    //  API ============================================================================================================================
    app.get('/api/ctsv/danh-gia-drl/page/:pageNumber/:pageSize', app.permission.orCheck('ctsvDanhGiaDrl:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.svDrlDanhGia.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-gia-drl/tieu-chi', app.permission.orCheck('ctsvDanhGiaDrl:manage', 'student:login', 'staff:drl-manage', 'svDanhGiaDrlLt:manage'), async (req, res) => {
        try {
            const { namHoc, hocKy, mssv } = req.query;
            // let svInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, namHoc, hocKy }, '*'),
            //     svDot = await app.model.svDotDanhGiaDrl.get({ id: svInfo.idDot }, '*', 'ID DESC'),
            //     dsTieuChi = await app.model.svBoTieuChi.getAll({ maCha: null, kichHoat: 1, idBo: svDot ? svDot.maBoTc : null }, '*', 'STT ASC');
            // const lsDiemDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*', 'MA ASC');
            // Build Map tiêu chí theo mã
            // dsTieuChi = await app.model.svDrlDanhGia.initDiemTable(svDot, mssv, namHoc, hocKy);
            let { svDot, svInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);

            let { dsTieuChi, lsDiemDanhGia, listSuKien, lsMinhChung, bhytData } = await app.model.svDrlDanhGia.initDiemTable(svDot, mssv, namHoc, hocKy);
            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
            tongKetInfo.kyLuat = await app.model.svQtKyLuat.getDrlMapKyLuat(mssv, namHoc, hocKy);
            if (tongKetInfo.tkSubmit) { //Đã tổng kết
                tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.tkSubmit);
            }

            // Lấy điểm TB của sinh viên 
            let diemTrungBinh;
            if (tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0))
                diemTrungBinh = tongKetInfo.diemTb;
            else
                ({ diemTrungBinh } = (await app.model.dtDiemTrungBinh.get({ mssv, namHoc, hocKy })) || {});

            const items = {
                svInfo,
                lsBoTieuChi: dsTieuChi,
                lsDiemDanhGia,
                lsMinhChung,
                tongKetInfo,
                diemTrungBinh,
                listSuKien,
                bhytData,
                canEdit: false,
            };
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/danh-gia-drl/:mssv', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
        try {
            const mssv = req.params.mssv,
                { bangDanhGiaKhoa } = req.body,
                now = new Date(),
                { namHoc, hocKy } = bangDanhGiaKhoa;
            const dsTuDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*');
            const studentInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, kichHoat: 1 }, '*'),
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.get({ id: studentInfo ? studentInfo.idDot : null, kichHoat: 1, namHoc, hocKy }, '*');
            if (studentInfo && dotDanhGiaInfo && (new Date(dotDanhGiaInfo.timeLt) <= now && new Date(dotDanhGiaInfo.ngayKetThuc) >= now)) {
                await Promise.all([
                    // app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy }),
                    ...bangDanhGiaKhoa.arrDiemDanhGia.map(item => {
                        const { diemF, maTieuChi } = item;
                        if (dsTuDanhGia.some(diem => diem.maTieuChi == maTieuChi)) {
                            return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { diemF, modifiedTime: now.getTime(), userModifier: req.session.user?.email });
                        } else {
                            return app.model.svDrlDanhGia.create({
                                ...item, mssv, namHoc, hocKy, modifiedTime: now.getTime(), userModifier: req.session.user?.email
                            });
                        }
                    })]);
                console.log(` + Sinh viên ${mssv} đã đánh giá điểm rèn luyện vào lúc ${app.date.dateTimeFormat(now, 'HH:MM:ss dd/mm/yyyy')}`);
                res.end();
            } else {
                res.send({ error: { message: 'Bạn không thể đánh giá điểm rèn luyện lúc này' } });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-gia-drl/minh-chung', app.permission.orCheck('ctsvDanhGiaDrl:manage', 'student:login'), async (req, res) => {
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

    app.post('/api/ctsv/diem-tong-ket', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
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
                    const { diemSv, diemLt, diemF, diemEditTk, lyDoTk } = item;
                    if (dsDanhGia.some(sv => sv.mssv == item.mssv)) {
                        return app.model.svDiemRenLuyen.update({ mssv: item.mssv, namHoc, hocKy }, { tkSubmit: diemEditTk, lyDoTk, timeModified: now.getTime() });
                    } else {
                        return app.model.svDiemRenLuyen.create({
                            mssv: item.mssv,
                            namHoc, hocKy,
                            svSubmit: diemSv,
                            ltSubmit: diemLt,
                            fSubmit: diemF,
                            tkSubmit: diemEditTk,
                            lyDoTk,
                            staffHandle: user.email,
                            timeModified: now.getTime()
                        });
                    }
                }));
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-gia-drl/download-excel', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
        try {
            const { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let data = await app.model.svDrlDanhGia.downloadExcel(searchTerm, filter);
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
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-gia-drl/download-template', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Upload_Drl_Template');
            ws.columns = [
                { header: 'MSSV', key: 'ma', width: 10 },
                { header: 'Điểm sinh viên', key: 'diemSv', width: 15 },
                { header: 'Điểm lớp', key: 'diemLt', width: 15 },
                { header: 'Điểm khoa', key: 'diemF', width: 15 },
                { header: 'Điểm tổng kết', key: 'diemTk', width: 15 },
                { header: 'Ghi chú khoa', key: 'lyDoF', width: 30 },
                { header: 'Ghi chú CTSV', key: 'lyDoTk', width: 30 },
            ];
            app.excel.attachment(workBook, res, 'DS_SV_DRL_Template.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/danh-gia-drl/update/multiple/dssv-excel', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
        try {
            const { dssv, namHoc, hocKy } = req.body;
            const timeModified = Date.now();
            await Promise.all([
                ...dssv.map(sv => {
                    if (sv.thongTinDrlSave) {
                        return app.model.svDiemRenLuyen.update({ ma: sv.thongTinDrlSave.ma }, {
                            ...sv, timeModified
                        });
                    } else {
                        return app.model.svDiemRenLuyen.create({
                            ...sv,
                            namHoc, hocKy, timeModified
                        });
                    }
                })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('DsDrlData', (req, fields, files, params, done) =>
        app.permission.has(req, () => requestImportDrlTask(req, files, params, done), done, 'ctsvDanhGiaDrl:write')
    );

    const requestImportDrlTask = (req, files, params, done) => {
        if (files.DsDrlCtsvData?.length) {
            let { namHoc, hocKy } = params;
            const email = req.session.user.email;
            const srcPath = files.DsDrlCtsvData[0].path;
            app.service.executeService.run({
                email,
                param: { namHoc, hocKy, srcPath },
                path: '/user/ctsv/danh-gia-drl/upload',
                task: 'importDrl',
                taskName: `Tải lên Điểm rèn luyện ${namHoc} HK${hocKy}`,
            });
            done && done({});
        }
    };

    app.post('/api/ctsv/diem-tong-ket/calc', app.permission.check('ctsvDanhGiaDrl:write'), async (req, res) => {
        try {
            const { namHoc, hocKy, filter } = req.body;
            const now = new Date();
            const { rows: listDiem } = await app.model.svDrlDanhGia.calcSumDiem(namHoc, hocKy, app.utils.stringify(filter));
            await Promise.all(listDiem.map(item => {
                const { mssv, sumF, diemTb, drlMax, idTk } = item,
                    tkSubmit = Math.min(parseInt(diemTb || 0) + parseInt(sumF || 0), parseInt(drlMax));
                if (idTk) {
                    app.model.svDiemRenLuyen.update({ namHoc, hocKy, mssv }, { tkSubmit, diemTb: diemTb || 0, timeModified: now.getTime() });
                }
                // else {
                //     app.model.svDiemRenLuyen.create({
                //         mssv, namHoc, hocKy,
                //         diemTb: diemTb || 0,
                //         tkSubmit,
                //         timeModified: now.getTime()
                //     });
                // }
            }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};