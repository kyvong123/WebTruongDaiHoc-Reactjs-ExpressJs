module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3038: { title: 'Đơn vị đánh giá cá nhân', link: '/user/tccb/danh-gia-ca-nhan-form', icon: 'fa-user', backgroundColor: '#fecc2c', groupIndex: 6 }
        }
    };

    const menuUser = {
        parentMenu: app.parentMenu.user,
        menus: {
            1004: { title: 'Đánh giá cá nhân', link: '/user/info/danh-gia-ca-nhan', icon: 'fa-pencil', backgroundColor: '#fecc2c', groupIndex: 6 }
        }
    };

    app.permission.add(
        { name: 'manager:login', menu },
        { name: 'staff:login', menu: menuUser }
    );

    // APIs ----------------------------------------------------------------------------------------------------
    app.get('/user/tccb/danh-gia-ca-nhan-form', app.permission.check('manager:login'), app.templates.admin);
    app.get('/user/tccb/danh-gia-ca-nhan-form/:nam', app.permission.check('manager:login'), app.templates.admin);
    app.get('/user/tccb/danh-gia-chuyen-vien/:nam/:shcc', app.permission.check('manager:login'), app.templates.admin);
    app.get('/user/tccb/danh-gia-giang-day/:nam/:shcc', app.permission.check('manager:login'), app.templates.admin);
    app.get('/user/tccb/danh-gia-khong-giang-day/:nam/:shcc', app.permission.check('manager:login'), app.templates.admin);

    app.get('/user/info/danh-gia-ca-nhan', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/info/danh-gia-chuyen-vien/:nam', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/info/danh-gia-giang-day/:nam', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/info/danh-gia-khong-giang-day/:nam', app.permission.check('staff:login'), app.templates.admin);

    app.get('/api/tccb/danh-gia-khung-danh-gia-can-bo/all-by-year', app.permission.check('staff:login'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam);
            const items = await app.model.tccbKhungDanhGiaCanBo.getAll({ nam }, '*', 'thuTu ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-ca-nhan-form/page/:pageNumber/:pageSize', app.permission.check('manager:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                nam = Number(req.query.nam),
                filter = req.query.filter ? req.query.filter : { filterLoaiCanBo: 'Tất cả' };
            filter.filterDonVi = req.session.user.maDonVi;
            const [dmCongViec, dmDonVi] = await Promise.all([
                app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0),
                app.model.dmDonVi.get({ ma: req.session.user.maDonVi })
            ]);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => prev + cur.maChucDanh, '').split(',');
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhGiaCaNhanDangKy.searchPageForm(_pageNumber, _pageSize, searchTerm, JSON.stringify(filter));
            res.send({
                page: {
                    totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: list.map(item => {
                        let loaiCanBo = 'Giảng viên và nghiên cứu viên tham gia giảng dạy';
                        if (item.ngach == '01.003') {
                            loaiCanBo = 'Chuyên viên';
                        } else if (listNgachNcvKhongGiangDay.includes(item.ngach)) {
                            loaiCanBo = 'Nghiên cứu viên không tham gia giảng dạy';
                        }
                        return { ...item, loaiCanBo };
                    }),
                    tenDonVi: dmDonVi.ten,
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/hoi-dong-danh-gia-don-vi-ca-nhan-form/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGia:unitCouncil'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                nam = Number(req.query.nam),
                filter = req.query.filter ? req.query.filter : { filterLoaiCanBo: 'Tất cả', filterDonVi: 'Tất cả' };
            if (!filter.filterDonVi) filter.filterDonVi = 'Tất cả';
            const result = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const items = result.rows || [];
            const listNgachNcvKhongGiangDay = items.reduce((prev, cur) => prev + cur.maChucDanh, '').split(',');
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhGiaCaNhanDangKy.searchPageForm(_pageNumber, _pageSize, searchTerm, JSON.stringify(filter));
            res.send({
                page: {
                    totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: list.map(item => {
                        let loaiCanBo = 'Giảng viên và nghiên cứu viên tham gia giảng dạy';
                        if (item.ngach == '01.003') {
                            loaiCanBo = 'Chuyên viên';
                        } else if (listNgachNcvKhongGiangDay.includes(item.ngach)) {
                            loaiCanBo = 'Nghiên cứu viên không tham gia giảng dạy';
                        }
                        return { ...item, loaiCanBo };
                    })
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia-chuyen-vien', app.permission.orCheck('manager:login', 'tccbDanhGia:unitCouncil'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam), shcc = req.query.shcc;
            let [danhGiaNam, canBo] = await Promise.all([
                await app.model.tccbDanhGiaNam.get({ nam }),
                app.model.tchcCanBo.get({ shcc })
            ]);
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => {
                prev.push(...(cur.maChucDanh || '').split(','));
                return prev;
            }, []);
            const donVi = await app.model.dmDonVi.get({ ma: canBo.maDonVi });
            if (canBo.ngach == '01.003') {
                canBo = {
                    ho: canBo.ho,
                    ten: canBo.ten,
                    shcc,
                    donVi: donVi.ten,
                    ngach: 'Chuyên viên'
                };
                let [formChuyenVien, data] = await Promise.all([
                    app.model.tccbDanhGiaFormChuyenVienParent.getAllByYear(nam),
                    app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(shcc, nam)
                ]);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: itemsDanhGiaChuyenVien } = data;
                if (formChuyenVien.length == 0) {
                    return res.send({ canBo, items: [] });
                }
                let itemsChuyenMon = formChuyenVien.map(form => {
                    let submenus = [];
                    if (form.loaiCongViec == 0) {
                        submenus = form.submenus.map(menu => {
                            let index = itemsDanhGiaChuyenVien.findIndex(item => item.loaiCongViec == 0 && item.idFormChuyenVien == menu.id);
                            if (index == -1) {
                                delete menu.parentId;
                                delete menu.thuTu;
                                return {
                                    ...menu,
                                    id: null,
                                    idFormChuyenVien: menu.id,
                                };
                            }
                            return {
                                tieuDe: menu.tieuDe,
                                ...itemsDanhGiaChuyenVien[index],
                            };
                        });
                        return {
                            ...form,
                            submenus
                        };
                    }
                    submenus = itemsDanhGiaChuyenVien.filter(item => item.idFormChuyenVien == form.id);
                    return {
                        ...form,
                        submenus
                    };
                });
                itemsChuyenMon = itemsChuyenMon.map(item => ({
                    ...item,
                    total: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemLonNhat || 0), 0)).toFixed(2),
                    totalTuDanhGia: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemTuDanhGia || 0), 0)).toFixed(2),
                    totalDonVi: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemDonVi || 0), 0)).toFixed(2),
                }));
                let itemsDanhGiaDiemThuong = tccbDanhGiaCaNhanDiemThuong.map(item => ({ ...item, loaiCongViec: 2 })),
                    itemsDanhGiaDiemTru = tccbDanhGiaCaNhanDiemTru.map(item => ({ ...item, loaiCongViec: 3 }));
                res.send({ canBo, items: [itemsChuyenMon, itemsDanhGiaDiemThuong, itemsDanhGiaDiemTru].reduce((prev, cur) => prev.concat(cur)), danhGiaNam });
            }
            else if (listNgachNcvKhongGiangDay.includes(canBo.ngach)) {
                // TODO: NV NCKH
                canBo = {
                    ho: canBo.ho,
                    ten: canBo.ten,
                    shcc,
                    donVi: donVi.ten
                };
                const data = await app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(canBo.shcc, nam);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: nhiemVuKhac } = data;
                res.send({ nhiemVuKhac, diemThuong: tccbDanhGiaCaNhanDiemThuong, diemTru: tccbDanhGiaCaNhanDiemTru, danhGiaNam, canBo });
            } else {
                // TODO: NV giảng dạy Đào tạo, đào tạo sau đại học, NCKH
                canBo = {
                    ho: canBo.ho,
                    ten: canBo.ten,
                    shcc,
                    donVi: donVi.ten
                };
                const data = await app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(canBo.shcc, nam);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: nhiemVuKhac } = data;
                res.send({ nhiemVuKhac, diemThuong: tccbDanhGiaCaNhanDiemThuong, diemTru: tccbDanhGiaCaNhanDiemTru, danhGiaNam, canBo });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    //API cho hội đồng đơn vị
    app.put('/api/tccb/hoi-dong-don-vi/duyet-diem-thuong', app.permission.check('tccbDanhGia:unitCouncil'), async (req, res) => {
        try {
            const userTccbDonViNam = req.session.user.tccbDonViNam || [];
            const id = req.body.id, changes = req.body.changes;
            let { duyet } = changes;
            duyet = parseInt(duyet);
            const item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id });
            if (!item) {
                throw 'Dữ liệu không hợp lệ!';
            }

            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: item.nam });
            if (!danhGiaNam) {
                throw 'Năm đánh giá không hợp lệ!';
            }
            const currentDate = new Date().getTime();
            const isDanhGia = danhGiaNam.donViBatDauDanhGia && danhGiaNam.donViKetThucDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia && currentDate <= danhGiaNam.donViKetThucDanhGia;

            if (!isDanhGia) {
                throw 'Thời gian đánh giá không phù hợp';
            }

            if (!userTccbDonViNam.includes(item.nam)) {
                throw 'Bạn không có quyền đánh giá trong năm này';
            }

            const result = await app.model.tccbDanhGiaCaNhanDiemThuong.update({ id }, { duyet });
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    //Api dành cho User
    app.get('/api/tccb/danh-gia-chuyen-vien-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam), user = req.session.user;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => {
                prev.push(...(cur.maChucDanh || '').split(','));
                return prev;
            }, []);
            if (user.ngach == '01.003') { // Chuyên viên
                const [formChuyenVien, data] = await Promise.all([
                    app.model.tccbDanhGiaFormChuyenVienParent.getAllByYear(nam),
                    app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(user.shcc, nam)
                ]);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: itemsDanhGiaChuyenVien } = data;
                if (formChuyenVien.length == 0) {
                    return res.send({ items: [] });
                }

                let itemsChuyenMon = formChuyenVien.map(form => {
                    let submenus = [];
                    if (form.loaiCongViec == 0) {
                        submenus = form.submenus.map(menu => {
                            let index = itemsDanhGiaChuyenVien.findIndex(item => item.loaiCongViec == 0 && item.idFormChuyenVien == menu.id);
                            if (index == -1) {
                                delete menu.parentId;
                                delete menu.thuTu;
                                return {
                                    ...menu,
                                    id: null,
                                    idFormChuyenVien: menu.id,
                                };
                            }
                            return {
                                tieuDe: menu.tieuDe,
                                ...itemsDanhGiaChuyenVien[index],
                            };
                        });
                        return {
                            ...form,
                            submenus
                        };
                    }
                    submenus = itemsDanhGiaChuyenVien.filter(item => item.idFormChuyenVien == form.id);
                    return {
                        ...form,
                        submenus
                    };
                });
                itemsChuyenMon = itemsChuyenMon.map(item => ({
                    ...item,
                    total: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemLonNhat || 0), 0)).toFixed(2),
                    totalTuDanhGia: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemTuDanhGia || 0), 0)).toFixed(2),
                    totalDonVi: Number(item.submenus.reduce((prev, cur) => prev + Number(cur.diemDonVi || 0), 0)).toFixed(2),
                }));
                let itemsDanhGiaDiemThuong = tccbDanhGiaCaNhanDiemThuong.map(item => ({ ...item, loaiCongViec: 2 })),
                    itemsDanhGiaDiemTru = tccbDanhGiaCaNhanDiemTru.map(item => ({ ...item, loaiCongViec: 3 }));
                res.send({ items: [itemsChuyenMon, itemsDanhGiaDiemThuong, itemsDanhGiaDiemTru].reduce((prev, cur) => prev.concat(cur)), danhGiaNam });
            } else if (listNgachNcvKhongGiangDay.includes(user.ngach)) {
                // TODO: nhiệm vụ NCKH
                const data = await app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(user.shcc, nam);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: nhiemVuKhac } = data;
                res.send({ nhiemVuKhac, diemThuong: tccbDanhGiaCaNhanDiemThuong, diemTru: tccbDanhGiaCaNhanDiemTru, danhGiaNam });
            } else {
                // TODO: NV giảng dạy Đào tạo, đào tạo sau đại học, nhiệm vụ NCKH
                const data = await app.model.tccbDanhGiaChuyenVien.getDataChuyenVien(user.shcc, nam);
                const { tccbDanhGiaCaNhanDiemThuong, tccbDanhGiaCaNhanDiemTru, rows: nhiemVuKhac } = data;
                res.send({ nhiemVuKhac, diemThuong: tccbDanhGiaCaNhanDiemThuong, diemTru: tccbDanhGiaCaNhanDiemTru, danhGiaNam });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};