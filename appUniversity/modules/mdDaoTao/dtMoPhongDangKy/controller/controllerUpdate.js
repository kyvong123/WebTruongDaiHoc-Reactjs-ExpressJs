module.exports = app => {
    app.delete('/api/dt/dang-ky-hoc-phan/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { filter, hocPhan } = req.body,
                { cauHinh } = filter;

            let { id } = cauHinh;

            let endTime = await app.database.dkhpRedis.get(`DOT:${id}`);
            if (parseInt(endTime) < Date.now()) {
                throw 'Đợt đăng ký đã kết thúc!';
            }

            res.send({ hocPhan });

        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/dang-ky-hoc-phan/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { currHocPhan, newHocPhan, filter } = req.body,
                { cauHinh } = filter;

            let { id, namHoc, hocKy } = cauHinh;

            let endTime = await app.database.dkhpRedis.get(`DOT:${id}`);
            if (parseInt(endTime) < Date.now()) {
                throw 'Đợt đăng ký đã kết thúc!';
            }

            let isSuccess = false;
            let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${newHocPhan}|${id}`).get(`SLDK:${newHocPhan}|${id}`).exec();
            let [siSo, soLuongDuKien] = redisQueue;
            siSo = parseInt(siSo);
            soLuongDuKien = parseInt(soLuongDuKien);
            if (siSo + 1 <= soLuongDuKien) {
                isSuccess = true;
            }

            if (!isSuccess) throw 'Học phần đã đủ số lượng đăng ký!';
            let data = await app.model.dtDangKyHocPhan.searchPage(1, 50, app.utils.stringify({
                namHoc, hocKy,
                ks_maHocPhan: newHocPhan,
            }), '');

            data = data.rows;
            data = data.map(i => ({ ...i, listMaLop: i.maLop }));

            res.send({ data: { currHocPhan, newHocPhan }, hocPhanChuyen: data });
        } catch (error) {
            res.send({ error });
        }
    });
};
