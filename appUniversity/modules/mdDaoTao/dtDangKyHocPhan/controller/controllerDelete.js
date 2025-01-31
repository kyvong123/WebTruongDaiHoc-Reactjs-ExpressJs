module.exports = app => {

    //check
    app.delete('/api/dt/dang-ky-hoc-phan', app.permission.check('dtDangKyHocPhan:delete'), async (req, res) => {
        try {
            let { listHocPhan, mssv, filter } = req.body, user = req.session.user,
                { namHoc, hocKy, ghiChu } = filter,
                listCheck = [];

            for (let maHocPhan of listHocPhan) {
                let dangKy = await app.model.dtDangKyHocPhan.get({ maHocPhan, mssv }),
                    monHoc = await app.model.dmMonHoc.get({ ma: dangKy.maMonHoc }),
                    lichThi = await app.model.dtExam.getAll({ maHocPhan }, 'id'),
                    listDiem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv });

                await app.model.dtDangKyHocPhan.delete({ maHocPhan, mssv });
                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan, tenMonHoc: app.utils.parse(monHoc?.ten, { vi: '' })?.vi,
                    userModified: user.email.split('@')[0], timeModified: Date.now(),
                    thaoTac: 'D', namHoc, hocKy, ghiChu
                });

                await app.model.dtDangKyHocPhan.notify({ maHocPhan, mssv, thaoTac: 'D' });

                //xoa diem
                if (listDiem.length) {
                    await app.model.dtDiemGhiChu.delete({ maHocPhan, mssv });
                    for (let diem of listDiem) {
                        await app.model.dtDiemHistory.create({
                            mssv, maHocPhan, namHoc, hocKy, userModified: user.email, timeModified: Date.now(), maMonHoc: dangKy.maMonHoc,
                            loaiDiem: diem.loaiDiem, oldDiem: diem?.diem || '', newDiem: '', phanTramDiem: diem.phanTramDiem || '', hinhThucGhi: 2,
                        });
                    }
                    await app.model.dtDiemAll.delete({ maHocPhan, mssv });
                    await app.model.dtDiemGhiChu.create({
                        mssv, maHocPhan, userModified: user.email, timeModified: Date.now(), ghiChu: 'Xóa học phần'
                    });
                    app.dkhpRedis.initDiemStudent(mssv);
                }

                //xoa lich thi
                if (lichThi.length) {
                    lichThi = lichThi.map(item => item.id);
                    for (let id of lichThi) {
                        await app.model.dtExamDanhSachSinhVien.delete({ mssv, idExam: id });
                        const dssv = await app.model.dtExamDanhSachSinhVien.getAll({ idExam: id });

                        for (let [index, sinhVien] of dssv.entries()) {
                            await app.model.dtExamDanhSachSinhVien.update({ idExam: sinhVien.idExam, mssv: sinhVien.mssv }, { stt: index + 1, modifier: user.email, timeModified: Date.now() });
                        }
                    }
                }

                let check = {
                    mssv, maHocPhan: maHocPhan, maMonHoc: monHoc.ma,
                    tenMonHoc: monHoc?.ten, tinChi: monHoc?.tongTinChi, soTiet: monHoc?.tongTiet,
                    namHoc, hocKy, status: 'D', user: user.email, loaiDangKy: dangKy.maLoaiDky
                };
                listCheck.push(check);
                app.dkhpRedis.deleteDkhpSV(maHocPhan);
            }
            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    //check
    app.delete('/api/dt/dang-ky-hoc-phan/multiple', app.permission.check('dtDangKyHocPhan:delete'), async (req, res) => {
        try {
            let { maHocPhan, listSv, filter } = req.body, user = req.session.user,
                { namHoc, hocKy, ghiChu } = filter,
                listCheck = [];

            let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan }),
                monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc }),
                lichThi = await app.model.dtExam.getAll({ maHocPhan }, 'id');
            //xoa lich thi
            if (lichThi.length) {
                lichThi = lichThi.map(item => item.id);
                for (let id of lichThi) {
                    for (let mssv of listSv) {
                        await app.model.dtExamDanhSachSinhVien.delete({ mssv, idExam: id });
                        const dssv = await app.model.dtExamDanhSachSinhVien.getAll({ idExam: id });

                        for (let [index, sinhVien] of dssv.entries()) {
                            await app.model.dtExamDanhSachSinhVien.update({ idExam: sinhVien.idExam, mssv: sinhVien.mssv }, { stt: index + 1, modifier: user.email, timeModified: Date.now() });
                        }
                    }
                }
            }

            for (let mssv of listSv) {
                let dangKy = await app.model.dtDangKyHocPhan.get({ maHocPhan, mssv });
                await app.model.dtDangKyHocPhan.delete({ maHocPhan, mssv });
                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan, tenMonHoc: app.utils.parse(monHoc?.ten, { vi: '' })?.vi,
                    userModified: user.email.split('@')[0], timeModified: Date.now(),
                    thaoTac: 'D', namHoc, hocKy, ghiChu
                });

                await app.model.dtDangKyHocPhan.notify({ maHocPhan, mssv, thaoTac: 'D' });

                //xoa diem
                let listDiem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv });
                if (listDiem.length) {
                    await app.model.dtDiemGhiChu.delete({ maHocPhan, mssv });
                    for (let diem of listDiem) {
                        await app.model.dtDiemHistory.create({
                            mssv, maHocPhan, namHoc, hocKy, userModified: user.email, timeModified: Date.now(),
                            loaiDiem: diem.loaiDiem, oldDiem: diem?.diem || '', newDiem: diem?.diem || '', phanTramDiem: diem.phanTramDiem || '', hinhThucGhi: 2,
                        });
                    }
                    await app.model.dtDiemAll.delete({ maHocPhan, mssv });
                    await app.model.dtDiemGhiChu.create({
                        mssv, maHocPhan, userModified: user.email, timeModified: Date.now(), ghiChu: 'Xóa học phần'
                    });
                    app.dkhpRedis.initDiemStudent(mssv);
                }

                let check = {
                    mssv, maHocPhan, maMonHoc: monHoc.ma, tenMonHoc: monHoc?.ten,
                    tinChi: monHoc?.tongTinChi, soTiet: monHoc?.tongTiet,
                    namHoc, hocKy, status: 'D', user: user.email, loaiDangKy: dangKy.maLoaiDky
                };
                listCheck.push(check);
            }

            if (listSv.length) {
                app.dkhpRedis.deleteDkhpMultiple({
                    maHocPhan, soLuongDky: listSv.length
                });
            }

            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //check
    app.delete('/api/dt/dang-ky-hoc-phan/huy-import', app.permission.check('dtDangKyHocPhan:delete'), async (req, res) => {
        try {
            let { list } = req.body, user = req.session.user,
                listCheck = [];

            for (let item of list) {
                let { mssv, maHocPhan } = item;
                let dangKyCu = await app.model.dtDangKyHocPhan.get({ maHocPhan, mssv }),
                    monHoc = await app.model.dmMonHoc.get({ ma: dangKyCu.maMonHoc }),
                    tenMonHoc = app.utils.parse(monHoc?.ten, { vi: '' })?.vi,
                    tinChi = monHoc?.tongTinChi;

                await app.model.dtDangKyHocPhan.delete({ maHocPhan, mssv });
                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan, tenMonHoc,
                    userModified: user.email.split('@')[0], timeModified: Date.now(),
                    thaoTac: 'D', namHoc: dangKyCu.namHoc, hocKy: dangKyCu.hocKy,
                    ghiChu: item.ghiChu
                });

                //xoa diem
                let listDiem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv });
                if (listDiem.length) {
                    await app.model.dtDiemGhiChu.delete({ maHocPhan, mssv });
                    for (let diem of listDiem) {
                        await app.model.dtDiemHistory.create({
                            mssv, maHocPhan, namHoc: dangKyCu.namHoc, hocKy: dangKyCu.hocKy, userModified: user.email, timeModified: Date.now(),
                            loaiDiem: diem.loaiDiem, oldDiem: diem?.diem || '', newDiem: diem?.diem || '', phanTramDiem: diem.phanTramDiem || '', hinhThucGhi: 2,
                        });
                    }
                    app.model.dtDiemAll.delete({ maHocPhan, mssv });
                    app.model.dtDiemGhiChu.create({
                        mssv, maHocPhan, userModified: user.email, timeModified: Date.now(), ghiChu: 'Xóa học phần'
                    });
                    app.dkhpRedis.initDiemStudent(mssv);
                }

                app.model.dtDangKyHocPhan.notify({ maHocPhan, mssv, thaoTac: 'D' });

                let check = {
                    mssv, maHocPhan, maMonHoc: dangKyCu.maMonHoc,
                    tenMonHoc: monHoc?.ten, tinChi, soTiet: monHoc?.tongTiet,
                    namHoc: dangKyCu.namHoc, hocKy: dangKyCu.hocKy,
                    status: 'D', user: user.email, loaiDangKy: dangKyCu.maLoaiDky
                };
                listCheck.push(check);
            }
            // await app.dkhpRedis.deleteDkhpSV(maHocPhan);
            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};