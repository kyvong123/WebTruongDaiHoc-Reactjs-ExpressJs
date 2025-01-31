module.exports = app => {
    app.put('/api/dt/dang-ky-hoc-phan', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { condition, listSv } = req.body, user = req.session.user,
                { currMaHocPhan, newMaHocPhan, ghiChu } = condition,
                listCheck = [], listFalse = { diem: [], lhdt: [] }, listSuccess = [];

            const [currHocPhan, currLichThi, newHocPhan, newLichThi] = await Promise.all([
                app.model.dtThoiKhoaBieu.get({ maHocPhan: currMaHocPhan }),
                app.model.dtExam.getAll({ maHocPhan: currMaHocPhan }),
                app.model.dtThoiKhoaBieu.get({ maHocPhan: newMaHocPhan }),
                app.model.dtExam.getAll({ maHocPhan: newMaHocPhan }),
            ]);

            if (currLichThi.length || newLichThi.length) throw 'Học phần đã có lịch thi!';
            else {
                for (let mssv of listSv) {
                    let diem = await app.model.dtDiemAll.getAll({ maHocPhan: currMaHocPhan, mssv });
                    if (diem.length) listFalse.diem.push(mssv);
                    else {
                        let [hocPhanDangKy, monHoc, monHocCurr, message] = await Promise.all([
                            app.model.dtDangKyHocPhan.get({ maHocPhan: currMaHocPhan, mssv }),
                            app.model.dmMonHoc.get({ ma: newHocPhan.maMonHoc }),
                            app.model.dmMonHoc.get({ ma: currHocPhan.maMonHoc }),
                            app.model.dtDangKyHocPhan.checkDangKy(mssv, newMaHocPhan, 0, currMaHocPhan),
                        ]);

                        if (message.isDangKy) {
                            let { namHoc, hocKy } = hocPhanDangKy;
                            await app.model.dtDangKyHocPhan.update({ maHocPhan: currMaHocPhan, mssv }, {
                                maHocPhan: newMaHocPhan, maMonHoc: newHocPhan.maMonHoc,
                                modifier: user.email, timeModified: Date.now(),
                                maLoaiDky: message.maLoaiDKy, loaiMonHoc: message.loaiMonHoc
                            });

                            await app.model.dtLichSuDkhp.create({
                                mssv, maHocPhan: newMaHocPhan,
                                userModified: user.email.split('@')[0], timeModified: Date.now(),
                                thaoTac: 'C', ghiChu: ghiChu ? `${currMaHocPhan}, ${ghiChu}` : currMaHocPhan, namHoc, hocKy,
                                tenMonHoc: app.utils.parse(monHoc?.ten, { vi: '' })?.vi,
                            });

                            await app.model.dtDangKyHocPhan.notify({ maHocPhan: newMaHocPhan, mssv, thaoTac: 'C' });

                            let checkMoi = {
                                mssv, maHocPhan: newMaHocPhan, maMonHoc: newHocPhan.maMonHoc,
                                tenMonHoc: monHoc.ten, tinChi: monHoc.tongTinChi, soTiet: monHoc?.tongTiet,
                                namHoc, hocKy, status: 'I',
                                user: user.email, loaiDangKy: message.maLoaiDKy
                            };
                            listCheck.push(checkMoi);

                            let checkCu = {
                                mssv, maHocPhan: currMaHocPhan, maMonHoc: currHocPhan.maMonHoc,
                                tenMonHoc: monHocCurr.ten, tinChi: monHocCurr.tongTinChi, soTiet: monHocCurr.tongTiet,
                                namHoc, hocKy, status: 'D',
                                user: user.email, loaiDangKy: hocPhanDangKy.maLoaiDky
                            };
                            listCheck.push(checkCu);

                            listSuccess.push(mssv);
                        } else listFalse.lhdt.push(mssv);
                    }
                }
                if (listSv.length) {
                    app.dkhpRedis.updateDkhpMultiple({
                        maHocPhanMoi: newMaHocPhan,
                        maHocPhanCu: currHocPhan,
                        soLuongDky: listSv.length
                    });
                }
            }
            if (listCheck.length) app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            res.send({ listFalse, listSuccess });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};