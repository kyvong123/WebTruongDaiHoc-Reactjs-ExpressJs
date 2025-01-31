
// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svBaoHiemYTe.foo = () => { }; /
    app.model.svBaoHiemYTe.getDsSvBhyt = async (namHoc = null, hocKy = null) => {
        let dataBhyt = [];
        if (namHoc && hocKy) {
            const semester = (await app.model.dtSemester.get({ namHoc: `${parseInt(namHoc)} - ${parseInt(namHoc) + 1}`, hocKy }, '*')) || { beginTime: null, endTime: null };
            dataBhyt = await app.model.svBaoHiemYTe.getAll({
                statement: '(:thoiGianBatDau <= thoiGian AND thoiGian <= :thoiGianKetThuc) AND dienDong != 0 AND maThanhToan is NULL',
                parameter: {
                    thoiGianBatDau: semester.beginTime,
                    thoiGianKetThuc: semester.endTime,
                }
            }, '*');
        } else {
            dataBhyt = await app.model.svBaoHiemYTe.getAll({ maThanhToan: null }, '*');
        }
        return dataBhyt || [];
    };

    app.model.svBaoHiemYTe.themTaiChinhBhyt = async (mssv, namHoc, hocKy, dienDong) => {
        try {
            let loaiPhi = await app.model.tcLoaiPhi.getAll({ namPhatSinh: namHoc, hocKyPhatSinh: hocKy });
            let mapBhyt = await app.model.tcLoaiPhiBhyt.getAll({});

            let loaiPhiBhyt = loaiPhi.map(item => Object({ ...item, ...mapBhyt.find(subItem => subItem.loaiPhi == item.id) })).filter(item => item.dienDong);
            let loaiPhiBhytDienDong = loaiPhiBhyt.find(item => item.dienDong == dienDong);

            for (let bhyt of loaiPhiBhyt) {
                let detail = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi: bhyt.id });
                let soDu = await app.model.tcSoDuHocPhi.get({ mssv });
                if (!soDu) {
                    await app.model.tcSoDuHocPhi.create({ mssv, soTien: parseInt(detail?.soTienDaDong || 0) });
                }
                else {
                    await app.model.tcSoDuHocPhi.update({ mssv }, { soTien: parseInt(detail?.soTienDaDong || 0) + parseInt(soDu.soTien) });
                }
                await app.model.tcHocPhiDetail.delete({ mssv, namHoc, hocKy, loaiPhi: bhyt.id });
            }

            if (!Number(dienDong)) {
                await app.model.tcDotDong.capNhatDongTien(mssv);
                return;
            }

            if (!loaiPhiBhytDienDong) {
                throw 'Không tồn tại loại BHYT';
            }

            let dotDongLoaiPhi = await app.model.tcDotDongLoaiPhi.get({ loaiPhi: loaiPhiBhytDienDong.id, namHoc, hocKy });
            if (!dotDongLoaiPhi) {
                throw 'Chưa cấu hình mức thu cho loại BHYT';
            }
            let item = await app.model.tcHocPhiDetail.create({
                mssv, namHoc, hocKy,
                loaiPhi: loaiPhiBhytDienDong.id,
                active: 1,
                soTien: dotDongLoaiPhi.soTien,
                dotDong: dotDongLoaiPhi.idDotDong,
                soTienDaDong: 0,
                mucTinhPhi: 100,
                soTienCanDong: dotDongLoaiPhi.soTien,
                ngayTao: Date.now(),
            });

            await app.model.tcDotDong.capNhatDongTien(mssv);
            return item;
        }
        catch (error) {
            console.error(error);
        }
    };
};