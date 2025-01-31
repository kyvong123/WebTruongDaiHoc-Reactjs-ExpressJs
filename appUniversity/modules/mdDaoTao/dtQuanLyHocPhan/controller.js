module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7026: { title: 'Danh sách sinh viên', link: '/user/dao-tao/students', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 1 }
        }
    };

    app.permission.add(
        { name: 'dtQuanLyHocPhan:manage', menu },
        'dtQuanLyHocPhan:delete',
        'dtModifyHocPhan:write',
        'dtModifyHocPhan:delete',
        'dtQuanLyHocPhan:write'
    );

    app.permissionHooks.add('staff', 'addRolesDtQuanLyHocPhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtQuanLyHocPhan:manage', 'dtQuanLyHocPhan:delete', 'dtQuanLyHocPhan:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/students', app.permission.check('dtQuanLyHocPhan:manage'), app.templates.admin);
    app.get('/user/dao-tao/students/edit/:mssv', app.permission.check('dtQuanLyHocPhan:manage'), app.templates.admin);
    app.get('/user/dao-tao/ket-qua-dkhp', app.permission.check('dtModifyHocPhan:write'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------
    // const objectDinhMuc = async (namHoc, hocKy, namTuyenSinh) => {
    //     const { rows: listDinhMucNhom } = await app.model.tcDinhMuc.getHocPhiNhomAll(namHoc, hocKy, namTuyenSinh);
    //     const { rows: listDinhMucNganh } = await app.model.tcDinhMuc.getHocPhiNganhAll(namHoc, hocKy, namTuyenSinh);
    //     let objectDinhPhiTheoNhom = {};
    //     for (let item of listDinhMucNhom) {
    //         if (item.listNganhCon) {
    //             let listNganhCon = item.listNganhCon.split(',');
    //             for (let nganhCon of listNganhCon) {
    //                 objectDinhPhiTheoNhom[nganhCon] = item.soTien;
    //             }
    //         }
    //         else {
    //             objectDinhPhiTheoNhom[item.loaiHinhDaoTao] = item.soTien;
    //         }
    //     }
    //     for (let item of listDinhMucNganh) {
    //         objectDinhPhiTheoNhom[item.maNganh] = item.soTien;
    //     }
    //     return objectDinhPhiTheoNhom;
    // };

    // const resetApDung = async (mssv, namHoc, hocKy) => {
    //     try {
    //         if (!mssv || !namHoc || !hocKy) {
    //             throw ('Thông tin không đúng!');
    //         }
    //         const { namTuyenSinh } = await app.model.fwStudent.get({ mssv }, 'namTuyenSinh');
    //         let { rows: dotDong } = await app.model.tcDotDongHocPhi.getDotDongSinhVien(mssv, namHoc, hocKy);
    //         dotDong = dotDong.length > 0 ? dotDong[0].dotDong : null;
    //         if (!dotDong) {
    //             throw ('Không có đợt đóng học phí cho sinh viên');
    //         }
    //         let filter = { idDotDong: dotDong, namHoc, hocKy, namTuyenSinh, bacDaoTao: null, heDaoTao: null, nganhDaoTao: null, mssv };
    //         await app.model.tcDotDongHocPhi.rollBack(app.utils.stringify(filter));
    //         // Ap dung lai
    //         const listLoaiPhi = await app.model.tcDotDongHocPhiDetail.getAll({ idDotDong: dotDong });
    //         let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();
    //         mapLoaiPhi = mapLoaiPhi.reduce((map, obj) => {
    //             map[obj.id] = obj.ten;
    //             return map;
    //         }, {});
    //         listLoaiPhi.map(loaiPhi => {
    //             loaiPhi['tenLoaiPhi'] = mapLoaiPhi[loaiPhi.loaiPhi];
    //             loaiPhi['tenTamThu'] = mapLoaiPhi[loaiPhi.tamThu] || '';
    //         });
    //         const mapDinhMuc = await objectDinhMuc(namHoc, hocKy, namTuyenSinh);
    //         if (namTuyenSinh <= 2021) {
    //             mapDinhMuc['CLC'] = 0;
    //         }
    //         const ngayTao = new Date().getTime();
    //         let loaiPhiCoDinh = [];
    //         let loaiPhiHocPhi = null;
    //         if (!listLoaiPhi) {
    //             throw ('Vui lòng chọn ít nhất 1 loại phí để áp dụng');
    //         }
    //         for (let loaiPhi of listLoaiPhi) {
    //             if (loaiPhi.soTien && loaiPhi.isHocPhi == true) {
    //                 throw ('Không thể cài đặt số tiền cho học phí!');
    //             }
    //             if (loaiPhi.soTien) {
    //                 loaiPhiCoDinh.push(loaiPhi);
    //             }
    //             else if (loaiPhi.isHocPhi == true) {
    //                 loaiPhiHocPhi = loaiPhi;
    //             }
    //             else {
    //                 throw ('Thiếu dữ liệu số tiền!');
    //             }
    //         }
    //         for (let loaiPhi of loaiPhiCoDinh) {
    //             await app.model.tcDotDongHocPhi.apDungCoDinh(app.utils.stringify(filter), app.utils.stringify(loaiPhi), ngayTao);
    //         }
    //         if (loaiPhiHocPhi) {
    //             let { rows: listSinhVienMonHoc, listMssv: listSinhVien } = await app.model.tcDotDongHocPhi.getMonHocSinhVien(app.utils.stringify(filter));
    //             // TODO SUA SAU BEGIN
    //             listSinhVienMonHoc.forEach(item => {
    //                 let loaiDangKy = item.loaiDangKy ? item.loaiDangKy : 'KH';
    //                 if (mapDinhMuc[item.heDaoTao] == null && mapDinhMuc[item.maNganh] == null) {
    //                     throw (`Chưa có định mức học phí cho sinh viên ${item.mssv}`);
    //                 }
    //                 let soTienDinhPhi = mapDinhMuc[item.heDaoTao] ? mapDinhMuc[item.heDaoTao] : mapDinhMuc[item.maNganh];
    //                 if (item.heDaoTao == 'CLC' && namTuyenSinh <= 2021) {
    //                     soTienDinhPhi = 0;
    //                     if (loaiDangKy == 'HV' || loaiDangKy == 'CT' || loaiDangKy == 'HL') {
    //                         soTienDinhPhi = 840000;
    //                     }
    //                 }
    //                 if (item.heDaoTao == 'CQ' && namTuyenSinh <= 2021 && item.loaiSinhVien == 'L2') {
    //                     soTienDinhPhi = 1200000;
    //                 }
    //                 if (item.maHocPhan && item.maHocPhan.substring(0, 3) == 'VNH') {
    //                     soTienDinhPhi = 1200000;
    //                 }
    //                 item.tongTinChi = parseInt(namTuyenSinh) > 2021 ? (item.tongTinChi || 0) : (parseInt(item.tongTietHoc) / 15 || 0);
    //                 item['soTien'] = soTienDinhPhi * item.tongTinChi;
    //             });
    //             listSinhVien.forEach(item => {
    //                 item['soTien'] = listSinhVienMonHoc.filter(new_item => new_item.mssv == item.mssv)
    //                     .map(new_item => new_item.soTien)
    //                     .reduce((tot, curr) => tot + curr, 0);
    //                 if (item.heDaoTao == 'CLC' && namTuyenSinh <= 2021 && namTuyenSinh >= 2019) {
    //                     item['soTien'] += 18000000;
    //                 }
    //             });
    //             for (let sinhVien of listSinhVien) {
    //                 if (!sinhVien.mssv || !sinhVien.soTien) {
    //                     continue;
    //                 }
    //                 const checkHocPhiDetail = await app.model.tcHocPhiDetail.get({ mssv: sinhVien.mssv, loaiPhi: loaiPhiHocPhi.loaiPhi, dotDong: loaiPhiHocPhi.idDotDong, namHoc, hocKy });
    //                 if (!checkHocPhiDetail) {
    //                     let checkHocPhi = await app.model.tcHocPhi.get({ mssv: sinhVien.mssv, namHoc, hocKy });
    //                     if (!checkHocPhi) {
    //                         checkHocPhi = await app.model.tcHocPhi.create({ mssv: sinhVien.mssv, namHoc, hocKy, hocPhi: 0, congNo: 0, ngayTao, hoanTra: 0, trangThai: 'MO' });
    //                     }
    //                     await app.model.tcHocPhiDetail.create({ mssv: sinhVien.mssv, namHoc, hocKy, loaiPhi: loaiPhiHocPhi.loaiPhi, dotDong: loaiPhiHocPhi.idDotDong, soTien: sinhVien.soTien, active: 1, ngayTao });
    //                     let soTienTamThu = await app.model.tcHocPhiDetail.get({ mssv: sinhVien.mssv, loaiPhi: loaiPhiHocPhi.tamThu, namHoc, hocKy });
    //                     soTienTamThu = soTienTamThu ? soTienTamThu.soTien : 0;
    //                     await app.model.tcHocPhi.update({ mssv: sinhVien.mssv, namHoc, hocKy }, { congNo: checkHocPhi.congNo + sinhVien.soTien - soTienTamThu, hocPhi: checkHocPhi.hocPhi + sinhVien.soTien - soTienTamThu });
    //                     for (let svMonHoc of listSinhVienMonHoc) {
    //                         if (svMonHoc.mssv == sinhVien.mssv) {
    //                             await app.model.tcHocPhiSubDetail.create({ mssv: svMonHoc.mssv, idDotDong: loaiPhiHocPhi.idDotDong, maMonHoc: svMonHoc.maMonHoc, tenMonHoc: svMonHoc.tenMonHoc, soTinChi: svMonHoc.tongTinChi, soTien: svMonHoc.soTien, active: 1 });
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     catch (error) {
    //         console.error(error);
    //     }
    // };

    app.get('/api/dt/dkhp/list-result/page/:pageNumber/:pageSize', app.permission.check('dtModifyHocPhan:write'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'mssv_DESC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.dtDangKyHocPhan.searchPageFilter(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/dkhp/list-result', app.permission.check('dtModifyHocPhan:write'), async (req, res) => {
        try {
            let { id, change } = req.body;
            const item = await app.model.dtDangKyHocPhan.update({ id }, change);
            // resetApDung(change.mssv, '2022 - 2023', '1');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/dkhp/list-result', app.permission.check('dtModifyHocPhan:write'), async (req, res) => {
        try {
            let { data } = req.body;
            const item = await app.model.dtDangKyHocPhan.create(data);
            // resetApDung(data.mssv, '2022 - 2023', '1');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/dkhp/list-result', app.permission.check('dtModifyHocPhan:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            // const dkhp = await app.model.dtDangKyHocPhan.get({ id });
            app.model.dtDangKyHocPhan.delete({ id });
            // resetApDung(dkhp.mssv, '2022 - 2023', '1');
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student-list/page/:pageNumber/:pageSize', app.permission.orCheck('dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query,
                user = req.session.user;
            const searchTerm = typeof condition === 'string' ? condition : '';

            await app.model.dtAssignRole.getDataRole('dtQuanLyHocPhan', user, filter);
            filter.isNhapHoc = 1;
            let page = await app.model.fwStudent.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student-list/student/:mssv', app.permission.check('dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let [item, sems] = await Promise.all([
                app.model.fwStudent.getData(mssv),
                app.model.dtSemester.get({ active: 1 })
            ]);

            item = item.rows.map(i => {
                let cauTrucTinChi = i.cauTrucTinChi ? JSON.parse(i.cauTrucTinChi) : [],
                    mucCha = i.mucCha ? JSON.parse(i.mucCha) : { chuongTrinhDaoTao: {} },
                    mucCon = i.mucCon ? JSON.parse(i.mucCon) : { chuongTrinhDaoTao: {} };
                return { ...i, cauTrucTinChi, mucCha: mucCha.chuongTrinhDaoTao, mucCon: mucCon.chuongTrinhDaoTao };
            });

            res.send({ item: item[0], sems });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student/hoc-phan', app.permission.check('dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            let { filterhp, mssv } = req.query;
            filterhp = app.utils.stringify(app.clone(filterhp));
            let items = await app.model.dtDangKyHocPhan.getDataHocPhan(filterhp);
            //TODO: filter namHoc from cauHinh
            let hocPhanDangKy = await app.model.dtDangKyHocPhan.getHocPhan(mssv, app.utils.stringify({ namHocFilter: '2022 - 2023' }));
            items = await Promise.all(items.rows.map(item => {
                let isCheck = hocPhanDangKy.rows.find(hocPhan => hocPhan.hocPhan == item.maHocPhan);
                return { ...item, isCheck: isCheck ? true : false };
            }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/student/hoc-phan', app.permission.check('dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            let { list, mssv } = req.body;
            let hocPhanDky = await app.model.dtDangKyHocPhan.getAll({ mssv });
            let email = req.session.user.email;
            email = email.split('@');
            email = email[0];
            await hocPhanDky.forEach(hocPhan =>
                app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan: hocPhan.maHocPhan,
                    userModified: req.session.user.email,
                    timeModified: Date.now(),
                    thaoTac: 'D',
                })
            );
            await app.model.dtDangKyHocPhan.delete({ mssv });

            for (let hocPhan of list) {
                let data = {
                    mssv,
                    maHocPhan: hocPhan,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                await app.model.dtDangKyHocPhan.create(data);
                await app.model.dtLichSuDkhp.create({
                    mssv, maHocPhan: hocPhan,
                    userModified: email,
                    timeModified: Date.now(),
                    thaoTac: 'A',
                });
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student/lich-su-dkhp', app.permission.check('user:login'), async (req, res) => {
        try {
            let mssv = req.query.mssv;
            let items = await app.model.dtLichSuDkhp.getAll({ mssv }, '*', 'timeModified DESC');
            res.send({ items: items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student/ctdt', app.permission.check('user:login'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            let items = await app.model.dtChuongTrinhDaoTao.getByFilter(filter);
            res.send({ items: items.rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/student/export-danh-sach', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { filter = {}, sortTerm = 'mssv_DESC' } = req.query;
            await app.model.dtAssignRole.getDataRole('dtQuanLyHocPhan', req.session.user, filter);
            filter.isNhapHoc = 1;
            let { rows } = await app.model.fwStudent.searchPage(1, 1000000, '', app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DanhSachSinhVien');

            const defaultColumns = [
                { header: 'MSSV', key: 'mssv', width: 20 },
                { header: 'HỌ VÀ TÊN LÓT', key: 'ho', width: 20 },
                { header: 'TÊN', key: 'ten', width: 20 },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 25 },
                { header: 'LỚP', key: 'lop', width: 25 },
                { header: 'CTDT', key: 'ctdt', width: 25 },
                { header: 'MÔN CTDT', key: 'monCtdt', width: 25 },
                { header: 'LHDT', key: 'lhdt', width: 25 },
                { header: 'KHOA', key: 'khoa', width: 25 },
                { header: 'NGÀNH', key: 'nganh', width: 25 },
                { header: 'KHÓA', key: 'khoaSinhVien', width: 25 },
            ];

            ws.columns = defaultColumns;

            rows.forEach((item, index) => {
                let rowData = {
                    mssv: item.mssv,
                    ho: item.ho,
                    ten: item.ten,
                    gioiTinh: item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : '',
                    lop: item.lop,
                    ctdt: item.maCtdt || '',
                    monCtdt: item.soLuong || '',
                    lhdt: item.tenLoaiHinhDaoTao || '',
                    khoa: item.tenKhoa || '',
                    nganh: item.tenNganh || '',
                    khoaSinhVien: item.namTuyenSinh || '',
                };
                ws.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'DanhSachSinhVien.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
