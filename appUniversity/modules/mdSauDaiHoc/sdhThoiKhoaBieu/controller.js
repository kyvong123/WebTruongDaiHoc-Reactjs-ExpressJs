module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7504: {
                title: 'Thời khóa biểu', groupIndex: 1,
                link: '/user/sau-dai-hoc/thoi-khoa-bieu', icon: 'fa-calendar'
            }
        }
    };

    app.permission.add(
        { name: 'sdhThoiKhoaBieu:read', menu },
        'sdhThoiKhoaBieu:write',
        'sdhThoiKhoaBieu:manage',
    );

    app.permissionHooks.add('staff', 'addRolesSdhThoiKhoaBieu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhThoiKhoaBieu:read', 'sdhThoiKhoaBieu:write', 'sdhThoiKhoaBieu:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/thoi-khoa-bieu', app.permission.orCheck('sdhThoiKhoaBieu:read', 'sdhThoiKhoaBieu:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.orCheck('sdhThoiKhoaBieu:read', 'sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTearm = typeof req.query.searchTearm == 'string' ? req.query.searchTearm : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.sdhThoiKhoaBieu.searchPage(_pageNumber, _pageSize, filter, searchTearm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: data } = page;
            const pageCondition = searchTearm;
            const list = data && Object.values(data.reduce((acc, curr) => {
                acc[curr.maHocPhan] = acc[curr.maHocPhan] || { maHocPhan: curr.maHocPhan, data: [] };
                acc[curr.maHocPhan].data.push(curr);
                return acc;
            }, {}));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/thoi-khoa-bieu/all', app.permission.orCheck('sdhThoiKhoaBieu:read'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            condition && Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
            await app.model.sdhThoiKhoaBieu.getAll(condition, '*', 'id ASC ', (error, items) => res.send({ error, items }));
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/thoi-khoa-bieu/get/:pageNumber/:pageSize', app.permission.orCheck('sdhThoiKhoaBieu:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {};
            filter = app.utils.stringify(app.clone(filter));
            let page = await app.model.sdhThoiKhoaBieu.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/thoi-khoa-bieu/item/:id', app.permission.orCheck('sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const data = await app.model.sdhThoiKhoaBieu.get({ id: req.params.id });
            const monHoc = await app.model.sdhDmMonHocMoi.get({ ma: data.maMonHoc, kichHoat: 1 }, 'tenTiengViet', 'ma');
            res.send({ data: { ...data, tenTiengViet: monHoc ? monHoc.tenTiengViet : '' } });
        } catch (error) {
            res.send({ error });
        }
    });

    //update Trong so diem database with GK & CK & can be change
    app.post('/api/sdh/thoi-khoa-bieu/create-multiple', app.permission.check('sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const { data, infoKDT } = req.body;
            let errorList = [];
            const loaiHinhDaoTao = 'SDH',
                bacDaoTao = infoKDT.item.bacDaoTao,
                khoaDangKy = infoKDT.item.maKhoa,
                khoaSinhVien = infoKDT.item.khoaHocVien,
                nam = parseInt(data[0].data[0].namHoc.substring(0, 4)),
                hocKy = data[0].data[0].hocKyNam,
                maKhungDaoTao = infoKDT.item.id;
            const phanHe = await app.model.dmHocSdh.get({ ma: bacDaoTao });
            for (const monHoc of data) {
                const maMonHoc = monHoc.maMonHoc;
                let maHocPhan = phanHe.tenVietTat + monHoc.data[0].maHocKy + monHoc.maMonHoc, count = 0;
                await app.model.sdhThoiKhoaBieu.count({ maMonHoc: maMonHoc, hocKy: hocKy, nam: nam }, (error, data) => count = data ? data.rows[0]['COUNT(*)'] : 0);
                maHocPhan += count < 9 ? `L0${count + 1}` : `L${count + 1}`;
                const listHocPhan = monHoc.data.map(item => {
                    return ({
                        id: item.id, maMonHoc: maMonHoc, maHocPhan: maHocPhan, hocKy: hocKy, nam: nam, loaiHinhDaoTao: loaiHinhDaoTao, bacDaoTao: bacDaoTao, khoaDangKy: khoaDangKy,
                        khoaSinhVien: khoaSinhVien, giangVien: item.giangVien, loaiMonHoc: item.loaiMonHoc,
                        ngayBatDau: item.ngayBatDau, ngayKetThuc: item.ngayKetThuc, soTietBuoi: item.soTietBuoi,
                        thu: item.thu, tietBatDau: item.tietBatDau, tinChiLyThuyet: item.tinChiLyThuyet, tinChiThucHanh: item.tinChiThucHanh,
                        tinhTrang: '1', maKhungDaoTao: maKhungDaoTao
                    });
                });

                for (const hocPhan of listHocPhan) {
                    try {
                        await app.model.sdhThoiKhoaBieu.create(hocPhan);
                        await app.model.sdhChuongTrinhDaoTao.update({ id: hocPhan.id }, { isDuyet: 1, maHocPhan: maHocPhan });
                    } catch (error) {
                        errorList.push(error);
                    }
                }

            }
            res.send({ items: phanHe, error: errorList.length ? errorList : null });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.put('/api/sdh/thoi-khoa-bieu/update/multi', app.permission.check('sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const { changes, idList } = req.body;
            await app.model.sdhThoiKhoaBieu.update({
                statement: 'maHocPhan IN (:idList)',
                parameter: {
                    idList: idList
                }
            }, changes);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/sdh/thoi-khoa-bieu/condition/tinh-trang', app.permission.check('sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            await app.model.sdhThoiKhoaBieu.update({ maHocPhan: ma }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/thoi-khoa-bieu/item', app.permission.check('sdhThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.sdhThoiKhoaBieu.update({ id }, changes);
            await app.model.sdhChuongTrinhDaoTao.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};