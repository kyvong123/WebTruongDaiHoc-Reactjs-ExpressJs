module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3020: { title: 'Hợp đồng Đơn vị', link: '/user/tccb/qua-trinh/hop-dong-dvtl', icon: 'fa-pencil-square-o', backgroundColor: '#fecc2c', groupIndex: 2 }
        }
    };
    app.permission.add(
        { name: 'qtHopDongDvtl:read', menu },
        { name: 'qtHopDongDvtl:write' },
        { name: 'qtHopDongDvtl:delete' },
        { name: 'qtHopDongDvtl:export' }
    );
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl/:id', app.permission.check('qtHopDongDvtl:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHdDvtl', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtHopDongDvtl:read', 'qtHopDongDvtl:write', 'qtHopDongDvtl:delete', 'qtHopDongDvtl:export');
        }
        resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = '{}';
        try {
            filter = JSON.stringify(req.query.filter || {});
        }
        catch (error) {
            console.error(req.method, req.url, error);
        }

        app.model.qtHopDongDonViTraLuong.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = '{}';
        try {
            filter = JSON.stringify(req.query.filter || {});
        }
        catch (error) {
            console.error(req.method, req.url, error);
        }
        app.model.qtHopDongDonViTraLuong.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/all', app.permission.check('qtHopDongDonViTraLuong:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc }
            };
        }
        app.model.qtHopDongDonViTraLuong.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), async (req, res) => {
        try {
            const item = await app.model.qtHopDongDonViTraLuong.create(req.body.item);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng đơn vị trả lương');
            res.send({ item });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng đơn vị trả lương');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng đơn vị trả lương');
            res.send({ error });
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/suggested-shd', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.getAll({}, 'soHopDong', 'soHopDong DESC', (error, items) => {
            let maxSoHD = 0, curYear = new Date().getFullYear();
            items.forEach((item) => {
                let soHopDong = Number(item.soHopDong.substring(0, item.soHopDong.indexOf('/'))),
                    hopDongYear = Number(item.soHopDong.substring(item.soHopDong.indexOf('/') + 1, item.soHopDong.lastIndexOf('/')));
                if (curYear == hopDongYear) {
                    if (soHopDong > maxSoHD) maxSoHD = soHopDong;
                }
            });
            res.send({ error, soHopDongSuggested: maxSoHD + 1 });
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/newest/:shcc', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.get({ shcc: req.params.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, result) => res.send({ error, result }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/get-truong-phong-tccb', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        app.model.dmChucVu.get({ ten: 'Trưởng phòng' }, (error, result) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.qtChucVu.get({ maChucVu: result.id, maDonVi: 30, chucVuChinh: 1 }, (error, truongPhongTCCB) => res.send({ error, truongPhongTCCB }));
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/edit/item/:id', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.get({ id: req.params.id }, (error, qtHopDongDvtl) => {
            if (error || qtHopDongDvtl == null) {
                res.send({ error });
            } else {
                app.model.tccbCanBoDonVi.get({ shcc: qtHopDongDvtl.shcc }, (error, canBoDuocThue) => {
                    if (error || canBoDuocThue == null) {
                        res.send({ error });
                    } else {
                        app.model.tccbCanBoDonVi.get({ shcc: qtHopDongDvtl.nguoiKy }, (error, daiDien) => {
                            if (error || daiDien == null) {
                                res.send({ item: app.clone({ qtHopDongDvtl }, { canBoDuocThue }, { canBo: null }) });
                            } else {
                                res.send({ item: app.clone({ qtHopDongDvtl: qtHopDongDvtl }, { canBoDuocThue }, { daiDien }) });
                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/download-word/:id', app.permission.check('qtHopDongDvtl:export'), (req, res) => {
        if (req.params && req.params.id) {
            app.model.qtHopDongDonViTraLuong.downloadWord(req.params.id, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    const source = app.path.join(__dirname, 'resource', 'hddv.docx');
                    const canCuUyQuyen = 'Căn cứ Giấy ủy quyền số 297/GUQ-XHNV-TCCB ngày 05 tháng 4 năm 2022 của Hiệu trưởng Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM về việc giao kết hợp đồng làm việc và hợp đồng lao động đối với viên chức và người lao động có trình độ từ thạc sĩ trở xuống (gọi tắt là Giấy Ủy quyền số 297/GUQ-XHNV-TCCB).';
                    const daiDienUyQuyen = 'Đại diện cho Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh theo Giấy ủy quyền số 297/GUQ-XHNV-TCCB.';
                    new Promise(resolve => {
                        let hopDong = item.rows[0];
                        const data = {
                            canCuUyQuyen: hopDong.maChucVuNguoiKy == '003' ? canCuUyQuyen : '',
                            daiDienUyQuyen: hopDong.maChucVuNguoiKy == '003' ? daiDienUyQuyen : '',
                            soHopDong: hopDong.soHopDong,
                            daiDienKy: (hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy).normalizedName(),
                            chucVuDaiDienKy: hopDong.maChucVuNguoiKy === '003' ? (hopDong.chucVuNguoiKy.normalizedName() + ' ' + hopDong.donViNguoiKy.normalizedName()) : hopDong.chucVuNguoiKy.normalizedName(),
                            phaiNK: hopDong.phaiNK,
                            quocTichKy: hopDong.quocTichKy ? hopDong.quocTichKy.normalizedName() : 'Việt Nam',
                            hoTenCanBo: (hopDong.ho + ' ' + hopDong.ten).normalizedName(),
                            phai: hopDong.phai,
                            gioiTinh: hopDong.phai == 'Ông' ? 'Nam' : 'Nữ',
                            quocTichCanBo: hopDong.quocTich ? hopDong.quocTich.normalizedName() : '',
                            tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
                            danToc: hopDong.danToc ? hopDong.danToc : '',
                            ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                            noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                            nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
                            hienTai: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
                                + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
                                + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
                                + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
                            thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
                                + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
                                + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
                                + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),

                            dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                            hocVi: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
                            chuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',

                            cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                            cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                            cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',

                            loaiHopDong: hopDong.loaiHopDong ? hopDong.loaiHopDong : '',
                            batDauHopDong: hopDong.batDauHopDong ? app.date.viDateFormat(new Date(hopDong.batDauHopDong)) : '',
                            ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
                            diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec.normalizedName() : '',
                            chucDanhChuyenMon: hopDong.chucDanhChuyenMon,
                            chiuSuPhanCong: hopDong.chiuSuPhanCong ? (hopDong.chiuSuPhanCong.length < 15 ? 'Theo sự phân công của Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName() : hopDong.chiuSuPhanCong) : '',
                            chiuTrachNhiem: 'Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName(),
                            bac: hopDong.bac ? hopDong.bac : '',
                            heSo: hopDong.heSo ? hopDong.heSo : '',
                            ngayKyHopDong: hopDong.ngayKyHopDong ? app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)) : '',
                            ngayKyDate: (new Date(hopDong.ngayKyHopDong)).getDate(),
                            ngayKyMonth: (new Date(hopDong.ngayKyHopDong)).getMonth() + 1,
                            ngayKyYear: (new Date(hopDong.ngayKyHopDong)).getFullYear(),
                            phanTramHuong: hopDong.phanTramHuong ? hopDong.phanTramHuong : '',
                            hieuTruong: hopDong.maChucVuNguoiKy === '003' ? 'TL. HIỆU TRƯỞNG' : 'HIỆU TRƯỞNG',
                            truongPhongTCCB: hopDong.maChucVuNguoiKy === '003' ? 'TRƯỞNG PHÒNG TC-CB' : '',
                            isThuViec: hopDong.loaiHopDong.includes('thử việc') ? '(Thử việc)' : '',
                            kiTenUyQuyen: hopDong.maChucVuNguoiKy == '003' ? 'TUQ. HIỆU TRƯỞNG' : '',
                            kiTenChucVu: hopDong.maChucVuNguoiKy == '003' ? 'TRƯỞNG PHÒNG TC-CB' : 'HIỆU TRƯỞNG'
                        };
                        resolve(data);
                    }).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => res.send({ error, data }));
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid id' });
        }
    });

};