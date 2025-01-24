module.exports = app => {
    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/dssv-trong-dot-dkhp/page/:pageNumber/:pageSize', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort, idDot = parseInt(req.query.iddot);
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.sdhDssvDotDkhp.listSinhVien(_pageNumber, _pageSize, filter, searchTerm, idDot);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/all', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const items = await app.model.sdhDssvDotDkhp.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/dssv', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            let idDot = req.query.idDot;
            let items = await app.model.sdhDssvDotDkhp.getAll({ idDot: idDot });
            for (let item of items) {
                let sinhVien = await app.model.fwSinhVienSdh.get({ mssv: item.mssv });
                let khoa = await app.model.dmKhoaSauDaiHoc.get({ ma: sinhVien.maKhoa });
                let hoTen = sinhVien.ho + ' ' + sinhVien.ten;

                item.loaiHinhDaoTao = sinhVien.bacDaoTao;
                item.khoa = sinhVien.khoa;
                item.khoaSinhVien = sinhVien.namTuyenSinh;

                item.hoTen = hoTen;
                item.tenKhoa = khoa.ten;
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/sinh-vien', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const { list } = req.query;
            let { loaiHinhDaoTao, khoa, khoaSinhVien } = list;
            const listSV = [];
            if (loaiHinhDaoTao && khoa && khoaSinhVien) {
                for (let itemLHDT of loaiHinhDaoTao) {
                    for (let itemKhoa of khoa) {
                        let khoa = await app.model.dmKhoaSauDaiHoc.get({ ma: itemKhoa });
                        for (let itemKhoaSV of khoaSinhVien) {
                            let sinhVien = await app.model.fwSinhVienSdh.getAll({ bacDaoTao: itemLHDT, maKhoa: itemKhoa, namTuyenSinh: itemKhoaSV });
                            if (sinhVien) {
                                for (let itemSV of sinhVien) {
                                    let hoTen = itemSV.ho + ' ' + itemSV.ten;
                                    let item = {
                                        mssv: itemSV.mssv,
                                        kichHoat: 1,
                                        loaiHinhDaoTao: itemSV.bacDaoTao,
                                        khoa: itemSV.maKhoa,
                                        khoaSinhVien: itemSV.namTuyenSinh,
                                        lop: itemSV.lop,

                                        hoTen: hoTen,
                                        tenKhoa: khoa.ten,
                                    };
                                    listSV.push(item);
                                }
                            }
                        }
                    }
                }
            }
            res.send({ listSV });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/item/:id', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.sdhDssvDotDkhp.get({ id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dssv-trong-dot-dkhp', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let data = req.body.item;
            await app.model.sdhDssvDotDkhp.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/checkDuplicated', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let { maSoSV, ngayBatDau, ngayKetThuc } = req.query;
            let message = null,
                dataSinhVien = null;
            let items = await app.model.sdhDssvDotDkhp.checkDuplicated(maSoSV, ngayBatDau, ngayKetThuc);
            items = items.rows;
            if (items.length != 0) message = 'Sinh viên đã đã có trong đợt đăng ký học phần: ' + items[0].tenDot;
            else {
                dataSinhVien = await app.model.fwSinhVienSdh.getData(maSoSV);
                dataSinhVien = dataSinhVien.rows[0];
            }

            res.send({ items: { message, dataSinhVien } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dssv-trong-dot-dkhp/list', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let { listSV, idDot } = data;
            listSV = listSV.split('; ');

            for (let item of listSV) {
                let data = {
                    idDot: idDot,
                    mssv: item,
                    kichHoat: 1,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                await app.model.sdhDssvDotDkhp.create(data);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/dssv-trong-dot-dkhp', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let { listSinhVien, idDot } = req.body.changes || { listSinhVien: [], listSinhVienChon: [], idDot: null },
                item = req.body.item;
            if (listSinhVien.filter(ele => ele.isChon == 1).length == 0) {
                let changes = {
                    kichHoat: item.kichHoat,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                await app.model.sdhDssvDotDkhp.update({ idDot: idDot, mssv: item.mssv }, changes);
            } else if (listSinhVien.filter(ele => ele.isChon == 1).length > 0) {
                listSinhVien.filter(ele => ele.isChon == 1).forEach(async ele => {
                    let changes = {
                        kichHoat: item.kichHoat,
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                    };
                    await app.model.sdhDssvDotDkhp.update({ idDot: idDot, mssv: ele.mssv }, changes);
                });
                if (listSinhVien.filter(ele => ele.isChon == 1).every(ele => ele.mssv != item.mssv)) {
                    let changes = {
                        kichHoat: item.kichHoat,
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                    };
                    await app.model.sdhDssvDotDkhp.update({ idDot: idDot, mssv: item.mssv }, changes);
                }
            }
            res.send({ item: idDot });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sdh/dssv-trong-dot-dkhp', app.permission.check('sdhDmDotDangKy:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.sdhDssvDotDkhp.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    //Controller_Sinh_Vien_Dao_Tao ----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/dssv-trong-dot-dkhp/student/:pageNumber/:pageSize', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwSinhVienSdh.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dssv-trong-dot-dkhp/student/:mssv', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let dataSinhVien = await app.model.fwSinhVienSdh.getData(mssv);
            res.send({ items: dataSinhVien.rows[0] });
        } catch (error) {
            res.send({ error });
        }
    });
};