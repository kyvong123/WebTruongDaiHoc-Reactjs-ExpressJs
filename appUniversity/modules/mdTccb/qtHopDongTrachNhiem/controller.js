module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3031: { title: 'Hợp đồng Trách nhiệm', link: '/user/tccb/qua-trinh/hop-dong-trach-nhiem', icon: 'fa-pencil', backgroundColor: '#00897b', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'qtHopDongTrachNhiem:read', menu },
        { name: 'qtHopDongTrachNhiem:write' },
        { name: 'qtHopDongTrachNhiem:delete' },
        { name: 'qtHopDongTrachNhiem:export' },
    );

    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem/:ma', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHopDongTrachNhiem', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtHopDongTrachNhiem:read', 'qtHopDongTrachNhiem:write', 'qtHopDongTrachNhiem:delete', 'qtHopDongTrachNhiem:export');
        }
        resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/page/:pageNumber/:pageSize', app.permission.check('qtHopDongTrachNhiem:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = req.query.condition || '';
            let filter = app.utils.stringify(req.query.filter || {});
            const page = await app.model.qtHopDongTrachNhiem.searchPage(pageNumber, pageSize, filter, searchTerm);
            if (page == null) {
                res.end();
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/edit/:ma', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        app.model.qtHopDongTrachNhiem.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/handle-so-hop-dong', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        let thisYear = new Date().getFullYear(),
            firstDayThisYear = new Date(`01 01 ${thisYear} 0 0 0`).getTime(),
            lastDayThisYear = new Date(`31 12 ${thisYear} 23 59 59`).getTime();
        app.model.qtHopDongTrachNhiem.getAll({
            statement: 'ngayKyHopDong >= :firstDayThisYear AND ngayKyHopDong <= :lastDayThisYear',
            parameters: { firstDayThisYear, lastDayThisYear }
        }, 'soHopDong', 'ngayKyHopDong DESC NULLS LAST', (error, items) => {
            if (error) res.send({ error });
            else {
                items = items.map(item => Number(item.soHopDong.substring(0, item.soHopDong.indexOf('/'))));
                const maxCurrent = Math.max(...items) || 0;
                res.send({ soHopDongSuggest: maxCurrent + 1 });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/edit/item/:ma', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        app.model.qtHopDongTrachNhiem.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.create(req.body.item, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng trách nhiệm');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.update({ ma: req.body.ma }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng trách nhiệm');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng trách nhiệm');
            res.send({ error });
        });
    });
    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/download-word/:ma', app.permission.check('qtHopDongTrachNhiem:export'), async (req, res) => {
        try {
            if (req.params && req.params.ma) {
                let data1 = await app.model.qtHopDongTrachNhiem.download(req.params.ma);
                let hopDong = data1.rows[0];
                const data = {
                    soHopDong: hopDong.soHopDong ? hopDong.soHopDong : '',
                    ngayKyDate: (new Date(hopDong.ngayKyHopDong)).getDate(),
                    ngayKyMonth: (new Date(hopDong.ngayKyHopDong)).getMonth() + 1,
                    ngayKyYear: (new Date(hopDong.ngayKyHopDong)).getFullYear(),
                    phaiNK: hopDong.phaiNK ? hopDong.phaiNK : '',
                    daiDienKy: (hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy).normalizedName(),
                    quocTichKy: hopDong.quocTichKy ? hopDong.quocTichKy : '',
                    chucVuDaiDienKy: hopDong.maChucVuNguoiKy === '003' ? (hopDong.chucVuNguoiKy.normalizedName() + ' ' + hopDong.donViNguoiKy.normalizedName()) : hopDong.chucVuNguoiKy.normalizedName(),
                    phai: hopDong.phai ? hopDong.phai : '',
                    hoTenCanBo: ((hopDong.ho ? hopDong.ho : '') + ' ' + (hopDong.ten ? hopDong.ten : '')).normalizedName(),
                    quocTich: hopDong.quocTich ? hopDong.quocTich : '',
                    ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                    noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                    gioiTinh: hopDong.gioiTinh ? hopDong.gioiTinh : '',
                    hienTai: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
                        + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
                        + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
                        + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
                    thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
                        + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
                        + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
                        + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),
                    dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                    cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                    cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                    cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',
                    trinhDoHocVan: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : 'Không có',
                    hocVanChuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : 'Không có',
                    chucDanh: hopDong.chucDanh ? hopDong.chucDanh : 'Không có',
                    chucDanhChuyenNganh: hopDong.chucDanhChuyenNganh ? hopDong.chucDanhChuyenNganh : 'Không có',
                    hieuLucHopDong: hopDong.hieuLucHopDong ? app.date.viDateFormat(new Date(hopDong.hieuLucHopDong)) : '',
                    ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
                    diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec : '',
                    chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? hopDong.chucDanhChuyenMon : '',
                    mucLuong: hopDong.mucLuong ? hopDong.mucLuong : '',
                    hieuTruong: hopDong.maChucVuNguoiKy === '003' ? 'TL. HIỆU TRƯỞNG' : 'HIỆU TRƯỞNG',
                    truongPhongTCCB: hopDong.maChucVuNguoiKy === '003' ? 'TRƯỞNG PHÒNG TC-CB' : '',
                    kiTenUyQuyen: hopDong.maChucVuNguoiKy == '003' ? 'TUQ. HIỆU TRƯỞNG' : '',
                    kiTenChucVu: hopDong.maChucVuNguoiKy == '003' ? 'TRƯỞNG PHÒNG TC-CB' : 'HIỆU TRƯỞNG',
                };
                const source = app.path.join(__dirname, 'resource', 'hdtn.docx');
                let result = await app.docx.generateFile(source, data);
                res.send({ data: result });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};