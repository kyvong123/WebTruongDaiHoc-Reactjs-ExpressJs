module.exports = app => {
    const menuDotXetHocBongKkht = {
        parentMenu: app.parentMenu.students,
        menus: {
            6132: { title: 'Học bổng khuyến khích học tập', link: '/user/ctsv/hoc-bong-khuyen-khich', icon: 'fa-book', backgroundColor: '#ac2d34', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvDotXetHocBongKkht:manage', menu: menuDotXetHocBongKkht },
        { name: 'ctsvDotXetHocBongKkht:write' },
        { name: 'ctsvDotXetHocBongKkht:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDotXetHocBongKkht', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvDotXetHocBongKkht:manage', 'ctsvDotXetHocBongKkht:write', 'ctsvDotXetHocBongKkht:delete');
            resolve();
        } else resolve();
    }));


    app.get('/user/ctsv/hoc-bong-khuyen-khich', app.permission.check('ctsvDotXetHocBongKkht:manage'), app.templates.admin);
    app.get('/user/ctsv/hoc-bong-khuyen-khich/edit/:id', app.permission.check('ctsvDotXetHocBongKkht:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/hoc-bong-khuyen-khich/page/:pageNumber/:pageSize', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'tcHocBong:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            sort && app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] });
            let page = await app.model.svDotXetHocBongKkht.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/item/:id', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.svDotXetHocBongKkht.getData(id.toString());
            const { rows: [dotXetHocBongKkht], dsdieukien, dsnhom } = data;
            if (!dotXetHocBongKkht) throw 'Không tìm thấy đợt xét học bổng khuyến khích';
            dsdieukien.length && dsdieukien.forEach(dieuKien => {
                dieuKien.dsNhom = dsnhom.filter(nhom => nhom.idDieuKien == dieuKien.id).map(nhom => ({ ...nhom, dsNganh: JSON.parse(nhom.dsNganh), dsKhoa: JSON.parse(nhom.dsKhoa) }));
            });
            res.send({ data: { ...dotXetHocBongKkht, dsDieuKien: dsdieukien } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/hoc-bong-khuyen-khich', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            let data = req.body.item;
            data.staffHandle = req.session.user.email;
            data.timeModified = Date.now();
            const { namHoc, hocKy } = data;
            const recentDot = await app.model.svDotXetHocBongKkht.get({ namHoc, hocKy }, 'id');
            if (recentDot) {
                res.send({ error: `Đã tồn tại đợt xét học bổng cho năm học ${namHoc} học kỳ ${hocKy}` });
            } else {
                const item = await app.model.svDotXetHocBongKkht.create(data);
                if (item) {
                    // 
                    for (const dieuKien of (data.dsDieuKienXet || [])) {
                        const { ten, khoaSinhVien, heDaoTao, tongKinhPhi, dsNhom, loaiDieuKien } = dieuKien;
                        const itemDieuKien = await app.model.svDieuKienXetHocBong.create({
                            ten,
                            idDot: item.id,
                            kinhPhi: tongKinhPhi,
                            khoaSinhVien: khoaSinhVien.toString(),
                            heDaoTao: heDaoTao.toString(),
                            loaiDieuKien: loaiDieuKien
                        });
                        if (itemDieuKien) {
                            if (loaiDieuKien == 0) {
                                for (const nhomKhoa of dsNhom) {
                                    const { tenNhom, tongKinhPhi, dsKhoa, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomKhoa;
                                    const nhom = await app.model.svHocBongNhom.create({
                                        tenNhom: tenNhom,
                                        kinhPhi: tongKinhPhi,
                                        loaiNhom: 0,
                                        idDieuKien: itemDieuKien.id,
                                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                                    });
                                    if (nhom) {
                                        for (const khoa of dsKhoa) {
                                            await app.model.svHocBongKhoa.create({
                                                ...khoa,
                                                kinhPhi: khoa.kinhPhiKhoa,
                                                idNhom: nhom.id,
                                                soLuongSv: khoa.soLuongSinhVienKhoa,
                                                hocBongXuatSac, hocBongGioi, hocBongKha
                                            });
                                        }
                                    }
                                }
                            } else {
                                for (const nhomNganh of dsNhom) {
                                    const { tenNhom, tongKinhPhi, dsNganh, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomNganh;
                                    const nhom = await app.model.svHocBongNhom.create({
                                        tenNhom: tenNhom,
                                        kinhPhi: tongKinhPhi,
                                        loaiNhom: 1,
                                        idDieuKien: itemDieuKien.id,
                                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                                    });
                                    if (nhom) {
                                        for (const nganh of dsNganh) {
                                            await app.model.svHocBongNganh.create({
                                                ...nganh,
                                                maNganh: nganh.idNganh,
                                                kinhPhi: nganh.kinhPhiNganh,
                                                idNhom: nhom.id,
                                                soLuongSv: nganh.soLuongSinhVienNganh,
                                                hocBongXuatSac, hocBongGioi, hocBongKha
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                res.send({ item });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/hoc-bong-khuyen-khich/update-cau-hinh', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            let { idDot, changes } = req.body;
            changes.staffHandle = req.session.user.email;
            changes.timeModified = Date.now();
            const { namHoc, hocKy } = changes;
            const recentDot = await app.model.svDotXetHocBongKkht.get({ namHoc, hocKy }, 'id');
            if (recentDot && recentDot.id != idDot) {
                res.send({ error: `Đã tồn tại đợt xét học bổng cho năm học ${namHoc} học kỳ ${hocKy}` });
            } else {
                const dsDieuKien = await app.model.svDieuKienXetHocBong.getAll({ idDot }, 'id');
                const dsNhomCauHinh = await app.model.svHocBongNhom.getAll({
                    statement: 'idDieuKien in (:listDieuKien)',
                    parameter: {
                        listDieuKien: dsDieuKien.length ? dsDieuKien.map(dk => dk.id) : ['-1']
                    }
                }, 'id');
                await Promise.all([
                    app.model.svHocBongKhoa.delete({
                        statement: 'idNhom in (:listNhom)',
                        parameter: {
                            listNhom: dsNhomCauHinh.length ? dsNhomCauHinh.map(nhom => nhom.id) : ['-1']
                        }
                    }),
                    app.model.svHocBongNganh.delete({
                        statement: 'idNhom in (:listNhom)',
                        parameter: {
                            listNhom: dsNhomCauHinh.length ? dsNhomCauHinh.map(nhom => nhom.id) : ['-1']
                        }
                    }),
                    app.model.svHocBongNhom.delete({
                        statement: 'idDieuKien in (:listDieuKien)',
                        parameter: {
                            listDieuKien: dsDieuKien.length ? dsDieuKien.map(nhom => nhom.id) : ['-1']
                        }
                    }),
                    app.model.svDieuKienXetHocBong.delete({ idDot })
                ]);
                const item = await app.model.svDotXetHocBongKkht.update({ id: idDot }, changes);
                if (item && changes.dsDieuKienXet) {
                    for (const dieuKien of changes.dsDieuKienXet) {
                        const { ten, khoaSinhVien, heDaoTao, tongKinhPhi, dsNhom, loaiDieuKien } = dieuKien;
                        const itemDieuKien = await app.model.svDieuKienXetHocBong.create({
                            ten,
                            idDot: item.id,
                            kinhPhi: tongKinhPhi,
                            khoaSinhVien: Array.isArray(khoaSinhVien) ? khoaSinhVien.toString() : khoaSinhVien,
                            heDaoTao: Array.isArray(heDaoTao) ? heDaoTao.toString() : heDaoTao,
                            loaiDieuKien: loaiDieuKien
                        });
                        if (itemDieuKien) {
                            if (loaiDieuKien == 0) {
                                for (const nhomKhoa of dsNhom) {
                                    const { tenNhom, tongKinhPhi, dsKhoa, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomKhoa;
                                    const nhom = await app.model.svHocBongNhom.create({
                                        tenNhom: tenNhom,
                                        kinhPhi: tongKinhPhi,
                                        loaiNhom: 0,
                                        idDieuKien: itemDieuKien.id,
                                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                                    });
                                    if (nhom) {
                                        for (const khoa of dsKhoa) {
                                            await app.model.svHocBongKhoa.create({
                                                ...khoa,
                                                kinhPhi: khoa.kinhPhiKhoa,
                                                idNhom: nhom.id,
                                                soLuongSv: khoa.soLuongSinhVienKhoa,
                                                hocBongXuatSac, hocBongGioi, hocBongKha
                                            });
                                        }
                                    }
                                }
                            } else {
                                for (const nhomNganh of dsNhom) {
                                    const { tenNhom, tongKinhPhi, dsNganh, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomNganh;
                                    const nhom = await app.model.svHocBongNhom.create({
                                        tenNhom: tenNhom,
                                        kinhPhi: tongKinhPhi,
                                        loaiNhom: 1,
                                        idDieuKien: itemDieuKien.id,
                                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                                    });
                                    if (nhom) {
                                        for (const nganh of dsNganh) {
                                            await app.model.svHocBongNganh.create({
                                                ...nganh,
                                                maNganh: nganh.idNganh,
                                                kinhPhi: nganh.kinhPhiNganh,
                                                idNhom: nhom.id,
                                                soLuongSv: nganh.soLuongSinhVienNganh,
                                                hocBongXuatSac, hocBongGioi, hocBongKha
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                res.end();
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-hoc-bong-tu-dong/page/:pageNumber/:pageSize', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let page = await app.model.svDotXetHocBongKkht.dsTuDongSearchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // app.post('/api/ctsv/dssv-dot-danh-gia-drl', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
    //     try {
    //         let data = req.body.item;
    //         await app.model.svDssvDotXetHocBongKkht.create(data);
    //         res.end();
    //     } catch (error) {
    //         app.consoleError(req, error);
    //         res.send({ error });
    //     }
    // });

    // app.put('/api/ctsv/dssv-dot-danh-gia-drl', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
    //     try {
    //         let id = req.body.id,
    //             item = req.body.changes;
    //         let changes = {
    //             kichHoat: item.kichHoat,
    //             modifier: req.session.user.email,
    //             timeModified: Date.now(),
    //         };
    //         let items = await app.model.svDssvDotXetHocBongKkht.update({ id }, changes);
    //         item.kichHoat = items.kichHoat;
    //         res.send({ item });
    //     } catch (error) {
    //         app.consoleError(req, error);
    //         res.send({ error });
    //     }
    // });

    app.get('/api/ctsv/dssv-hoc-bong/page/:pageNumber/:pageSize', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let page = await app.model.svDssvHocBongKkht.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/hoc-bong-khuyen-khich/delete', app.permission.check('ctsvDotXetHocBongKkht:delete'), async (req, res) => {
        try {
            let { idDot } = req.body;
            const dsDieuKien = await app.model.svDieuKienXetHocBong.getAll({ idDot }, 'id');
            const dsNhomCauHinh = await app.model.svHocBongNhom.getAll({
                statement: 'idDieuKien in (:listDieuKien)',
                parameter: {
                    listDieuKien: dsDieuKien.length ? dsDieuKien.map(dk => dk.id) : ['-1']
                }
            }, 'id');
            await Promise.all([
                app.model.svHocBongKhoa.delete({
                    statement: 'idNhom in (:listNhom)',
                    parameter: {
                        listNhom: dsNhomCauHinh.length ? dsNhomCauHinh.map(nhom => nhom.id) : ['-1']
                    }
                }),
                app.model.svHocBongNganh.delete({
                    statement: 'idNhom in (:listNhom)',
                    parameter: {
                        listNhom: dsNhomCauHinh.length ? dsNhomCauHinh.map(nhom => nhom.id) : ['-1']
                    }
                }),
                app.model.svHocBongNhom.delete({
                    statement: 'idDieuKien in (:listDieuKien)',
                    parameter: {
                        listDieuKien: dsDieuKien.length ? dsDieuKien.map(nhom => nhom.id) : ['-1']
                    }
                }),
                app.model.svDieuKienXetHocBong.delete({ idDot }),
                app.model.svDotXetHocBongKkht.delete({ id: idDot })
            ]);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-hoc-bong/nhom', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { idNhom, filter } = req.query;
            const data = await app.model.svHocBongNhom.getDsSinhVien(idNhom, app.utils.stringify(filter));
            res.send({ items: data.rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/phan-muc-tu-dong', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { filter, tongKinhPhi } = req.query;
            const items = await app.model.svDieuKienXetHocBong.countSinhVien(app.utils.stringify(filter));
            if (items) {
                const { rows } = items;
                if (rows.length) {
                    const tongSinhVien = rows.reduce((init, item) => init + Number(item.soLuongSinhVien), 0);
                    const result = rows.map(item => ({
                        ...item,
                        kinhPhiHocBong: Math.round((Number(tongKinhPhi) / Number(tongSinhVien)) * Number(item.soLuongSinhVien))
                    }));
                    res.send({ items: result });
                }
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/thong-ke', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { filter } = req.query;
            const items = await app.model.svDotXetHocBongKkht.getThongKeData(app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-hoc-bong/dieu-kien', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { idDieuKien } = req.query;
            // let result = [];
            // for (let i = 0; i < listIdQuery.length; i++) {
            //     const data = await app.model.svHocBongNhom.getDsSinhVien(listIdQuery[i]);
            //     result = [...result, ...data.rows];
            // }
            const result = await app.model.svHocBongNhom.getDsSinhVien(idDieuKien).then(value => value.rows);
            res.send({ items: result });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // app.get('/api/ctsv/lich-su-hbkk/dssv', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
    //     try {
    //         const { id, filter, listIdQuery } = req.query;
    //         const { rows: result } = await app.model.svLichSuDssvDieuKienHbkk.getDssv(id, app.utils.stringify(filter));
    //         let dsDatDieuKien = [];
    //         if (listIdQuery && listIdQuery.length) {
    //             for (let i = 0; i < listIdQuery.length; i++) {
    //                 const data = await app.model.svHocBongNhom.getDsSinhVienDatDieuKien(listIdQuery[i], id);
    //                 dsDatDieuKien = [...dsDatDieuKien, ...data.rows];
    //             }
    //         }
    //         // dsDatDieuKien = dsDatDieuKien.filter(item => !result.some(sv => sv.mssv == item.mssv));
    //         res.send({ items: result, dsDatDieuKien });
    //     } catch (error) {
    //         app.consoleError(req, error);
    //         res.send({ error });
    //     }
    // });

    app.delete('/api/ctsv/lich-su-hbkk/dssv/delete-sinh-vien', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svDssvHocBongKkht.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-hoc-bong/download-excel', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            let { listIdQuery } = req.query;
            listIdQuery = JSON.parse(listIdQuery);
            let result = [];
            for (let i = 0; i < listIdQuery.length; i++) {
                const data = await app.model.svHocBongNhom.getDsSinhVien(listIdQuery[i]);
                result = [...result, ...data.rows];
            }
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SV_HOC_BONG_KKHT');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ TÊN', key: 'hoTen', width: 20 },
                { header: 'KHOA', key: 'khoa', width: 15 },
                { header: 'NGÀNH', key: 'nganh', width: 15 },
                { header: 'HỌC BỔNG', key: 'hocBong', width: 15 },
                { header: 'LOẠI HỌC BỔNG', key: 'loaiHocBong', width: 15 }
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };

            result.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    mssv: item.mssv,
                    hoTen: item.hoTen,
                    khoa: item.tenKhoa,
                    nganh: item.tenNganh,
                    hocBong: item.tienHocBong,
                    loaiHocBong: item.loaiHocBong
                }, 'i');
            });
            const fileName = 'DS_SV_HOC_BONG.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};