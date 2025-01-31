module.exports = app => {

    app.post('/api/dt/dang-ky-hoc-phan/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { hocPhan, filter, userData } = req.body,
                { mssv } = userData,
                { rotMon, maMonHoc, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, cauHinh, isHocVuot } = filter;

            let [endTime, dataDiem] = await Promise.all([
                app.database.dkhpRedis.get(`DOT:${cauHinh.id}`),
                app.database.dkhpRedis.get(`DIEM:${mssv}`),
            ]);
            dataDiem = dataDiem ? JSON.parse(dataDiem) : [];
            dataDiem = dataDiem.find(i => i.maMonHoc == maMonHoc);

            if (parseInt(endTime) < Date.now()) {
                throw 'Đợt đăng ký đã kết thúc!';
            }

            let isCaiThien = false, isHocLai = false;
            if (dataDiem) {
                const { latestDiem } = dataDiem;
                if (parseFloat(latestDiem) < parseFloat(rotMon)) {
                    isHocLai = true;
                } else {
                    isCaiThien = true;
                }
            }

            let isSuccess = false;
            let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${hocPhan}|${cauHinh.id}`).get(`SLDK:${hocPhan}|${cauHinh.id}`).exec();
            let [siSo, soLuongDuKien] = redisQueue;
            siSo = parseInt(siSo);
            soLuongDuKien = parseInt(soLuongDuKien);

            if (siSo + 1 <= soLuongDuKien) {
                isSuccess = true;
            }

            if (!isSuccess) throw 'Học phần đã đủ số lượng đăng ký!';
            let maLoaiDky = '';
            if (theoKeHoach === 'true') {
                maLoaiDky = 'KH';
            } else if (ngoaiKeHoach === 'true') {
                maLoaiDky = 'NKH';
            } else if (ngoaiCtdt === 'true') {
                maLoaiDky = 'NCTDT';
            }
            if (isHocVuot === 'true') {
                maLoaiDky = 'HV';
            }
            if (isHocLai) {
                maLoaiDky = 'HL';
            } else if (isCaiThien) {
                maLoaiDky = 'CT';
            }

            let data = await app.model.dtDangKyHocPhan.searchPage(1, 50, app.utils.stringify({
                namHoc: cauHinh.namHoc,
                hocKy: cauHinh.hocKy,
                ks_maHocPhan: hocPhan,
            }), '');

            data = data.rows;

            data = data.map(i => ({ ...i, listMaLop: i.maLop, maLoaiDky, type: maLoaiDky }));
            res.send({ data });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
