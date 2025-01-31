module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7030: {
                title: 'Đăng ký học phần', link: '/user/dao-tao/edu-schedule/dang-ky-hoc-phan', groupIndex: 1, parentKey: 7029,
                icon: 'fa-handshake-o', backgroundColor: '#EB6440', subTitle: 'Chuyên viên'
            }
        }
    };
    app.permission.add(
        { name: 'dtDangKyHocPhan:manage', menu },
        { name: 'dtDangKyHocPhan:write', menu },
        { name: 'dtDangKyHocPhan:delete' },
        'dtDangKyHocPhan:export'
    );
    app.get('/user/dao-tao/edu-schedule/dang-ky-hoc-phan', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDangKyHocPhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export');
            resolve();
        } else resolve();
    }));

    // APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dang-ky-hoc-phan/page/:pageNumber/:pageSize', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {};
            let page = null;
            if (filter.tinhTrang) {
                page = await app.model.dtDangKyHocPhan.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            } else {
                let sort = filter.sort;
                filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
                page = await app.model.dtDangKyHocPhan.timeSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            }
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/dt/dang-ky-hoc-phan/students/page/:pageNumber/:pageSize', app.permission.orCheck('dtDangKyHocPhan:manage', 'staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'mssv_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwStudent.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            let listSV = list.map(item => ({
                tenLoaiHinhDaoTao: item.tenLoaiHinhDaoTao,
                loaiHinhDaoTao: item.loaiHinhDaoTao,
                ho: item.ho,
                ten: item.ten,
                isChon: 0,
                lop: item.lop,
                mssv: item.mssv,
                namTuyenSinh: item.namTuyenSinh,
                tenNganh: item.tenNganh,
                tenTinhTrangSV: item.tinhTrangSinhVien,
                tinhTrang: item.tinhTrang,
                tinhPhi: item.tinhPhi,
                khoa: item.khoa,
                tenKhoa: item.tenKhoa,
                sdt: item.dienThoaiCaNhan
            }));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list: listSV } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/all', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let kichHoat = req.query.kichHoat;
            let condition = kichHoat ? { kichHoat: 1 } : {};
            const data = await app.model.dtDangKyHocPhan.getAll(condition);
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/item/:id', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.dtDangKyHocPhan.get({ id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/student/all', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let items = await app.model.dtDangKyHocPhan.getData(filter);
            items = items.rows.map(item => {
                item.isChon = 0;
                return item;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/hoc-phan/all', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let index = 0,
                items = [],
                filterhp = req.query.filterhp || {}, sort = filterhp?.sort;
            filterhp = app.utils.stringify(app.clone(filterhp, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let listHP = await app.model.dtDangKyHocPhan.getDataHocPhan(filterhp);
            listHP = listHP.rows.groupBy('maHocPhan');

            for (const [, value] of Object.entries(listHP)) {
                if (index == 50) break;
                items.push(...value);
                index++;
            }

            items = items.map(item => {
                item.isChon = 0;
                item.maLoaiDky = null;
                if (item.soLuongDuKien == null) item.soLuongDuKien = 100;
                return item;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/hoc-phan-ctdt/all', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { mssv, maLoaiDky } = req.query || {},
                filterSV = req.query.filterSV || {}, sort = filterSV?.sort,
                listHocPhan = [];
            filterSV = app.utils.stringify(app.clone(filterSV, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));

            let listCtdt = await app.model.dtDangKyHocPhan.getListCtdt(app.utils.stringify({ mssvFilter: mssv }));
            let list = await app.model.dtDangKyHocPhan.getDataHocPhan(filterSV);
            list = list.rows;
            listCtdt = listCtdt.rows;

            if (listCtdt.length) {
                for (let monHoc of listCtdt) {
                    list.filter(e => e.maMonHoc == monHoc.maMonHoc)
                        .forEach(item => {
                            if (monHoc.namHocDuKien == item.namHoc && parseInt(monHoc.hocKyDuKien) == item.hocKy) item.maLoaiDky = 'KH';
                            else item.maLoaiDky = 'NKH';
                            item.isChon = 0;
                            if (item.soLuongDuKien == null) item.soLuongDuKien = 100;
                            if (maLoaiDky == '' || item.maLoaiDky == maLoaiDky) listHocPhan.push(item);
                        });
                }
            }
            res.send({ listHocPhan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/check-diem-lich-thi', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let listFalse = { lichThi: [], diem: [], hocPhi: [] },
                { listHocPhan, mssv } = req.query || {};
            for (let maHocPhan of listHocPhan) {
                let lichThi = await app.model.dtExam.getAll({ maHocPhan }),
                    diem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv }),
                    hocPhi = await app.model.tcHocPhiSubDetail.get({ maHocPhan, mssv, active: 1 });
                if (lichThi.length) listFalse.lichThi.push(maHocPhan);
                if (diem.length) listFalse.diem.push(maHocPhan);
                if (hocPhi) {
                    if (hocPhi.soTienCanDong != 0 && hocPhi.soTienDaDong != 0) listFalse.hocPhi.push(maHocPhan);
                }
            }
            res.send({ listFalse });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/check-list-sv', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let listFalse = [], listHocPhi = [], checkLichThi = false,
                { maHocPhan, listMssv } = req.query || {};
            let lichThi = await app.model.dtExam.getAll({ maHocPhan });
            if (lichThi.length) checkLichThi = true;
            for (let mssv of listMssv) {
                let diem = await app.model.dtDiemAll.getAll({ maHocPhan, mssv }),
                    hocPhi = await app.model.tcHocPhiSubDetail.get({ maHocPhan, mssv, active: 1 });
                if (diem.length) listFalse.push(mssv);
                if (hocPhi) {
                    if (hocPhi.soTienCanDong != 0 && hocPhi.soTienDaDong != 0) listHocPhi.push(mssv);
                }
            }
            res.send({ checkLichThi, listFalse, listHocPhi });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/check-trung-lich', app.permission.orCheck('dtDangKyHocPhan:manage', 'staff:login'), async (req, res) => {
        try {
            const { listSV, maHocPhan, newMaHocPhan, filter } = req.query.data,
                dataTuan = await app.model.dtThoiKhoaBieuCustom.getAll({ maHocPhan: newMaHocPhan }),
                listTrung = [];

            for (let mssv of listSV) {
                const listDky = await app.model.dtDangKyHocPhan.getAll({
                    statement: 'namHoc = :namHoc AND hocKy = :hocKy AND maHocPhan != :maHocPhan AND mssv = :mssv',
                    parameter: { namHoc: filter.namHoc, hocKy: filter.hocKy, maHocPhan, mssv }
                }, 'maHocPhan');

                const lichHoc = await app.model.dtThoiKhoaBieuCustom.getAll({
                    statement: 'maHocPhan IN (:list) AND isNghi IS NULL AND isNgayLe IS NULL',
                    parameter: { list: listDky.map(i => i.maHocPhan) }
                });

                const isTrung = lichHoc.find(lich => dataTuan.find(tuan => !((lich.thoiGianBatDau > tuan.thoiGianKetThuc) || (lich.thoiGianKetThuc < tuan.thoiGianBatDau))));
                if (isTrung) listTrung.push({ mssv, maHocPhan: isTrung.maHocPhan });
            }

            res.send({ listTrung });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //check
    app.get('/api/dt/dang-ky-hoc-phan', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { listMSSV, itemHocPhan } = req.query.list;
            listMSSV = listMSSV.split('; ');
            let listMess = [];

            itemHocPhan = itemHocPhan.split(', ');
            let siSo = itemHocPhan[1] == 'null' ? 0 : parseInt(itemHocPhan[1]);
            let maHocPhan = itemHocPhan[0];
            let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan });
            let monHocKhongTinhPhi = await app.model.dtDmMonHocKhongTinhPhi.get({ maMonHoc: hocPhan.maMonHoc });

            for (let itemMSSV of listMSSV) {
                let message = await app.model.dtDangKyHocPhan.checkDangKy(itemMSSV, maHocPhan, siSo);
                if (message.isDangKy == true) {
                    if (!monHocKhongTinhPhi) message.tinhPhi = true;
                    siSo++;
                }
                listMess.push(message);
            }

            let listData = { listMess, maHocPhan };
            res.send({ listData });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/student', app.permission.orCheck('staff:teacher', 'dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let { id, filter, sort } = req.query;
            let items = await app.model.dtDangKyHocPhan.getStudent(id, app.utils.stringify(filter || {}), sort.split('_')[0], sort.split('_')[1]);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/student/hoc-phan', app.permission.orCheck('dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write', 'staff:login'), async (req, res) => {
        try {
            let { mssv, filter } = req.query,
                sort = filter?.sort || 'maHocPhanKQ_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let items = await app.model.dtDangKyHocPhan.getKetQuaDangKy(mssv, filter);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/so-luong-dky', app.permission.check('dtDangKyHocPhan:manage'), async (req, res) => {
        try {
            let filter = req.query.filter;
            let items = await app.model.dtDangKyHocPhan.getStatistic(app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dang-ky-hoc-phan/hoc-phan-student', app.permission.orCheck('dtDangKyHocPhan:manage', 'staff:login'), async (req, res) => {
        try {
            const { condition, mssv } = req.query,
                items = await app.model.dtDangKyHocPhan.getHocPhanDky(app.utils.stringify({ searchTerm: condition, maSoSv: mssv }));

            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });
};