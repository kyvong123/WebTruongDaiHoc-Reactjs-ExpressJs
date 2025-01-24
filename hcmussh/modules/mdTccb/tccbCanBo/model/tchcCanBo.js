// eslint-disable-next-line no-unused-vars

module.exports = app => {
    app.model.tchcCanBo.getFullProfile = async (canBo) => {
        let danhSachHopDong = [];

        let qtHopDongTrachNhiem = await app.model.qtHopDongTrachNhiem.getAll({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong, nguoiDuocThue, ma, soHopDong, ketThucHopDong, ngayKyHdTiepTheo, nguoiKy', 'ngayKyHopDong DESC');
        if (qtHopDongTrachNhiem && qtHopDongTrachNhiem.length > 0) {
            const dsHopDong = await Promise.all(qtHopDongTrachNhiem.map(async hdtn => {
                let nguoiKy = await app.model.tchcCanBo.get({ shcc: hdtn.nguoiKy });
                let item = {
                    id: hdtn.ma,
                    loaiHopDong: 'HDTN',
                    ngayKy: hdtn.ngayKyHopDong ? new Date(hdtn.ngayKyHopDong).setHours(0, 0, 0, 0) : '',
                    ngayBatDau: hdtn.ngayKyHopDong ? new Date(hdtn.ngayKyHopDong).setHours(0, 0, 0, 0) : '',
                    ngayKetThuc: hdtn.ketThucHopDong ? new Date(hdtn.ketThucHopDong).setHours(0, 0, 0, 0) : '',
                    shcc: hdtn.nguoiDuocThue,
                    soHopDong: hdtn.soHopDong || '',
                    ngayKyTiepTheo: hdtn.ngayKyHdTiepTheo ? new Date(hdtn.ngayKyHdTiepTheo).setHours(0, 0, 0, 0) : '',
                    nguoiKy: (nguoiKy.ho || '') + ' ' + (nguoiKy.ten || ''),
                    shccNguoiKy: hdtn.nguoiKy || ''
                };
                return item;
            }));
            danhSachHopDong = [...danhSachHopDong, ...dsHopDong];
        }

        let qtHopDongVienChuc = await app.model.qtHopDongVienChuc.getAll({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong,loaiHd, ma, nguoiDuocThue, ngayBatDauLamViec,  ngayKetThucHopDong, soQd, ngayKyHdTiepTheo, nguoiKy', 'ngayKyHopDong DESC');
        if (qtHopDongVienChuc && qtHopDongVienChuc.length > 0) {
            const dsHopDong = await Promise.all(qtHopDongVienChuc.map(async hdvc => {
                let nguoiKy = await app.model.tchcCanBo.get({ nguoiKy: hdvc.nguoiKy });
                let item = {
                    id: hdvc.ma,
                    loaiHopDong: 'HDVC',
                    ngayKy: hdvc.ngayKyHopDong ? new Date(hdvc.ngayKyHopDong).setHours(0, 0, 0, 0) : '',
                    shcc: hdvc.nguoiDuocThue,
                    ngayBatDau: hdvc.ngayBatDauLamViec ? new Date(hdvc.ngayBatDauLamViec).setHours(0, 0, 0, 0) : '',
                    ngayKetThuc: hdvc.ngayKetThucHopDong ? new Date(hdvc.ngayKetThucHopDong).setHours(0, 0, 0, 0) : '',
                    soHopDong: hdvc.soQd || '',
                    ngayKyTiepTheo: hdvc.ngayKyHdTiepTheo ? new Date(hdvc.ngayKyHdTiepTheo).setHours(0, 0, 0, 0) : '',
                    nguoiKy: (nguoiKy.ho || '') + ' ' + (nguoiKy.ten || ''),
                    shccNguoiKy: hdvc.nguoiKy || ''
                };
                return item;
            }));
            danhSachHopDong = [...danhSachHopDong, ...dsHopDong];
        }
        let qtNghiViecHienTai = await app.model.qtNghiViec.getByShcc(canBo.shcc).then(item => item?.rows?.find(element => element.ngayNghi = element.ngayNghiHienTai));
        let qtHopDongLaoDong = await app.model.qtHopDongLaoDong.getAll({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong,loaiHopDong, ma, nguoiDuocThue, soHopDong, batDauLamViec, ketThucHopDong, soHopDong, ngayKyHdTiepTheo, nguoiKy', 'ngayKyHopDong DESC');
        if (qtHopDongLaoDong && qtHopDongLaoDong.length > 0) {
            const dsHopDong = await Promise.all(qtHopDongLaoDong.map(async hdld => {
                let nguoiKy = await app.model.tchcCanBo.get({ shcc: hdld.nguoiKy });
                let item = {
                    id: hdld.ma,
                    loaiHopDong: 'HDLD',
                    shcc: hdld.nguoiDuocThue,
                    ngayKy: hdld.ngayKyHopDong ? new Date(hdld.ngayKyHopDong).setHours(0, 0, 0, 0) : '',
                    ngayBatDau: hdld.batDauLamViec ? new Date(hdld.batDauLamViec).setHours(0, 0, 0, 0) : '',
                    ngayKetThuc: hdld.ketThucHopDong ? new Date(hdld.ketThucHopDong).setHours(0, 0, 0, 0) : '',
                    soHopDong: hdld.soHopDong || '',
                    ngayKyTiepTheo: hdld.ngayKyHdTiepTheo ? new Date(hdld.ngayKyHdTiepTheo).setHours(0, 0, 0, 0) : '',
                    nguoiKy: (nguoiKy.ho || '') + ' ' + (nguoiKy.ten || ''),
                    shccNguoiKy: hdld.nguoiKy || ''
                };
                return item;
            }));
            danhSachHopDong = [...danhSachHopDong, ...dsHopDong];
        }
        let checkNghiViec = await app.model.qtNghiViec.get({ shcc: canBo.shcc });
        let thongTinCanBoHienTai;
        if (checkNghiViec)
            thongTinCanBoHienTai = { tinhTrangCongViec: 'Đã nghỉ việc' };
        else
            thongTinCanBoHienTai = await app.model.tchcCanBo.thongTinGetByShcc(canBo.shcc).then(data => data?.rows?.find(i => i.tinhTrangCongViec));
        let qtHopDongDonViTraLuong = await app.model.qtHopDongDonViTraLuong.getAll({ shcc: canBo.shcc }, 'ngayKyHopDong,loaiHopDong, id, shcc, soHopDong, ngayKyHopDong, batDauLamViec, ketThucHopDong, soHopDong, ngayTaiKy, nguoiKy', 'ngayKyHopDong DESC');
        if (qtHopDongDonViTraLuong && qtHopDongDonViTraLuong.length > 0) {
            const dsHopDong = await Promise.all(qtHopDongDonViTraLuong.map(async dvtl => {
                let nguoiKy = await app.model.tchcCanBo.get({ shcc: dvtl.nguoiKy });
                let item = {
                    id: dvtl.id,
                    loaiHopDong: 'HDDVTL',
                    ngayKy: dvtl.ngayKyHopDong ? new Date(dvtl.ngayKyHopDong).setHours(0, 0, 0, 0) : '',
                    shcc: dvtl.shcc,
                    ngayBatDau: dvtl.batDauLamViec ? new Date(dvtl.batDauLamViec).setHours(0, 0, 0, 0) : '',
                    ngayKetThuc: dvtl.ketThucHopDong ? new Date(dvtl.ketThucHopDong).setHours(0, 0, 0, 0) : '',
                    soHopDong: dvtl.soHopDong || '',
                    ngayKyTiepTheo: dvtl.ngayTaiKy ? new Date(dvtl.ngayTaiKy).setHours(0, 0, 0, 0) : '',
                    nguoiKy: (nguoiKy.ho || '') + ' ' + (nguoiKy.ten || ''),
                    shccNguoiKy: dvtl.nguoiKy || ''
                };
                return item;
            }));
            danhSachHopDong = [...danhSachHopDong, ...dsHopDong];
        }
        let curTime = new Date().getTime();
        const [image, quanHeCanBo, tenDonVi, toChucKhac, daoTaoCurrent, daoTaoBoiDuong, trinhDoNN, chucVuChinhQuyen, chucVuDoanThe, chucVuHienTai, qtNghiViec, hopDongCanBo, loaiHopDongCanBo] = await Promise.all([
            app.model.fwUser.get({ email: canBo.email }, 'image').then(data => data?.image || ''),
            app.model.quanHeCanBo.getQhByShcc(canBo.shcc).then(data => data?.rows || []),
            app.model.dmDonVi.get({ ma: canBo.maDonVi, kichHoat: 1 }, 'ten').then(data => data?.ten || ''),
            app.model.tccbToChucKhac.getAll({ shcc: canBo.shcc }),
            app.model.qtDaoTao.getCurrentOfStaff(canBo.shcc, curTime).then(data => data?.rows || []),
            app.model.qtDaoTao.getHV(canBo.shcc).then(data => data?.rows || []),
            app.model.trinhDoNgoaiNgu.getAll({ shcc: canBo.shcc }),
            app.model.qtChucVu.getByShcc(canBo.shcc).then(data => data?.rows?.filter(i => i.loaiChucVu == 1) || []),
            app.model.qtChucVu.getByShcc(canBo.shcc).then(data => data?.rows?.filter(i => i.loaiChucVu != 1) || []),
            app.model.qtChucVu.getByShcc(canBo.shcc).then(data => data?.rows?.find(i => i.chucVuChinh == 1 && i.ngayRaQuyetDinh <= Date.now())),
            app.model.qtNghiViec.getByShcc(canBo.shcc).then(data => data?.rows || []),
            (qtHopDongTrachNhiem && qtHopDongTrachNhiem.length) ? 'TN' : ((qtHopDongVienChuc && qtHopDongVienChuc.length) ? 'VC' : ((qtHopDongLaoDong && qtHopDongLaoDong.length) ? 'LĐ' : ((qtHopDongDonViTraLuong && qtHopDongDonViTraLuong.length) ? 'DVTL' : '00'))),
            (qtHopDongTrachNhiem && qtHopDongTrachNhiem.length) ? '' : ((qtHopDongVienChuc && qtHopDongVienChuc.length) ? qtHopDongVienChuc[0]?.loaiHd : ((qtHopDongLaoDong && qtHopDongLaoDong.length) ? qtHopDongLaoDong[0]?.loaiHopDong : ((qtHopDongDonViTraLuong && qtHopDongDonViTraLuong.length) ? qtHopDongDonViTraLuong[0]?.loaiHopDong : '00')))
        ]);
        let item = app.clone(canBo, { image, quanHeCanBo, tenDonVi, toChucKhac, daoTaoCurrent, daoTaoBoiDuong, trinhDoNN, chucVuChinhQuyen, chucVuDoanThe, danhSachHopDong, chucVuHienTai, qtNghiViec, qtNghiViecHienTai, thongTinCanBoHienTai, hopDongCanBo, loaiHopDongCanBo });
        return item;
    };

    // app.model.tchcCanBo.foo = () => { };
    app.model.tchcCanBo.getShccCanBo = (data, done) => {
        const deltaTime = 86400 * 1000; ///1 day
        let { ho, ten, ngaySinh, maDonVi } = data;
        if (ho) {
            ho = ho.toString().trim();
        }
        if (ten) {
            ten = ten.toString().trim();
        }
        if (ngaySinh) { //format: mm/dd/yyyy
            ngaySinh = ngaySinh.toString().trim();
            ngaySinh = new Date(ngaySinh).getTime();
            if (isNaN(ngaySinh)) {
                done('Thông tin ngày sinh bị lỗi !', null);
                return;
            }
        }

        if (maDonVi) {
            maDonVi = maDonVi.toString().trim();
        }
        let condition = {
            statement: 'lower(ho) like lower(:ho) and lower(ten) like lower(:ten) and ngayNghi IS NULL',
            parameter: {
                ho: `%${ho}%`,
                ten: `%${ten}%`,
            }
        };
        app.model.tchcCanBo.getAll(condition, (error, items) => {
            if (error || items.length == 0) {
                done('Họ và tên cán bộ không tồn tại !', null);
            } else {
                let bestScore = -1;
                let shcc = null;
                for (let idx = 0; idx < items.length; idx++) {
                    let score = 0;
                    if (items[idx].maDonVi == maDonVi) {
                        score += 0.8;
                    }
                    if (items[idx].ngaySinh) {
                        if (Math.abs(items[idx].ngaySinh - ngaySinh) < deltaTime) {
                            let percent = Math.abs(items[idx].ngaySinh - ngaySinh) / deltaTime;
                            score += 0.2 - percent;
                        }
                    }
                    if (score > bestScore) {
                        bestScore = score;
                        shcc = items[idx].shcc;
                    }
                }
                done(null, shcc);
            }
        });
    };


    app.model.tchcCanBo.validShcc = (req, shcc) => {
        if (req.session.user.permissions.includes('staff:write') || shcc == req.session.user.staff.shcc) return shcc;
        return null;
    };
};