module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7042: {
                title: 'Đăng ký học phần cũ', link: '/user/dao-tao/dang-ky-cu',
                groupIndex: 1, parentKey: 7029,
                icon: 'fa-eraser', backgroundColor: '#4F709C'
            }
        }
    };
    app.permission.add(
        { name: 'dtDangKyHocPhanCu:manage', menu },
        { name: 'dtDangKyHocPhanCu:write' },
        { name: 'dtDangKyHocPhanCu:delete' },
    );

    app.get('/user/dao-tao/dang-ky-cu', app.permission.check('dtDangKyHocPhanCu:manage'), app.templates.admin);

    // app.permissionHooks.add('staff', 'addRolesDtDangKyHocPhanCu', (user, staff) => new Promise(resolve => {
    //     if (staff.maDonVi && staff.maDonVi == '33') {
    //         app.permissionHooks.pushUserPermission(user, 'dtDangKyHocPhanCu:manage', 'dtDangKyHocPhanCu:write', 'dtDangKyHocPhanCu:delete');
    //         resolve();
    //     }
    //     else resolve();
    // }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dang-ky-cu/hoc-phan', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let { filter } = req.query,
                sort = filter?.sort || 'maHocPhan_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let items = await app.model.dtDangKyHocPhan.getDataCu(filter);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-cu/diem', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let { mssv, list } = req.query,
                items = [];
            for (let item of list) {
                let listDiem = await app.model.dtDiemAll.getAll({ mssv, maHocPhan: item.maHocPhan });
                if (listDiem.length) {
                    listDiem = listDiem.filter(e => e.loaiDiem != 'TK');
                    listDiem.map(e => {
                        return { ...e, tenMonHoc: item.tenMonHoc };
                    });
                    items.push(...listDiem);
                } else {
                    let listThanhPhan = await app.model.dtMonHocDiemThanhPhan.getAll({ maMonHoc: item.maMonHoc });
                    if (listThanhPhan.length) {
                        for (let thanhPhan of listThanhPhan) {
                            let data = {
                                mssv, maHocPhan: item.maHocPhan,
                                diem: '',
                                phanTramDiem: thanhPhan.phanTram, loaiDiem: thanhPhan.loaiThanhPhan,
                                namHoc: item.namHoc, hocKy: parseInt(item.hocKy),
                                maMonHoc: item.maMonHoc, tenMonHoc: item.tenMonHoc
                            };
                            items.push(data);
                        }
                    } else {
                        let dataGK = {
                            mssv, maHocPhan: item.maHocPhan,
                            diem: '', phanTramDiem: 30, loaiDiem: 'GK',
                            namHoc: item.namHoc, hocKy: parseInt(item.hocKy),
                            maMonHoc: item.maMonHoc, tenMonHoc: item.tenMonHoc
                        }, dataCK = {
                            mssv, maHocPhan: item.maHocPhan,
                            diem: '', phanTramDiem: 70, loaiDiem: 'CK',
                            namHoc: item.namHoc, hocKy: parseInt(item.hocKy),
                            maMonHoc: item.maMonHoc, tenMonHoc: item.tenMonHoc
                        };
                        items.push(...[dataCK, dataGK]);
                    }
                }
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dang-ky-cu/hoc-phan', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { mssv, list } = req.body, user = req.session.user,
                email = user.email.split('@');
            email = email[0];
            for (let item of list) {
                item.hocKy = parseInt(item.hocKy);
                let data = {
                    mssv, maHocPhan: item.maHocPhan,
                    modifier: user.email,
                    timeModified: Date.now(),
                    maMonHoc: item.maMonHoc,
                    tinhPhi: item.tinhPhi ? 1 : 0,
                    namHoc: item.namHoc,
                    hocKy: item.hocKy,
                    maLoaiDky: item.maLoaiDky,
                    loaiMonHoc: 1,
                };
                let listCu = await app.model.dtDangKyHocPhan.getAll({ mssv, maMonHoc: item.maMonHoc, namHoc: item.namHoc, hocKy: item.hocKy });
                if (!listCu.length) {
                    await app.model.dtDangKyHocPhan.create(data);
                    await app.model.dtLichSuDkhp.create({
                        mssv, maHocPhan: item.maHocPhan,
                        tenMonHoc: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi,
                        userModified: email,
                        timeModified: Date.now(),
                        thaoTac: 'A',
                        namHoc: item.namHoc,
                        hocKy: item.hocKy, ghiChu: 'Đăng ký học kỳ cũ'
                    });
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dang-ky-cu/diem', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { list } = req.body;
            for (let item of list) {
                await app.model.dtDiemAll.delete({ mssv: item.mssv, maHocPhan: item.maHocPhan });
                let avr = 0,
                    submenus = item.submenus;
                for (let sub of submenus) {
                    let data = {
                        mssv: item.mssv, maHocPhan: item.maHocPhan,
                        diem: sub.diem, phanTramDiem: sub.phanTramDiem, loaiDiem: sub.loaiDiem,
                        namHoc: item.namHoc, hocKy: item.hocKy, maMonHoc: item.maMonHoc
                    };
                    avr = avr + Number(sub.diem) * Number(sub.phanTramDiem);
                    await app.model.dtDiemAll.create(data);
                }
                avr = avr / 100;
                avr = avr.toFixed(2);
                let data = {
                    mssv: item.mssv, maHocPhan: item.maHocPhan,
                    diem: avr, loaiDiem: 'TK',
                    namHoc: item.namHoc, hocKy: item.hocKy, maMonHoc: item.maMonHoc
                };
                await app.model.dtDiemAll.create(data);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/dang-ky-cu/hoc-phan', app.permission.check('dtDangKyHocPhan:delete'), async (req, res) => {
        try {
            let { mssv, list } = req.body, user = req.session.user,
                email = user.email.split('@');
            email = email[0];
            for (let item of list) {
                item.hocKy = parseInt(item.hocKy);
                await app.model.dtDangKyHocPhan.delete({ mssv, maHocPhan: item.maHocPhan });
                await app.model.dtDiemAll.delete({ mssv, maHocPhan: item.maHocPhan });
                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan: item.maHocPhan,
                    tenMonHoc: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi,
                    userModified: email,
                    timeModified: Date.now(),
                    thaoTac: 'D',
                    namHoc: item.namHoc,
                    hocKy: item.hocKy, ghiChu: 'Hủy đăng ký học kỳ cũ'
                });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};