// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtNgoaiNguKhongChuyen.foo = async () => { };
    app.model.dtNgoaiNguKhongChuyen.checkTinhTrang = async ({ mssv, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao, semester, idDot }) => {

        let namHocBefore = namHoc, hocKyBefore = hocKy;
        if (hocKy == 1) {
            const tmp = Number(namHocBefore.substring(0, 4));
            namHocBefore = `${tmp - 1} - ${tmp}`;
            hocKyBefore = 3;
        } else hocKyBefore = hocKyBefore - 1;

        let [listNgoaiNgu, condition, { rows: list }, isMien] = await Promise.all([
            app.model.dtNgoaiNguKhongChuyen.getAll({ khoaSinhVien, loaiHinhDaoTao }),
            app.model.dtNgoaiNguKhongChuyenCondition.get({
                statement: 'khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao = :loaiHinhDaoTao AND ((semesterEnd IS NULL AND semesterFrom <= :semester) OR (:semester BETWEEN semesterFrom AND semesterEnd))',
                parameter: { semester, khoaSinhVien, loaiHinhDaoTao }
            }),
            app.model.dtNgoaiNguKhongChuyen.tinhTrang(app.utils.stringify({ mssv, namHoc, hocKy, namHocBefore, hocKyBefore })),
            app.model.dtDssvTrongDotDkhp.get({ idDot, mssv, isMienNgoaiNgu: 1 }),
        ]);

        if (list.length) {
            if (condition) {
                const { isDangKy, nhomNgoaiNgu, diemDat, ctdtDangKy, tongSoTinChi, khoiKienThuc, isChungChi, isJuniorStudent, nhomNgoaiNguMien, diemMien } = condition,
                    item = list[0];
                let status = 0;

                const listDiem = item.listDiem ? app.utils.parse(item.listDiem) : [],
                    monHocDangKy = item.monHocDangKy ? item.monHocDangKy.split(',') : [];

                if (item.isMien || isMien) status = 1;
                if (!status) {
                    if (isChungChi && (item.isDangKy || item.isChungChi || item.isJuniorStudent)) status = 1;
                    else if (isJuniorStudent && item.isJuniorStudent) status = 1;
                }

                if (!status && nhomNgoaiNguMien) {
                    const listMonHoc = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNguMien).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                    status = diemMien ? (listMonHoc && listMonHoc.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemMien)) ? 1 : 0) : (listMonHoc.length ? 1 : 0);
                }

                if (isDangKy && !status) {
                    if (nhomNgoaiNgu) {
                        const isPass = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNgu).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                        status = diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 1 : 0) : (isPass.length ? 1 : 0);
                    } else {
                        const listMon = listNgoaiNgu.map(nn => nn.maMonHoc),
                            isPass = listDiem.filter(diem => listMon.includes(diem.maMonHoc)),
                            hasDky = monHocDangKy.find(mh => listMon.includes(mh));
                        status = hasDky ? (diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 1 : 0) : 1) : 0;
                    }
                }

                return status ? { status } : { status, ctdtDangKy, tongSoTinChi, khoiKienThuc };
            } else return { status: 1 };
        } else return { status: 1 };
    };
};