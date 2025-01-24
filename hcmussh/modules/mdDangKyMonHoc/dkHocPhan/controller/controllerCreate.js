module.exports = app => {

    app.post('/api/dkmh/dang-ky-hoc-phan', app.permission.check('student:login'), async (req, res) => {
        try {
            let { hocPhan, filter } = req.body,
                user = req.session.user,
                mssv = user.studentId,
                { rotMon, maMonHoc, loaiMonHoc, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, tenMonHoc, cauHinh, isHocVuot, tkbSoLuongDuKienMax } = filter;

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

            const result = await app.dkhpRedis.createDkhp({ maHocPhan: hocPhan, tkbSoLuongDuKienMax, idDot: cauHinh.id });
            if (!result) throw 'Học phần đã đủ số lượng đăng ký!';
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

            let listMonKhongPhi = await app.database.dkhpRedis.get('listMonKhongPhi');
            listMonKhongPhi = JSON.parse(listMonKhongPhi || '[]');

            let data = {
                mssv,
                namHoc: cauHinh.namHoc,
                hocKy: cauHinh.hocKy,
                maHocPhan: hocPhan,
                modifier: user.email,
                timeModified: Date.now(),
                maLoaiDky, maMonHoc, loaiMonHoc,
                tinhPhi: listMonKhongPhi.includes(maMonHoc) ? 0 : 1,
            };

            await app.model.dtDangKyHocPhan.create(data);
            app.model.dtLichSuDkhp.create({
                mssv, maHocPhan: hocPhan,
                userModified: `${user.lastName} ${user.firstName}`,
                timeModified: Date.now(),
                thaoTac: 'A', tenMonHoc,
                namHoc: cauHinh.namHoc,
                hocKy: cauHinh.hocKy,
            });

            res.send({ maLoaiDky });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
