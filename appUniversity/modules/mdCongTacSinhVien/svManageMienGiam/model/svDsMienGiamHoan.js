// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svDsMienGiamHoan.foo = async () => { };
    app.model.svDsMienGiamHoan.hoanMienGiam = async (mssv, lyDo, staffEmail) => {
        //Lấy dữ liệu miễn giảm mới nhất của sinh viên
        const { rows: [dsmg] } = await app.model.svDsMienGiam.searchPage(1, 1, '', app.utils.stringify({ ks_mssv: mssv }));
        const loaiMg = dsmg ? app.utils.parse(dsmg.dataMienGiam) : [];
        const now = Date.now();
        // Duyệt qua các loại miễn giảm sv được hưởng
        await Promise.all(loaiMg.map(dt => {
            // Tắt kích hoạt các loại miễn giảm trong hiệu lực
            if (dt.isHoan == 0) {
                return app.model.svDsMienGiamHoan.create({ mssv, doiTuong: dt.loaiMienGiam, staffHandle: staffEmail, timeStart: now, lyDo });
            } else {
                return;
            }
        }));
    };

    app.model.svDsMienGiamHoan.kichHoatMienGiam = async (mssv, staffEmail, lopMoi) => {
        //Lấy dữ liệu miễn giảm của sinh viên tại thời điểm đang xét
        const [dsmg, lop, sinhVien] = await Promise.all([
            app.model.svDsMienGiam.searchPage(1, 1000, '', app.utils.stringify({ ks_mssv: mssv })).then(value => value.rows[0]),
            app.model.dtLop.get({ maLop: lopMoi }),
            app.model.fwStudent.get({ mssv }),
        ]);
        const loaiMg = dsmg ? app.utils.parse(dsmg.dataMienGiam) : [];
        const now = Date.now();
        // Duyệt qua các loại miễn giảm sv được hưởng
        await Promise.all(loaiMg.map(async dt => {
            // Nếu như đã bị hoãn thì tái kích hoạt
            if (dt.isHoan == 1) {
                await app.model.svDsMienGiamHoan.update({
                    statement: 'mssv = :mssv and doiTuong = :doiTuong and timeEnd is null',
                    parameter: { mssv, doiTuong: dt.loaiMienGiam }
                },
                    { timeEnd: now, staffHandle: staffEmail });
            }
            if (lop != null && dt.thoiGian == 'TK') {
                const namKetThuc = lop.nienKhoa?.split('-').map(nam => parseInt(nam))[1] || sinhVien.namTuyenSinh + 4;
                const dateNhapHoc = sinhVien.ngayNhapHoc ? new Date(sinhVien.ngayNhapHoc) : new Date(sinhVien.namTuyenSinh);
                const endOfCourse = new Date(namKetThuc, dateNhapHoc.getMonth(), dateNhapHoc.getDate()).getTime();
                await app.model.svDsMienGiam.update({ mssv, qdId: dt.mienGiamId }, { timeEnd: endOfCourse });
            }
        }));
    };
};