module.exports = app => {
    const PERMISSION = 'student:login';
    app.delete('/api/dkmh/dang-ky-hoc-phan', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { hocPhan, filter } = req.body, user = req.session.user, mssv = req.body.mssv ?? user.studentId,
                { tenMonHoc, cauHinh } = filter;

            let { namHoc, hocKy, id } = cauHinh;

            let endTime = await app.database.dkhpRedis.get(`DOT:${id}`);
            if (parseInt(endTime) < Date.now()) {
                throw 'Đợt đăng ký đã kết thúc!';
            }

            const checkDelete = await app.dkhpRedis.deleteDkhp({ maHocPhan: hocPhan, idDot: id });
            if (checkDelete) {
                await app.model.dtDangKyHocPhan.delete({ maHocPhan: hocPhan, mssv });
                app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan: hocPhan,
                    userModified: `${user.lastName} ${user.firstName}`,
                    timeModified: Date.now(),
                    thaoTac: 'D', tenMonHoc,
                    namHoc, hocKy,
                });
            }

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dkmh/dang-ky-hoc-phan', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { currHocPhan, newHocPhan, filter } = req.body, user = req.session.user, mssv = user.studentId,
                { tenMonHoc, cauHinh, tkbSoLuongDuKienMax } = filter;

            let { namHoc, hocKy, id } = cauHinh;

            let endTime = await app.database.dkhpRedis.get(`DOT:${id}`);
            if (parseInt(endTime) < Date.now()) {
                throw 'Đợt đăng ký đã kết thúc!';
            }

            const checkUpdate = await app.dkhpRedis.updateDkhp({ maHocPhanCu: currHocPhan, maHocPhanMoi: newHocPhan, tkbSoLuongDuKienMax, idDot: id });
            if (!checkUpdate) throw 'Học phần đã đủ số lượng đăng ký!';
            await app.model.dtDangKyHocPhan.update({ maHocPhan: currHocPhan, mssv }, { maHocPhan: newHocPhan });
            app.model.dtLichSuDkhp.create({
                mssv, maHocPhan: newHocPhan, tenMonHoc,
                userModified: `${user.lastName} ${user.firstName}`,
                timeModified: Date.now(),
                thaoTac: 'C',
                ghiChu: currHocPhan,
                namHoc, hocKy,
            });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};
