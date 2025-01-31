module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1030: { title: 'Đăng ký học phần', link: '/user/hoc-vien-sau-dai-hoc/dang-ky-hoc-phan', icon: 'fa fa-book', backgroundColor: '#eb9833', groupIndex: 1 }
        }
    };
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7550: { title: 'Đăng ký học phần', link: '/user/sau-dai-hoc/dang-ky-hoc-phan', icon: 'fa fa-book', backgroundColor: '#eb9833', parentKey: 7557 }
        }
    };
    app.permission.add(
        { name: 'sdhDangKyHocPhan:manage', menu: menuSdh },
        { name: 'studentSdh:login', menu },
        { name: 'sdhDangKyHocPhan:write' },
        { name: 'sdhDangKyHocPhan:delete' },
        { name: 'sdhDangKyHocPhan:export' },
        { name: 'sdhDangKyHocPhan:import' },
    );
    app.get('/user/hoc-vien-sau-dai-hoc/dang-ky-hoc-phan', app.permission.check('studentSdh:login'), app.templates.admin);
    app.get('/user/sau-dai-hoc/dang-ky-hoc-phan/chi-tiet', app.permission.orCheck('sdhDangKyHocPhan:write', 'sdhDangKyHocPhan:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/dang-ky-hoc-phan', app.permission.orCheck('sdhDangKyHocPhan:write', 'sdhDangKyHocPhan:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDangKyHocPhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDangKyHocPhan:write', 'sdhDangKyHocPhan:delete', 'sdhDangKyHocPhan:manage');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/user/dang-ky-hoc-phan/all', app.permission.check('studentSdh:login'), (req, res) => {
        const mssv = req.session.user.studentId;
        const idDotDangKy = req.query.dotDangKy;
        app.model.sdhDangKyHocPhan.danhSachDangKyHocPhanHocVien(mssv, idDotDangKy, (error, items) => {
            const list = items && Object.values(items.rows.reduce((acc, curr) => {
                acc[curr.maHocPhan] = acc[curr.maHocPhan] || { maHocPhan: curr.maHocPhan, data: [] };
                acc[curr.maHocPhan].data.push(curr);
                return acc;
            }, {}));
            res.send({ error, page: list });
        });
    });

    app.get('/api/sdh/dang-ky-hoc-phan/danh-sach-hoc-vien/page/:pageNumber/:pageSize', app.permission.check('sdhDangKyHocPhan:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                { filter } = req.query;
            const page = await app.model.sdhDangKyHocPhan.hocVienSearchPage(pagenumber, pagesize, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/user/dang-ky-hoc-phan/danh-sach-hoc-phan', app.permission.check('sdhDangKyHocPhan:write'), (req, res) => {
        const filter = req.query.filter;
        app.model.sdhDangKyHocPhan.danhSachMonHocDotDangKy(app.utils.stringify(filter), async (error, items) => {
            const list = items && Object.values(items.rows.reduce((acc, curr) => {
                acc[curr.maHocPhan && curr.maHocPhan] = acc[curr.maHocPhan && curr.maHocPhan] || { maHocPhan: curr.maHocPhan, data: [], ten: curr.tenMonHoc };
                acc[curr.maHocPhan].data.push(curr);
                return acc;
            }, {}));
            res.send({ error, items: list });
        });
    });

    app.get('/api/sdh/dang-ky-hoc-phan/page/:pageNumber/:pageSize', app.permission.check('sdhDangKyHocPhan:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                { filter } = req.query || {};
            const page = await app.model.sdhDangKyHocPhan.dangKyHocPhanSearchPage(pagenumber, pagesize, app.utils.stringify(filter));
            const tem3 = page && Object.values(page.rows.reduce((acc, curr) => {
                acc[curr.maHocPhan && curr.mssv && curr.maHocPhan + curr.mssv] = acc[curr.maHocPhan && curr.mssv && curr.maHocPhan + curr.mssv] || { maHocPhan: curr.maHocPhan + curr.mssv, data: [], ten: curr.tenMonHoc };
                acc[curr.maHocPhan + curr.mssv].data.push(curr);
                return acc;
            }, {}));
            const { pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
            res.send({ page: { totalItem: tem3.length, pageSize, pageTotal, pageNumber, list: tem3 } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/dot-dang-ky', app.permission.check('sdhDangKyHocPhan:read'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            condition && Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
            await app.model.sdhThoiKhoaBieu.getAll(condition, '*', 'id ASC ', (error, items) => res.send({ error, items }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/user/danh-sach-hoc-phan/all', app.permission.check('studentSdh:login'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId;
            const dotDangKy = req.query.dotDangKy;
            const items = await app.model.sdhDangKyHocPhan.danhSachHocPhanHocVien(mssv, dotDangKy);
            const list = items && Object.values(items.rows.reduce((acc, curr) => {
                acc[curr.maHocPhan] = acc[curr.maHocPhan] || { maHocPhan: curr.maHocPhan, data: [], tenMonHoc: curr.tenMonHoc, maMonHoc: curr.maMonHoc };
                acc[curr.maHocPhan].data.push(curr);
                return acc;
            }, {}));
            res.send({ items: list });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/user/chuong-trinh-dao-tao/all', app.permission.check('studentSdh:login'), (req, res) => {
        const mssv = req.session.user.studentId;
        app.model.sdhDangKyHocPhan.chuongTrinhDaoTao(mssv, (error, ctdt) => {
            ctdt.mssv = req.session.user.studentId;
            res.send({ error, ctdt });
        });
    });

    app.post('/api/sdh/user/dang-ky-hoc-phan', app.permission.check('studentSdh:login'), async (req, res) => {
        try {
            const user = req.session.user;
            const changes = req.body.changes;
            const dot = await app.model.sdhDotDangKy.get({ id: changes.idDotDangKy });
            const list = await app.model.sdhDangKyHocPhan.create(changes);
            await app.model.sdhLichSuDkhp.create({
                mssv: changes.mssv, maHocPhan: changes.maHocPhan,
                tenMonHoc: changes.tenMonHoc,
                userModified: `${user.lastName} ${user.firstName}`,
                timeModified: Date.now(),
                thaoTac: 'A',
                namHoc: dot.nam, hocKy: dot.hocKy
            });
            res.send({ list });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dang-ky-hoc-phan/multiple', app.permission.check('sdhDangKyHocPhan:write'), (req, res) => {
        const mssv = req.body.changes.mssv;
        const maHocPhan = req.body.changes.maHocPhan;
        const idDotDangKy = req.body.changes.idDotDangKy;
        mssv.forEach(mssv => {
            maHocPhan.forEach(maHocPhan => {
                const change = { idDotDangKy, maHocPhan, mssv };
                app.model.sdhDangKyHocPhan.create(change, (error, item) => { res.send({ error, item }); });
            });
        });
    });

    app.get('/api/sdh/dang-ky-hoc-phan/all', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let kichHoat = req.query.kichHoat;
            let condition = kichHoat ? { kichHoat: 1 } : {};
            const data = await app.model.sdhDangKyHocPhan.getAll(condition);
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dang-ky-hoc-phan', app.permission.check('sdhDangKyHocPhan:write'), async (req, res) => {
        try {
            let { list, filter } = req.body, user = req.session.user,
                { namHoc, hocKy } = filter && filter || { namHoc: '', hocKy: '' };
            for (let item of list) {
                let data = {
                    mssv: item.mssv,
                    maHocPhan: item.maHocPhan,

                    modifier: user.email,
                    timeModified: Date.now(),
                    maMonHoc: item.maMonHoc,
                    tinhPhi: 0,
                    maLoaiDky: item.maLoaiDKy,
                    loaiMonHoc: item.loaiMonHoc,
                    idDotDangKy: item.idDotDangKy
                };
                if (item.tinhPhi == 'true') data.tinhPhi = 1;
                else data.tinhPhi = 0;
                await app.model.sdhDangKyHocPhan.create(data);
                let count = await app.model.sdhThoiKhoaBieu.get({ maHocPhan: item.maHocPhan });
                if (count) {
                    await app.model.sdhThoiKhoaBieu.update({ maHocPhan: item.maHocPhan }, { soLuongDangKy: count.soLuongDangKy ? count.soLuongDangKy + 1 : 1 });
                }
                await app.model.sdhLichSuDkhp.create({
                    mssv: item.mssv, maHocPhan: item.maHocPhan,
                    tenMonHoc: item.tenMonHoc,
                    userModified: `${user.lastName} ${user.firstName}`,
                    timeModified: Date.now(),
                    thaoTac: 'A',
                    namHoc, hocKy
                });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/user/dang-ky-hoc-phan', app.permission.orCheck('sdhDangKyHocPhan:delete', 'studentSdh:login'), async (req, res) => {
        try {
            let { hocPhan, mssv, filter } = req.body, user = req.session.user,
                { tenMonHoc, namHoc, hocKy, ghiChu } = filter || { tenMonHoc: '', namHoc: '', hocKy: '', ghiChu: '' };
            await app.model.sdhDangKyHocPhan.delete({ maHocPhan: hocPhan, mssv });
            let count = await app.model.sdhThoiKhoaBieu.get({ maHocPhan: hocPhan });
            if (count) {
                await app.model.sdhThoiKhoaBieu.update({ maHocPhan: hocPhan }, { soLuongDangKy: count.soLuongDangKy ? count.soLuongDangKy + 1 : 1 });
            }
            await app.model.sdhLichSuDkhp.create({
                mssv, maHocPhan: hocPhan, tenMonHoc,
                userModified: `${user.lastName} ${user.firstName}`,
                timeModified: Date.now(),
                thaoTac: 'D',
                namHoc, hocKy, ghiChu
            });
            res.send({ mssv });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/dang-ky-hoc-phan/multiple', app.permission.check('sdhDangKyHocPhan:write'), async (req, res) => {
        try {
            const { mssv, maHocPhan, idDotDangKy } = req.body.changes || { mssv: '', maHocPhan: '', idDotDangKy: '' };
            const user = req.session.user;
            if (mssv && maHocPhan && idDotDangKy) {
                const change = { idDotDangKy, maHocPhan, mssv };
                let count = await app.model.sdhThoiKhoaBieu.get({ maHocPhan: maHocPhan });
                let tenMonHoc = null;
                if (count) {
                    await app.model.sdhThoiKhoaBieu.update({ maHocPhan: maHocPhan }, { soLuongDangKy: count.soLuongDangKy ? count.soLuongDangKy - 1 : 0 });
                    tenMonHoc = await app.model.sdhDmMonHocMoi.get({ ma: count.maMonHoc }, 'tenTiengViet');
                }
                const data = await app.model.sdhDangKyHocPhan.delete({ ...change });
                await app.model.sdhLichSuDkhp.create({
                    mssv: mssv, maHocPhan: maHocPhan,
                    tenMonHoc: tenMonHoc.tenTiengViet,
                    userModified: `${user.lastName} ${user.firstName}`,
                    timeModified: Date.now(),
                    thaoTac: 'D',
                    namHoc: count && count.nam, hocKy: count && count.hocKy
                });
                res.send({ data });

            } else {
                res.send({ error: { message: 'Thiếu trường để xoá' } });
            }
        } catch (error) {
            res.send({ error });

        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/students/page/:pageNumber/:pageSize', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'mssv_ASC' } = req.query;

            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwSinhVienSdh.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            let listSV = list.map(item => ({
                tenLoaiHinhDaoTao: item.tenLoaiHinhDaoTao,
                loaiHinhDaoTao: item.bacDaoTao,
                ho: item.ho,
                ten: item.ten,
                isChon: 0,
                lop: item.lop,
                mssv: item.mssv,
                namTuyenSinh: item.namTuyenSinh,
                tenNganh: item.tenNganh,
                tenTinhTrangSV: item.tinhTrangSinhVien,
                tinhTrang: item.tinhTrang,
                tenKhoa: item.tenKhoa,
                khoa: item.khoa,
                maCtdt: item.maCtdt
            }));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list: listSV } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/students-filter', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            filter = app.utils.stringify(app.clone(filter));
            let items = await app.model.sdhDangKyHocPhan.getData(filter);
            items = items.rows.map(item => {
                item.isChon = 0;
                return item;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filter', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filterhp = req.query.filterhp || {};
            filterhp = app.utils.stringify(app.clone(filterhp));
            let items = await app.model.sdhDangKyHocPhan.getDataHocPhan(filterhp);
            items = items.rows.map(item => {
                item.isChon = 0;
                if (item.soLuongDuKien == null) item.soLuongDuKien = 100;
                return item;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filterByHocVien', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filterhp = req.query.filterhp || {};
            filterhp = app.utils.stringify(app.clone(filterhp));
            let items = await app.model.sdhDangKyHocPhan.getDkhpByHocVien(filterhp);
            items = items.rows.map(item => {
                item.isChon = 0;
                if (item.soLuongDuKien == null) item.soLuongDuKien = 100;
                return item;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filterByLop', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            filter = { ...filter };
            filter = app.utils.stringify(app.clone(filter));
            let items = await app.model.sdhDangKyHocPhan.getDshpDkByLop(filter);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/ctdt', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            filter = { ...filter, date: new Date().getTime().toString() };
            filter = app.utils.stringify(app.clone(filter));
            let items = await app.model.sdhDangKyHocPhan.getCtdtByLop(filter);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/so-luong-dky', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter;
            let items = await app.model.sdhDangKyHocPhan.getStatistic(app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/get-dkhp-info', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhDangKyHocPhan.checkDkhpInfo(app.utils.stringify({ maHocVien: '22814011414', idDot: '267', maMonHoc: 'AR6003', maHocPhan: 'CH242AR6003L01' }));
            res.send({ items: items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/hoc-phan-ctdt/all', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let { filterSV } = req.query || {},
                { mssvFilter, loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy } = filterSV,
                listHocPhan = [];
            let list = await app.model.sdhDangKyHocPhan.getKetQuaDangKy(mssvFilter, app.utils.stringify({ loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy }));
            list = list.rows;
            list.forEach(item => {
                if (item.soLuongDuKien == null) item.soLuongDuKien = 100;
                listHocPhan.push(item);
            });
            res.send({ listHocPhan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/student/hoc-phan', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let { mssv, filter } = req.query;
            filter = app.utils.stringify({ ...filter });
            let items = await app.model.sdhDangKyHocPhan.getKetQuaDangKy(mssv, filter);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/item/:id', app.permission.check('sdhDangKyHocPhan:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.sdhDangKyHocPhan.get({ id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dang-ky-hoc-phan/check', app.permission.check('sdhDangKyHocPhan:write'), async (req, res) => {
        try {
            let { listMSSV, itemHocPhan, idDotDangKy } = req.query.list;
            listMSSV = listMSSV.split('; ');
            let listMess = [];
            itemHocPhan = itemHocPhan.split(', ');
            let siSo = itemHocPhan[1] == 'null' ? 0 : parseInt(itemHocPhan[1]);
            let maHocPhan = itemHocPhan[0];
            let hocPhan = await app.model.sdhThoiKhoaBieu.get({ maHocPhan });
            if (hocPhan && hocPhan.maMonHoc) {
                let monHoc = await app.model.sdhDmMonHocMoi.get({ ma: hocPhan.maMonHoc });
                hocPhan.tenMonHoc = monHoc && monHoc.tenTiengViet;
            }

            for (let itemMSSV of listMSSV) {
                let sinhVien = await app.model.fwSinhVienSdh.get({ mssv: itemMSSV }, 'mssv, ho, ten, maKhoa, bacDaoTao, namTuyenSinh');
                let message = await checkDKHP(sinhVien, hocPhan, siSo, idDotDangKy);
                let tinhPhi = false;
                if (message.isDangKy == true) {
                    tinhPhi = true;
                    siSo++;
                }
                let tmpMess = { ...message, tinhPhi };
                listMess.push(tmpMess);
            }

            let listData = { listMess, maHocPhan };
            res.send({ listData });
        } catch (error) {
            res.send({ error });
        }
    });
    const checkDKHP = async (sinhVien, hocPhan, siSo, idDotDangKy) => {
        try {
            let message = {
                maHocPhan: hocPhan.maHocPhan,
                mssv: sinhVien.mssv,
                hoTen: sinhVien.ho + ' ' + sinhVien.ten,
                maMonHoc: hocPhan.maMonHoc,
                tenMonHoc: hocPhan.tenMonHoc,
                isDangKy: false,            //isDangKy (đk thành công : đk thất bại)
                isCheck: false,             //dùng để checkbox trong modal dự kiến
                ghiChu: null,
                maLoaiDKy: null,
                loaiMonHoc: null,
                idDotDangKy
            };
            let itemsCheck = await app.model.sdhDangKyHocPhan.checkDkhpInfo(app.utils.stringify({ maHocVien: sinhVien.mssv, idDot: idDotDangKy, maMonHoc: hocPhan.maMonHoc, maHocPhan: hocPhan.maHocPhan }));
            if (itemsCheck && itemsCheck.checkctdt && itemsCheck.checkctdt.length > 0) {
                if (itemsCheck.checkctdt[0].maMonHoc == null && !itemsCheck.checkctdt[0].ngoaiCtdt) {
                    message.isDangKy = false;
                    message.ghiChu = 'Đợt đăng kí không cho đăng kí ngoài chương trình đào tạo';
                    return message;
                }
            }
            if (itemsCheck && itemsCheck.rows && itemsCheck.rows.length > 0) {
                if ((itemsCheck.rows[0].namDuKien != itemsCheck.rows[0].namDangKy || itemsCheck.rows[0].hocKyDuKien != itemsCheck.rows[0].hocKyDangKy) && !itemsCheck.rows[0].ngoaiKeHoach) {
                    message.isDangKy = false;
                    message.ghiChu = 'Đợt đăng kí không cho đăng kí ngoài kế hoạch';
                    return message;
                }
            }
            let items = await app.model.sdhDangKyHocPhan.getAll({ mssv: sinhVien.mssv });//list HP SV da hoc
            if (items.length == 0) {//chua co hoc phan nao
                message.isDangKy = true;
            } else {
                let flag = 0;
                for (let item of items) {
                    let itemHocPhan = await app.model.sdhThoiKhoaBieu.get({ maHocPhan: item.maHocPhan }, 'maMonHoc, nam, hocKy, loaiHinhDaoTao');
                    if (itemHocPhan != null) {
                        if (hocPhan.namHoc == itemHocPhan.namHoc && hocPhan.hocKy == itemHocPhan.hocKy) {//check nam hoc, hoc ky
                            if (hocPhan.maMonHoc == itemHocPhan.maMonHoc && hocPhan.loaiHinhDaoTao == itemHocPhan.loaiHinhDaoTao) {//trùng Hp đã đk học kì này!!
                                flag = 1;
                                message.isDangKy = false;
                                message.ghiChu = 'Môn đã đăng ký trong HK này';
                                break;
                            } else if (hocPhan.maMonHoc == itemHocPhan.maMonHoc) { //trùng HP đã đk học kì này ở hệ khác!!
                                flag = 2;
                                message.isDangKy = true;
                                message.ghiChu = 'Đã đăng ký môn học ở hệ ' + hocPhan.loaiHinhDaoTao;
                            }
                        }
                    }
                    let itemSv = await app.model.sdhDangKyHocPhan.get({ maHocPhan: item.maHocPhan, idDotDangKy: idDotDangKy });
                    if (itemSv != null) {
                        message.isDangKy = false;
                        message.ghiChu = 'Môn đã đăng ký trong đợt này';
                    }
                }
                if (flag == 0) message.isDangKy = true;
            }
            if (message.isDangKy == true) {
                message.isCheck = true;
                let slDuKien = parseInt(hocPhan.soLuongDuKien);
                if (siSo >= slDuKien) message.ghiChu = message.ghiChu ? message.ghiChu + ', lớp đã đầy sĩ số' : 'Lớp đã đầy sĩ số';
            }
            return message;
        } catch (error) {
            return error;
        }
    };

    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('SdhDangKyHocPhanData', (req, fields, files, params, done) =>
        app.permission.has(req, () => sdhDangKyHocPhanImportData(req, fields, files, params, done), done, 'sdhDangKyHocPhan:write')
    );

    const sdhDangKyHocPhanImportData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'SdhDangKyHocPhanData' && files.SdhDangKyHocPhanData && files.SdhDangKyHocPhanData.length) {
            const srcPath = files.SdhDangKyHocPhanData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const falseItem = [];
                    let index = 2;
                    try {
                        while (true) {
                            const mssv = worksheet.getCell('A' + index).text?.toString().trim() || '';
                            if (!mssv) break;
                            const maHocPhan = worksheet.getCell('B' + index).text;
                            let tinhPhi = worksheet.getCell('C' + index).text?.toString().trim() || '';
                            if (tinhPhi == '0') {
                                tinhPhi = false;
                            } else tinhPhi = true;

                            const row = { maHocPhan, mssv, hoTen: null, isDangKy: false, isCheck: false, ghiChu: null, tenTinhTrangSV: null, maTinhTrang: null, tenMonHoc: null, stt: index, tinhPhi, hocPhi: null, tinChi: null };
                            let student = await app.model.fwSinhVienSdh.get({ mssv });
                            let hocPhan = await app.model.sdhThoiKhoaBieu.get({ maHocPhan });
                            if (!student && !hocPhan) {
                                row.ghiChu = 'Không tìm thấy sinh viên và học phần';
                                row.tinhPhi = false;
                                falseItem.push(row);
                            } else {
                                if (!student) {
                                    let monHoc = await app.model.sdhDmMonHocMoi.get({ ma: hocPhan.maMonHoc });
                                    row.tenMonHoc = monHoc?.ten;

                                    row.ghiChu = mssv ? 'Không tìm thấy sinh viên' : 'Vui lòng nhập mã số sinh viên';
                                    row.tinhPhi = false;
                                    falseItem.push(row);
                                } else if (!hocPhan) {
                                    let maTinhTrang = student.tinhTrang;
                                    let tinhTrang = await app.model.dmTinhTrangSinhVien.get({ ma: maTinhTrang });
                                    let tenTinhTrangSV = tinhTrang?.ten;

                                    row.hoTen = `${student.ho} ${student.ten}`;
                                    row.tenTinhTrangSV = tenTinhTrangSV;
                                    row.maTinhTrang = maTinhTrang;

                                    row.ghiChu = maHocPhan ? 'Không tìm thấy học phần' : 'Vui lòng nhập mã học phần';
                                    row.tinhPhi = false;
                                    falseItem.push(row);
                                } else {
                                    let monHoc = await app.model.sdhDmMonHocMoi.get({ ma: hocPhan.maMonHoc });
                                    row.tenMonHoc = monHoc?.ten;
                                    row.tinChi = monHoc?.tongTinChi;

                                    let maTinhTrang = student.tinhTrang;
                                    let tinhTrang = await app.model.dmTinhTrangSinhVien.get({ ma: maTinhTrang });
                                    let tenTinhTrangSV = tinhTrang?.ten;
                                    row.hoTen = `${student.ho} ${student.ten}`;
                                    row.tenTinhTrangSV = tenTinhTrangSV;
                                    row.maTinhTrang = maTinhTrang;
                                    if (hocPhan.tinhTrang == 4) {
                                        row.ghiChu = 'Học phần đã bị hủy';
                                        row.tinhPhi = false;
                                        falseItem.push(row);

                                    } else {
                                        let duplicate = false,
                                            duplicateMH = false,
                                            viTri = 0;
                                        if (items.length > 0) {
                                            for (let i = 0; i < items.length; i++) {
                                                if (mssv == items[i].mssv && maHocPhan == items[i].maHocPhan) {
                                                    duplicate = true;
                                                    viTri = items[i].stt;
                                                    break;
                                                } else if (mssv == items[i].mssv) {
                                                    let itemHocPhan = await app.model.sdhThoiKhoaBieu.get({ maHocPhan: items[i].maHocPhan });
                                                    if (hocPhan.maMonHoc == itemHocPhan.maMonHoc && hocPhan.namHoc == itemHocPhan.namHoc && hocPhan.hocKy == itemHocPhan.hocKy && hocPhan.loaiHinhDaoTao == itemHocPhan.loaiHinhDaoTao) {
                                                        duplicateMH = true;
                                                        items[i].ghiChu = 'Môn học trùng ở hàng ' + index;
                                                        items[i].isCheck = false;
                                                        items[i].isDangKy = false;
                                                        viTri = items[i].stt;
                                                        falseItem.push(items[i]);
                                                        items.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if (duplicate == true || duplicateMH == true) {
                                            if (duplicate == true) row.ghiChu = 'Trùng dữ liệu nhập với hàng ' + viTri;
                                            else if (duplicateMH == true) row.ghiChu = 'Môn học trùng ở hàng ' + viTri;
                                            falseItem.push(row);
                                        } else if (maTinhTrang != 1) {
                                            row.ghiChu = 'Tình trạng sinh viên không phù hợp';
                                            falseItem.push(row);
                                        } else {
                                            const message = await checkDKHP(student, hocPhan, 0);
                                            let stt = index;
                                            let tmpRow = { ...message, tenTinhTrangSV, maTinhTrang, tenMonHoc: monHoc?.ten, stt, tinhPhi };
                                            if (message.isCheck == false) falseItem.push(tmpRow);
                                            else {
                                                items.push(tmpRow);
                                            }

                                        }
                                    }
                                }
                            }
                            index++;
                            if (index % 10 == 0) app.io.to('ImportDkhpExcelSdh').emit('import-single-done-sdh', { requester: req.session.user.email, items, falseItem, index });
                        }
                        app.io.to('ImportDkhpExcelSdh').emit('import-all-done-sdh', { requester: req.session.user.email, items, falseItem });
                        done({ items, falseItem });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    //Export xlsx
    app.get('/api/sdh/dang-ky-hoc-phan/download-template', app.permission.check('sdhDangKyHocPhan:export'), async (req, res) => {
        const workBook = app.excel.create();
        const wsDK = workBook.addWorksheet('Dang_ky_hoc_phan_Template');
        const defaultColumnsDK = [
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'MÃ HỌC PHẦN', key: 'maHocPhan', width: 20 },
            { header: 'TÍNH PHÍ', key: 'tinhPhi', width: 10 },
        ];
        wsDK.columns = defaultColumnsDK;

        app.excel.attachment(workBook, res, 'Dang_ky_hoc_phan_Template.xlsx');
    });

    app.get('/api/sdh/dang-ky-hoc-phan/download-huy-template', app.permission.check('sdhDangKyHocPhan:export'), async (req, res) => {
        const workBook = app.excel.create();
        const wsDK = workBook.addWorksheet('Huy_dang_ky_hoc_phan_Template');
        const defaultColumnsDK = [
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'MÃ HỌC PHẦN', key: 'maHocPhan', width: 20 },
            { header: 'GHI CHÚ', key: 'ghiChu', width: 40 },

        ];
        wsDK.columns = defaultColumnsDK;

        app.excel.attachment(workBook, res, 'Huy_dang_ky_hoc_phan_Template.xlsx');
    });
};
