module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7044: {
                title: 'Kiểm tra mã loại đăng ký', link: '/user/dao-tao/kiem-tra-ma-loai-dky',
                groupIndex: 1, parentKey: 7029,
                icon: 'fa-check-square-o', backgroundColor: '#FF0060'
            }
        }
    };
    app.permission.add(
        { name: 'dtKiemTraMaLoaiDangKy:manage', menu },
        { name: 'dtKiemTraMaLoaiDangKy:write' },
        { name: 'dtKiemTraMaLoaiDangKy:delete' },
    );

    app.get('/user/dao-tao/kiem-tra-ma-loai-dky', app.permission.check('dtKiemTraMaLoaiDangKy:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/kiem-tra-ma-loai-dang-ky', app.permission.check('dtKiemTraMaLoaiDangKy:manage'), async (req, res) => {
        try {
            let { filter } = req.query || {},
                listHocPhan = await app.model.dtDangKyHocPhan.kiemTraMaLoaiDky(app.utils.stringify(filter));
            listHocPhan = listHocPhan.rows;
            res.send({ listHocPhan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/kiem-tra-ma-loai-dang-ky', app.permission.check('dtKiemTraMaLoaiDangKy:write'), async (req, res) => {
        try {
            let { maHocPhan, mssv, maLoaiDky, ghiChu } = req.body.filter, user = req.session.user, listCheck = [],
                hocPhanDangKy = await app.model.dtDangKyHocPhan.get({ maHocPhan, mssv });
            if (hocPhanDangKy) {
                let monHoc = await app.model.dmMonHoc.get({ ma: hocPhanDangKy.maMonHoc });
                await app.model.dtDangKyHocPhan.update({ maHocPhan, mssv }, {
                    maLoaiDky, modifier: user.email
                });

                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan,
                    userModified: user.email.split('@')[0], timeModified: Date.now(),
                    thaoTac: 'U', namHoc: hocPhanDangKy.namHoc, hocKy: hocPhanDangKy.hocKy,
                    tenMonHoc: app.utils.parse(monHoc?.ten, { vi: '' })?.vi, ghiChu
                });

                await app.model.dtDangKyHocPhan.notify({ maHocPhan, mssv, thaoTac: 'U' });

                let check = {
                    mssv, maHocPhan, maMonHoc: hocPhanDangKy.maMonHoc,
                    tenMonHoc: monHoc.ten, tinChi: monHoc.tongTinChi, soTiet: monHoc.tongTiet,
                    namHoc: hocPhanDangKy.namHoc, hocKy: hocPhanDangKy.hocKy, status: 'C',
                    user: user.email, loaiDangKy: maLoaiDky
                };
                listCheck.push(check);
            }
            if (listCheck.length) await app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    const checkMaLoai = async ({ mssv, maHocPhan, namHoc, hocKy }) => {
        let [sinhVien, hocPhan] = await Promise.all([
            app.model.fwStudent.get({ mssv }, 'mssv, ho, ten, khoa, loaiHinhDaoTao, namTuyenSinh, lop'),
            app.model.dtThoiKhoaBieu.get({ maHocPhan }, 'id, maHocPhan, maMonHoc')
        ]), message = {
            hoTen: sinhVien.ho + ' ' + sinhVien.ten,
            newMaLoaiDky: null,
        };

        let chDiem = await app.model.dtCauHinhDiem.getAll(),
            chDiemRot = parseFloat((chDiem.filter(e => e.key == 'rotMon'))[0].value),
            chDiemCtMin = parseFloat((chDiem.filter(e => e.key == 'caiThienMin'))[0].value),
            chDiemCtMax = parseFloat((chDiem.filter(e => e.key == 'caiThienMax'))[0].value),
            caiThienHK = parseFloat((chDiem.filter(e => e.key == 'caiThienHK'))[0].value);

        let [listCTDT, listDiem] = await Promise.all([
            app.model.dtDangKyHocPhan.getListCtdt(app.utils.stringify({ mssvFilter: mssv })),
            app.model.dtDangKyHocPhan.checkDiem(app.utils.stringify({ mssv, namHoc, hocKy })),
        ]);
        listCTDT = listCTDT.rows;
        listDiem = listDiem.rows;

        //Check NCTDT, KH, NKH, HV
        if (listCTDT.length) {
            listCTDT = listCTDT.filter(ctdt => ctdt.maMonHoc == hocPhan.maMonHoc);//check môn học có trong ctdt không
            if (listCTDT.length == 1) {
                let monCTDT = listCTDT[0];

                //check trong-ngoai KH
                if (monCTDT.namHocDuKien == namHoc && monCTDT.hocKyDuKien == hocKy) {//check học phần có theo kế hoạch không
                    message.newMaLoaiDky = 'KH';
                } else if ((parseInt(monCTDT.namHocDuKien) == parseInt(namHoc) && monCTDT.hocKyDuKien > hocKy)
                    || (parseInt(monCTDT.namHocDuKien) > parseInt(namHoc))) {
                    message.newMaLoaiDky = 'HV';
                } else message.newMaLoaiDky = 'NKH';
            } else message.newMaLoaiDky = 'NCTDT';
        } else message.newMaLoaiDky = 'NCTDT';

        //check HL, CT
        const diemMon = listDiem.find(i => i.maMonHoc == hocPhan.maMonHoc);
        if (diemMon) {
            let { maxDiemTK, latestDiem, soonestNamHoc, soonestHocKy, isMienDiem, isDangKy, tinhTrangDiem } = diemMon,
                isCaiThien = false,
                isNotHasDiem = tinhTrangDiem == 1 || (isDangKy && (maxDiemTK == null || (latestDiem && isNaN(parseFloat(latestDiem)))));

            isMienDiem = Number(isMienDiem);

            if (isMienDiem) message.newMaLoaiDky = 'CT';
            else if (isNotHasDiem) message.newMaLoaiDky = 'HL';
            else {
                if (maxDiemTK && latestDiem && parseFloat(latestDiem) >= chDiemRot) {
                    maxDiemTK = parseFloat(maxDiemTK);
                    if (maxDiemTK >= chDiemRot && (maxDiemTK >= chDiemCtMax || maxDiemTK < chDiemCtMin)) {
                        isCaiThien = true;
                    } else if (maxDiemTK >= chDiemRot) {
                        let soHK = (parseInt(hocPhan.namHoc) - parseInt(soonestNamHoc)) * 2 + parseInt(hocPhan.hocKy) - parseInt(soonestHocKy);

                        if (soonestHocKy == 3) {
                            soHK = soHK + 1;
                        }

                        if (hocPhan.hocKy == 3 && soonestHocKy == 3) {
                            soHK = soHK - 1;
                        }

                        if (soHK > caiThienHK) {
                            isCaiThien = true;
                        }
                    }
                }

                if (isCaiThien) message.newMaLoaiDky = 'CT';
                else {
                    if (parseFloat(latestDiem) >= chDiemRot) message.newMaLoaiDky = 'CT';
                    else message.newMaLoaiDky = 'HL';
                }
            }
        }

        return message;
    };

    app.get('/api/dt/kiem-tra-ma-loai-dang-ky/hoc-phan', app.permission.check('dtKiemTraMaLoaiDangKy:manage'), async (req, res) => {
        try {
            const { maHocPhan, namHoc, hocKy } = req.query.data;

            const listDangKy = await app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'id, mssv, maHocPhan, namHoc, hocKy, maMonHoc, maLoaiDky', 'mssv');

            let items = [];
            res.send({ items });

            for (let [index, dk] of listDangKy.entries()) {
                const item = await checkMaLoai({ namHoc, hocKy, maHocPhan, mssv: dk.mssv });
                items.push({ ...dk, ...item });
                (index % 5 == 0) && app.io.to(req.session.user.email).emit('check-ma-loai-hoc-phan', { isDone: false, items, index });
            }

            app.io.to(req.session.user.email).emit('check-ma-loai-hoc-phan', { isDone: true, items });

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/kiem-tra-ma-loai-dang-ky/lop', app.permission.check('dtKiemTraMaLoaiDangKy:manage'), async (req, res) => {
        try {
            const { lop, namHoc, hocKy } = req.query.data;

            const listSv = await app.model.fwStudent.getAll({ lop }, 'mssv, ho,ten', 'mssv');
            let items = [];
            res.send({ items });

            for (let [index, sv] of listSv.entries()) {
                app.io.to(req.session.user.email).emit('check-ma-loai-lop', { isDone: false, items, index });
                const listDangKy = await app.model.dtDangKyHocPhan.getAll({ mssv: sv.mssv, namHoc, hocKy }, 'id, mssv, maHocPhan, namHoc, hocKy, maMonHoc, maLoaiDky', 'mssv');
                for (let dk of listDangKy) {
                    const item = await checkMaLoai({ namHoc, hocKy, maHocPhan: dk.maHocPhan, mssv: dk.mssv });
                    items.push({ ...dk, ...item });
                }
            }

            app.io.to(req.session.user.email).emit('check-ma-loai-lop', { isDone: true, items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/kiem-tra-ma-loai-dang-ky/multiple', app.permission.check('dtKiemTraMaLoaiDangKy:manage'), async (req, res) => {
        try {
            const { items } = req.body,
                { email } = req.session.user;
            if (items && items.length) {
                const listMonHoc = await app.model.dmMonHoc.getAll({});
                await Promise.all(items.flatMap(item => {
                    return [
                        app.model.dtDangKyHocPhan.update({ id: item.id }, { maLoaiDky: item.newMaLoaiDky, modifier: email }),
                        app.model.dtLichSuDkhp.create({ mssv: item.mssv, maHocPhan: item.maHocPhan, userModified: email.replace('@hcmussh.edu.vn', ''), timeModified: Date.now(), thaoTac: 'U', namHoc: item.namHoc, hocKy: item.hocKy, tenMonHoc: app.utils.parse(listMonHoc.find(mh => mh.ma == item.maMonHoc)?.ten || '{"vi":""}').vi }),
                    ];
                }));

                const listCheck = items.map(item => {
                    const monHoc = listMonHoc.find(mh => mh.ma == item.maMonHoc);
                    return {
                        mssv: item.mssv, maHocPhan: item.maHocPhan, maMonHoc: item.maMonHoc,
                        tenMonHoc: app.utils.parse(monHoc?.ten || '{"vi":""}').vi, tinChi: monHoc?.tongTinChi || 0, soTiet: monHoc?.tongTiet || 0,
                        namHoc: item.namHoc, hocKy: item.hocKy, status: 'C',
                        user: email, loaiDangKy: item.newMaLoaiDky,
                    };
                });
                app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};