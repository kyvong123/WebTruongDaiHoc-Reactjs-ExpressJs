module.exports = app => {
    app.executeTask.genThuLaoGiangDay = async ({ namHoc, hocKy, email }) => {
        const chiaTiet = (soTietCanChia, soGiangVien) => {
            let soTietDu = parseInt(soTietCanChia) % parseInt(soGiangVien);
            let soTietCoBan = (soTietCanChia - soTietDu) / parseInt(soGiangVien);
            let result = [];
            for (let index = 0; index < soGiangVien; index++) {
                if (soTietDu > 0) {
                    result[index] = soTietCoBan + 1;
                    soTietDu--;
                } else {
                    result[index] = soTietCoBan;
                }

            }
            return result;
        };
        const createThuLao = async (namHoc, hocKy, idGiangVien, loaiHinhDaoTao, maHocPhan, soTietDuocChia, timeModified, modifier, idThoiKhoaBieu) => {
            const soLuongSinhVien = await app.model.dtDangKyHocPhan.getAll({ namHoc, maHocPhan }, 'id,maMonHoc');
            const { rows: result } = await app.model.dtThuLaoGiangDay.getInfoGiangVien(idGiangVien);
            const { ngach, hocHam, hocVi } = result[0];

            const getDonGia = await app.model.dtDmDonGiaGiangDay.get({ namHoc, heDaoTao: loaiHinhDaoTao });
            const donGia = getDonGia?.donGia || null;
            await app.model.dtThuLaoGiangDay.create({ idGiangVien, maHocPhan, donGia, loaiHinhDaoTao, thue: 10, soTietDuocChia, namHoc, hocKy, timeModified, modifier, idThoiKhoaBieu, soLuongSv: soLuongSinhVien.length, ngach, hocHam, hocVi, tinhPhi: 1 });
        };
        const { rows: duLieuTkb } = await app.model.dtThuLaoGiangDay.listAutoGen(namHoc, hocKy);
        const chunks = duLieuTkb.chunk(100);
        for (const chunk of chunks) {
            const timeModified = Date.now();
            const user = email;
            await Promise.all(chunk.map(async (tkbRow) => {
                const { id, maHocPhan, loaiHinhDaoTao: heDaoTao } = tkbRow;
                const objectGiangVien = {};
                const condition = {
                    statement: 'idThoiKhoaBieu = :id AND isNghi IS NULL AND isNgayLe IS NULL',
                    parameter: {
                        id
                    }
                };
                const duLieuTkbCustom = await app.model.dtThoiKhoaBieuCustom.getAll(condition);
                if (duLieuTkbCustom.length) {
                    for (const tkbCustom of duLieuTkbCustom) {
                        let { idThoiKhoaBieu, thoiGianBatDau, soTietBuoi: soTietCanChia } = tkbCustom;
                        const duLieuTkbGv = await app.model.dtThoiKhoaBieuGiangVien.getAll({ idThoiKhoaBieu, ngayBatDau: thoiGianBatDau });
                        const soGiangVien = duLieuTkbGv.length;
                        const listChiaTiet = chiaTiet(soTietCanChia, soGiangVien);
                        let index = 0;
                        if (soGiangVien) {
                            for (const rowGv of duLieuTkbGv) {
                                const { giangVien, type } = rowGv;

                                if (!objectGiangVien[giangVien]) {
                                    objectGiangVien[giangVien] = {};
                                    objectGiangVien[giangVien]['soTietDuocChia'] = listChiaTiet[index];
                                    objectGiangVien[giangVien]['type'] = type;
                                } else {
                                    objectGiangVien[giangVien]['soTietDuocChia'] = objectGiangVien[giangVien]['soTietDuocChia'] + listChiaTiet[index];
                                }
                                index++;
                            }
                        }
                    }
                }
                await Promise.all(Object.keys(objectGiangVien).map(async giangVien => {
                    await createThuLao(namHoc, hocKy, giangVien, heDaoTao, maHocPhan, objectGiangVien[giangVien].soTietDuocChia, timeModified, user, id);
                }));
            }));
        }
        await app.model.dtThuLaoGiangDay.gopHang(namHoc, hocKy);
        return {};
    };
};