module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5021: { title: 'Danh sách sinh viên', link: '/user/finance/danh-sach-sinh-vien', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 1 }
        }
    };

    app.permission.add(
        { name: 'tcDanhSachSinhVien:read', menu },
        { name: 'tcDanhSachSinhVien:write' },
        { name: 'tcDanhSachSinhVien:delete' },
        { name: 'tcDanhSachSinhVien:write' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDanhSachSinhVien', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDanhSachSinhVien:read', 'tcDanhSachSinhVien:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/danh-sach-sinh-vien', app.permission.check('tcDanhSachSinhVien:read'), app.templates.admin);
    app.get('/user/finance/danh-sach-sinh-vien/:mssv', app.permission.check('tcDanhSachSinhVien:read'), app.templates.admin);
    app.get('/user/finance/invoice/:mssv', app.permission.check('tcDanhSachSinhVien:read'), app.templates.admin);

    app.get('/api/khtc/danh-sach-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('tcDanhSachSinhVien:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwStudent.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/danh-sach-sinh-vien/info-page/:mssv', app.permission.check('tcDanhSachSinhVien:read'), async (req, res) => {
        try {
            const mssv = req.params.mssv;

            await app.model.tcDotDong.capNhatDongTien(mssv);
            let [infoSinhVien, infoHocPhi, infoHoanTra, infoMienGiam, infoSoDuHocPhi, listNamHocHocKy, cauHinhThongTin, thongTinBaoLuu] = await Promise.all([
                app.model.fwStudent.get({ mssv }),
                app.model.tcHocPhi.sinhVienGetHocPhi(app.utils.stringify({ mssv })),
                app.model.tcHoanTra.getAll({ mssv }),
                app.model.tcMienGiam.getAll({ mssv }),
                app.model.tcSoDuHocPhi.get({ mssv }),
                app.model.tcHocPhi.getAll({ mssv }, '*', 'namHoc, hocKy').then(data => data.map(item => (
                    { id: `${item.namHoc}-${item.hocKy}`, text: `Năm học ${item.namHoc}-${parseInt(item.namHoc) + 1}, học kỳ ${item.hocKy}` }
                ))),
                app.model.tcHocPhi.getAll({ mssv }),
                app.model.tcBaoLuu.getAll({ mssv })
            ]);

            if (!infoSinhVien) throw 'Thông tin sinh viên không tồn tại!';

            const [tenNganh, tenKhoa, tenLoaiHinh, khoaGiaoDich] = await Promise.all([
                app.model.dtNganhDaoTao.get({ maNganh: infoSinhVien.maNganh }),
                app.model.dmDonVi.get({ ma: infoSinhVien.khoa }),
                app.model.dmSvLoaiHinhDaoTao.get({ ma: infoSinhVien.loaiHinhDaoTao }),
                app.model.tcDotDong.khoaDotDong(mssv, Date.now())
            ]);

            infoSinhVien['tenKhoa'] = tenKhoa?.ten;
            infoSinhVien['tenNganh'] = tenNganh?.tenNganh;
            infoSinhVien['tenLoaiHinh'] = tenLoaiHinh?.ten;
            infoSinhVien['khoaGiaoDich'] = khoaGiaoDich?.outBinds?.ret || 0;
            let { rows: listMonHoc } = await app.model.tcHocPhi.getDetailHocPhi(mssv);
            const { noiDungLuuYEditorHtml: noiDungLuuY } = await app.model.tcSetting.getValue('noiDungLuuYEditorHtml');

            res.send({ infoSinhVien, infoHocPhi: infoHocPhi.rows, infoHoanTra, infoMienGiam, infoSoDuHocPhi, listMonHoc, noiDungLuuY: `${noiDungLuuY}` || '', listNamHocHocKy, cauHinhThongTin, thongTinBaoLuu });
        }
        catch (error) {
            console.error(error);
            res.send(error);
        }
    });

    const configDataHocPhiHocKy = async (mssv) => {
        try {
            let hocPhiDetail = await app.model.tcHocPhi.sinhVienGetHocPhi(app.utils.stringify({ mssv })).then(data => data.rows.filter(item => item.active));
            let { rows: hocPhiSubDetail } = await app.model.tcHocPhi.getDetailHocPhi(mssv);
            let soDu = await app.model.tcSoDuHocPhi.get({ mssv });

            let objectHocKy = {};

            let listTableHocPhi = [
                ...hocPhiDetail.filter(item => item.active && !(item.isHocPhi && item.hocPhiChinh && item.namHocPhatSinh == item.namHoc && item.hocKyPhatSinh == item.hocKy)),
                ...hocPhiSubDetail
            ];

            const listNamHocHocKy = await app.model.tcHocPhi.getAll({ mssv }, '*', 'namHoc, hocKy');

            listTableHocPhi = listTableHocPhi.reduce((result, item) => {
                if (listNamHocHocKy.find(ele => ele.namHoc == item.namHoc && ele.hocKy == item.hocKy)) {
                    if (!item.status && !item.isHocPhi) result.push({ ...item, keys: 'loaiPhiKhac' });
                    else result.push({ ...item, keys: `${item.namHoc}-${item.hocKy}` });
                }
                return result;
            }, [])?.groupBy('keys');


            Object.keys(listTableHocPhi).forEach(item => {
                const [namHoc, hocKy] = item.split('-');
                let data = {};
                let detail = (item == 'loaiPhiKhac') ? hocPhiDetail.filter(row => (row.active && !row.isHocPhi)) : hocPhiDetail.filter(row => (row.active && row.isHocPhi && row.namHoc == namHoc && row.hocKy == hocKy));
                data['soTien'] = detail.map(row => parseInt(row.soTien)).sum();
                data['daDong'] = detail.map(row => parseInt(row.daDong)).sum();
                data['mienGiam'] = detail.map(row => parseInt(row.soTien) - parseInt(row.canDong)).sum();
                data['conLai'] = detail.map(row => parseInt(row.canDong) - parseInt(row.daDong)).sum();
                objectHocKy[item] = data;
            });

            let objectTong = {};
            ['soTien', 'daDong', 'mienGiam', 'conLai'].forEach(key => {
                objectTong[key] = Object.keys(objectHocKy).map(item => parseInt(objectHocKy[item][key]))?.sum() || 0;
            });
            objectTong['soDu'] = soDu?.soTien || 0;
            return { listTableHocPhi, objectHocKy, objectTong };
        }
        catch (error) {
            console.error({ error });
        }
    };

    const initPhieuThu = async (filter) => {
        try {
            const { mssv, hocKy: filterHocKy } = filter;
            let { listTableHocPhi, objectHocKy, objectTong } = await configDataHocPhiHocKy(mssv);
            let infoSinhVien = await app.model.fwStudent.getData(mssv).then(list => list.rows?.[0]);
            const { soTien: tongHocPhiHocKy, daDong: tongDaDongHocKy, mienGiam: tongMienGiamHocKy, conLai: tongChuaDongHocKy, soDu: tongSoDu } = objectTong;

            let dataHocPhi = [];

            for (let item of Object.keys(listTableHocPhi)) {
                if (filterHocKy != 'all' && filterHocKy != item) continue;
                let namHoc, hocKy;
                if (item != 'loaiPhiKhac') {
                    [namHoc, hocKy] = item.split('-');
                }

                let detail = listTableHocPhi[item].map((row, idx) => {
                    return ({
                        stt: idx + 1,
                        khoanThu: row.status ? app.utils.parse(row.tenLoaiPhi)?.vi || '' : row.tenLoaiPhi || '',
                        soTinChi: row.tongTinChi || '',
                        donGia: row.tongTinChi ? (parseInt(row.soTien || 0) / parseInt(row.tongTinChi)).toString().numberDisplay() : '',
                        ngayBatDau: row.ngayBatDau ? app.date.dateTimeFormat(new Date(Number(row.ngayBatDau)), 'dd/mm/yyyy') : '',
                        soTien: (row.soTien || 0).toString().numberDisplay(),
                        tinhTrang: row.tinhTrangDong ? 'Đã nộp' : 'Chưa nộp'
                    });
                });

                const { soTien: hocPhiHocKy, daDong: daDongHocKy, mienGiam: mienGiamHocKy, conLai: chuaDongHocKy } = objectHocKy[item];
                dataHocPhi.unshift({
                    checkNamHoc: !!namHoc,
                    namHoc: `${parseInt(namHoc)} - ${parseInt(namHoc) + 1}`, hocKy: parseInt(hocKy),
                    detail,
                    hocPhiHocKy: hocPhiHocKy.toString().numberDisplay(),
                    daDongHocKy: daDongHocKy.toString().numberDisplay(),
                    mienGiamHocKy: mienGiamHocKy.toString().numberDisplay(),
                    chuaDongHocKy: chuaDongHocKy.toString().numberDisplay(),
                });
            }

            dataHocPhi.sort((a, b) => (b.namHoc - a.namHoc) * 10000 + (b.hocKy - a.hocKy));

            let dataInit = {
                ...infoSinhVien,
                dataHocPhi,
                getAll: (filterHocKy == 'all'),
                khoaSinhVien: infoSinhVien.khoaSinhVien || infoSinhVien.khoaSinhVienFw,
                tongHocPhiHocKy: tongHocPhiHocKy.toString().numberDisplay(),
                tongDaDongHocKy: tongDaDongHocKy.toString().numberDisplay(),
                tongMienGiamHocKy: tongMienGiamHocKy.toString().numberDisplay(),
                tongChuaDongHocKy: tongChuaDongHocKy.toString().numberDisplay(),
                tongSoDu: tongSoDu.toString().numberDisplay(),
                checkSoDu: parseInt(tongSoDu) > 0,
                ngayTao: app.date.viDateFormatString(new Date())
            };

            const source = app.path.join(app.assetPath, 'khtc', 'phieuHocPhiTemplate', 'phieuThu.docx');
            const buffer = await app.docx.generateFile(source, dataInit);
            return { buffer, filename: `Phieu_thu_hoc_phi_${mssv}` };
        }
        catch (error) {
            console.error({ error });
        }
    };

    app.get('/api/khtc/danh-sach-sinh-vien/sv/download-word', app.permission.check('tcDanhSachSinhVien:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            const { buffer, filename } = await initPhieuThu(filter);
            res.send({ content: buffer, filename: filename + '.docx' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/dang-ky-hoc-phan/student/hoc-phan', app.permission.check('tcDanhSachSinhVien:read'), async (req, res) => {
        try {
            let { mssv, filter } = req.query;
            filter = app.utils.stringify({ ...filter });
            let items = await app.model.dtDangKyHocPhan.getKetQuaDangKy(mssv, filter);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/invoice/page/:mssv', app.permission.check('tcDanhSachSinhVien:read'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let list = await app.model.tcHocPhiTransaction.getAll({ customerId: mssv, status: 1 }, '*');
            res.send({ list });
        } catch (error) {
            console.error(req.method, req.url, error);
        }
    });


    app.post('/api/khtc/danh-sach-sinh-vien/cau-hinh-thong-tin', app.permission.check('tcDanhSachSinhVien:write'), async (req, res) => {
        try {
            const { mssv, cauHinh, khoaSinhVien } = req.body;
            if (!mssv || !cauHinh || !cauHinh.length || !khoaSinhVien) throw ('Thông tin đầu vào không hợp lệ!');

            await app.model.fwStudent.update({ mssv }, { khoaSinhVien });
            await app.model.tcBaoLuu.delete({ mssv });
            for (let item of cauHinh) {
                let { namHoc, hocKy, baoLuu, ...thongTin } = item;
                if (item.bacDaoTao && item.heDaoTao && item.nganhDaoTao && item.khoaSinhVien) {
                    await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, thongTin);
                }
                if (Number(baoLuu)) await app.model.tcBaoLuu.create({ mssv, namHoc, hocKy });
            }

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // app.post('/api/khtc/danh-sach-sinh-vien/cau-hinh-bao-luu', app.permission.check('tcDanhSachSinhVien:write'), async (req, res) => {
    //     try {
    //         const { mssv, cauHinh, khoaSinhVien } = req.body;
    //         if (!mssv || !cauHinh || !cauHinh.length || !khoaSinhVien) throw ('Thông tin đầu vào không hợp lệ!');

    //         await app.model.fwStudent.update({ mssv }, { khoaSinhVien });

    //         await Promise.all([
    //             app.model.fwStudent.update({ mssv }, { khoaSinhVien }),
    //             ...cauHinh.map(item => {
    //                 let { namHoc, hocKy, ...thongTin } = item;
    //                 if (item.bacDaoTao && item.heDaoTao && item.nganhDaoTao && item.khoaSinhVien) {
    //                     return app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, thongTin);
    //                 }
    //             })
    //         ]);

    //         res.send({});
    //     } catch (error) {
    //         app.consoleError(req, error);
    //         res.send({ error });
    //     }
    // });
};