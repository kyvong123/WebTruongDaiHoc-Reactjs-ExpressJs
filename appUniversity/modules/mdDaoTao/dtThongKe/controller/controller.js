module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7039: {
                title: 'Thống kê', pin: true, backgroundColor: '#D25380',
                link: '/user/dao-tao/thong-ke', icon: 'fa-table'
            },
        },
    };

    app.permission.add(
        { name: 'dtThongKe:manage', menu },
        { name: 'dtThongKe:export' }
    );

    app.permissionHooks.add('staff', 'addRolesDtThongKe', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThongKe:manage', 'dtThongKe:export');
            resolve();
        } else resolve();
    }));


    app.get('/user/dao-tao/thong-ke', app.permission.check('dtThongKe:manage'), app.templates.admin);
    app.get('/user/dao-tao/thong-ke-dang-ky/detail', app.permission.check('dtThongKe:manage'), app.templates.admin);
    app.get('/user/dao-tao/thong-ke-hoc-lai-cai-thien/detail', app.permission.check('dtThongKe:manage'), app.templates.admin);
    app.get('/user/dao-tao/thong-ke-hoc-phi/detail', app.permission.check('dtThongKe:manage'), app.templates.admin);

    // APIs ---------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/thong-ke-qui-mo/all', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            let data = [],
                filter = req.query.filter,
                items = await app.model.dtLichSuDkhp.thongKeQuiMo(app.utils.stringify(filter));
            items = items.rows;

            let listTinhTrang = Object.keys(items.groupBy('tenTinhTrang')),
                listMaNganh = Object.keys(items.groupBy('maNganh'));

            listTinhTrang = listTinhTrang.filter(e => e != 'null');
            listMaNganh = listMaNganh.filter(e => e != 'null');

            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: []
                    };
                listTinhTrang.forEach(tenTinhTrang => {
                    let listTTSV = list.filter(e => e.tenTinhTrang == tenTinhTrang),
                        itemSub = { tenTinhTrang, soLuong: 0 };
                    if (listTTSV.length) itemSub.soLuong = listTTSV[0].soLuong;
                    item.sub.push(itemSub);

                });
                data.push(item);
            });
            res.send({ items: data, listTinhTrang });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-dang-ky/all', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            let data = [],
                filter = req.query.filter,
                listKhoaSV = filter.khoaSinhVien,
                items = await app.model.dtLichSuDkhp.thongKeDangKyGetData(app.utils.stringify(filter));
            items = items.rows;
            listKhoaSV = listKhoaSV.split(',');
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: []
                    };
                listKhoaSV.forEach(khoaSinhVien => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSinhVien),
                        itemSub = { khoaSinhVien, soLuong: 0 };
                    if (listKSV.length) itemSub.soLuong = listKSV[0].soLuong;
                    item.sub.push(itemSub);
                });
                data.push(item);
            });
            res.send({ items: data, listKhoaSV });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-dang-ky/page/:pageNumber/:pageSize', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeDangKySearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-hoc-lai-cai-thien/page/:pageNumber/:pageSize', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeHlCtSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-hoc-lai-cai-thien/all', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            let data = [],
                filter = req.query.filter,
                listKhoaSV = filter.khoaSinhVien,
                items = await app.model.dtLichSuDkhp.thongKeHlCtGetData(app.utils.stringify(filter));
            items = items.rows;
            listKhoaSV = listKhoaSV.split(',');
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: []
                    };
                listKhoaSV.forEach(khoaSinhVien => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSinhVien),
                        itemSub = { khoaSinhVien, isHocLai: 0, isCaiThien: 0 };
                    if (listKSV.length) {
                        itemSub.isHocLai = listKSV[0].isHocLai;
                        itemSub.isCaiThien = listKSV[0].isCaiThien;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });
            res.send({ items: data, listKhoaSV });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-hoc-phi/all', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            let data = [],
                filter = req.query.filter,
                listKhoaSV = filter.khoaSinhVien,
                items = await app.model.dtLichSuDkhp.thongKeHocPhiGetData(app.utils.stringify(filter));
            items = items.rows;
            listKhoaSV = listKhoaSV.split(',');
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: []
                    };
                listKhoaSV.forEach(khoaSinhVien => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSinhVien),
                        itemSub = { khoaSinhVien, hocPhi: 0, daDong: 0 };
                    if (listKSV.length) {
                        itemSub.hocPhi = listKSV[0].hocPhi;
                        itemSub.daDong = listKSV[0].daDong;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });
            res.send({ items: data, listKhoaSV });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeHocPhiSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem-trung-binh/all', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {

            let data = [],
                filter = req.query.filter,
                listKhoaSV = filter.dataNamHoc;
            let items = await app.model.dtLichSuDkhp.thongKeDiemTrungBinhGetData(app.utils.stringify(filter));

            items = items.rows;
            listKhoaSV = listKhoaSV.split(',');
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: []
                    };
                listKhoaSV.forEach(khoaSinhVien => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSinhVien),
                        itemSub = { khoaSinhVien, soSinhVien: 0, avrTong: 0 };
                    if (listKSV.length) {
                        itemSub.soSinhVien = listKSV[0].soSinhVien;
                        itemSub.avrTong = listKSV[0].avrTong;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });
            res.send({ items: data, listKhoaSV });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem-trung-binh/page/:pageNumber/:pageSize', app.permission.check('dtThongKe:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeDiemTrungBinhSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });
};
