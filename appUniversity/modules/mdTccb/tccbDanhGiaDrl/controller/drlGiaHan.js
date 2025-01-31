module.exports = (app) => {

    app.get('/api/tccb/danh-gia-drl/gia-han/all', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const user = req.session.user, now = Date.now();
            let { idDot } = req.query;
            const dsGiaHan = await app.model.svDrlGiaHanKhoa.getData(idDot).then(rec => rec.rows);
            let timeEndGiaHan = (dsGiaHan && dsGiaHan.filter(item => item.tinhTrang == 'A').length) ? dsGiaHan.filter(item => item.tinhTrang == 'A')[0].ngayHetHan : null;
            let thongTinDot = await app.model.svDotDanhGiaDrl.get({ id: req.query.idDot }, '*', 'ID DESC');
            ({ svDot: thongTinDot } = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(thongTinDot, user.maDonVi));
            let timePkStart = thongTinDot.timePkStart ? thongTinDot.timePkStart : '';
            let isInGiaHan = timeEndGiaHan ? (timeEndGiaHan >= now) : false;
            let isHetHan = isInGiaHan ? false : (timePkStart ? (timePkStart < now) : (thongTinDot.timeEndFaculty < now));
            res.send({ dsGiaHan, isHetHan, timeEndGiaHan });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-drl/gia-han/khoa', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { changes } = req.body;
            const user = req.session.user;
            const khoaInfo = await app.model.dmDonVi.get({ ma: changes.maKhoa }, '*');
            const item = await app.model.svDrlGiaHanKhoa.create({ ...changes, ngayDangKy: new Date().getTime(), nguoiDangKy: user.email });
            if (item) {
                await Promise.all([
                    (changes.dsSinhVien && changes.dsSinhVien.length) && changes.dsSinhVien.map(sv =>
                        app.model.svDrlDssvGiaHan.create({
                            mssv: sv.mssv,
                            idGiaHanKhoa: item.id
                        })),
                    (changes.dsSinhVien && changes.dsSinhVien.length) && app.model.svDrlKienNghiGiaHan.update({
                        statement: 'mssv in (:dssv) and idDot = :idDot and tinhTrang is null',
                        parameter: { dssv: changes.dsSinhVien.map(sv => sv.mssv), idDot: changes.idDot }
                    }, {
                        idGiaHan: item.id,
                        tinhTrang: 'P',
                        staffHandle: user.email,
                        timeHandle: Date.now()
                    })
                ]);

                await app.model.svDrlGiaHanKhoa.notifyCtsv({ tinhTrang: changes.tinhTrang, nguoiDangKy: user.email, tenKhoa: khoaInfo.ten, idDot: changes.idDot });
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-drl/gia-han/khoa', app.permission.orCheck('staff:drl-manage', 'ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const { changes, id } = req.body;
            if (changes.tinhTrang == 'A' || changes.tinhTrang == 'R') {
                changes.nguoiXuLy = req.session.user.email;
                const dssv = await app.model.svDrlDssvGiaHan.getAll({ idGiaHanKhoa: id });
                app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: changes.tinhTrang, dsSinhVien: dssv.map(sv => sv.mssv) });
            }
            const item = await app.model.svDrlGiaHanKhoa.update({ id }, { ...changes, ngayDangKy: new Date().getTime() });
            const khoaInfo = await app.model.dmDonVi.get({ ma: item.maKhoa }, '*');
            if (item) {
                if (changes.dsSinhVien && changes.dsSinhVien.length) {
                    const listDeleted = changes.dsSinhVien.filter(sv => sv.isDelete == '1');
                    await app.model.svDrlDssvGiaHan.delete({ idGiaHanKhoa: id });
                    await Promise.all([
                        // Reset Kiến nghị sinh viên bị loại
                        listDeleted.length ? app.model.svDrlKienNghiGiaHan.update({
                            statement: 'idGiaHan = :idGiaHan and mssv in (:listMssv)',
                            parameter: { idGiaHan: id, listMssv: listDeleted.map(sv => sv.mssv) }
                        }, { idGiaHan: null }) : null,
                        changes.dsSinhVien.filter(sv => sv.isDelete != '1').map(sv => app.model.svDrlDssvGiaHan.create({
                            mssv: sv.mssv,
                            idGiaHanKhoa: item.id
                        }))
                    ]);
                }
                await app.model.svDrlGiaHanKhoa.notifyCtsv({ tinhTrang: item.tinhTrang, nguoiDangKy: item.nguoiDangKy, tenKhoa: khoaInfo.ten });
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-drl/gia-han/khoa/huy-dang-ky', app.permission.orCheck('staff:drl-manage', 'ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const { idGiaHan } = req.body;
            await Promise.all([
                app.model.svDrlDssvGiaHan.delete({ idGiaHanKhoa: idGiaHan }),
                app.model.svDrlGiaHanKhoa.delete({ id: idGiaHan }),
                app.model.svDrlKienNghiGiaHan.update({ idGiaHan: idGiaHan }, { idGiaHan: null })
            ]);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/gia-han/khoa', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { idDot } = req.query;
            const items = await app.model.svDrlGiaHanKhoa.getAll({ idDot }, '*');
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-drl/gia-han/khoa/dssv', app.permission.orCheck('staff:drl-manage', 'ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const { idGiaHan } = req.query;
            const dataDssvGiaHan = await app.model.svDrlDssvGiaHan.getData(idGiaHan);
            res.send({ items: dataDssvGiaHan.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/diem-ren-luyen/gia-han/kien-nghi/all', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const idDot = req.query.idDot,
                searchTerm = req.query.condition,
                canBo = req.session.user,
                now = Date.now(),
                listDonViQuanLy = canBo.staff.donViQuanLy.map(donVi => donVi.maDonVi),
                phanCapCanBo = await app.model.tccbDrlRole.get({ emailCanBo: canBo.email });
            const filter = {
                listFaculty: listDonViQuanLy.toString(),
                listKhoaSv: phanCapCanBo?.khoaSv,
                listHeSv: phanCapCanBo?.heSv
            };
            const thongTinDot = await app.model.svDotDanhGiaDrl.get({ id: idDot }) || {},
                { timeEndSv, timeEndLt, timeEndFaculty } = thongTinDot,
                timeEnd = Math.max(timeEndSv, timeEndLt, timeEndFaculty);

            const items = await app.model.svDrlKienNghiGiaHan.getData(idDot, app.utils.stringify(filter), searchTerm).then(rc => rc.rows);
            const newly = items.filter(item => !item.status),
                pending = items.filter(item => item.status == 'P'),
                handled = items.filter(item => item.status == 'A'),
                reject = items.filter(item => item.status == 'R');
            res.send({
                newly, pending, reject, handled,
                isInDot: now < timeEnd
            });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/diem-ren-luyen/gia-han/kien-nghi/chap-nhan', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            await app.model.svDrlKienNghiGiaHan.chapNhanKienNghi(req, req.body.data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/diem-ren-luyen/gia-han/kien-nghi/tu-choi', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            const { id, lyDoTuChoi } = req.body.data,
                user = req.session.user;
            const item = await app.model.svDrlKienNghiGiaHan.get({ id });
            // Loại sinh viên khỏi ds gia han khoa nếu có
            if (item.idGiaHan) {
                await app.model.svDrlDssvGiaHan.delete({ mssv: item.mssv, idGiaHanKhoa: item.idGiaHan });
            }
            await app.model.svDrlKienNghiGiaHan.update({ id }, {
                lyDoTuChoi, tinhTrang: 'R', timeHandle: Date.now(), staffHandle: user.email,
                timeEnd: null, timeStart: null
            });
            await app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: 'R', dsSinhVien: item.mssv });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/diem-ren-luyen/gia-han/phan-cap', app.permission.check('staff:drl-manage'), async (req, res) => {
        try {
            // let { listLop, mssv } = req.query.data ?? {};
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // app.get('/api/test', app.permission.check('developer:login'), async (req, res) => {
    //     try {
    //         await app.executeTask.calculateDiemTrungBinh
    //         res.send({});
    //     } catch (error) {
    //         app.consoleError(req, error);
    //         res.send({ error });
    //     }
    // });
};