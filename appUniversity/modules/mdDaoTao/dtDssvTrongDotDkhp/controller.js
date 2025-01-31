module.exports = app => {
    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dssv-trong-dot-dkhp/page/:pageNumber/:pageSize', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort, idDot = parseInt(req.query.iddot);
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtDssvTrongDotDkhp.listSinhVien(_pageNumber, _pageSize, filter, searchTerm, idDot);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dssv-trong-dot-dkhp/all', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const items = await app.model.dtDssvTrongDotDkhp.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dssv-trong-dot-dkhp/dssv', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            let idDot = req.query.idDot;
            let items = await app.model.dtDssvTrongDotDkhp.getAll({ idDot: idDot });
            for (let item of items) {
                let sinhVien = await app.model.fwStudent.get({ mssv: item.mssv });
                let khoa = await app.model.dmDonVi.get({ ma: sinhVien.khoa });
                let hoTen = sinhVien.ho + ' ' + sinhVien.ten;

                item.loaiHinhDaoTao = sinhVien.loaiHinhDaoTao;
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

    app.get('/api/dt/dssv-trong-dot-dkhp/sinh-vien', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const { list } = req.query;
            let { loaiHinhDaoTao, khoa, khoaSinhVien } = list;
            const listSV = [];
            if (loaiHinhDaoTao && khoa && khoaSinhVien) {
                for (let itemLHDT of loaiHinhDaoTao) {
                    for (let itemKhoa of khoa) {
                        let khoa = await app.model.dmDonVi.get({ ma: itemKhoa });
                        for (let itemKhoaSV of khoaSinhVien) {
                            let sinhVien = await app.model.fwStudent.getAll({ loaiHinhDaoTao: itemLHDT, khoa: itemKhoa, namTuyenSinh: itemKhoaSV });
                            if (sinhVien) {
                                for (let itemSV of sinhVien) {
                                    let hoTen = itemSV.ho + ' ' + itemSV.ten;
                                    let item = {
                                        mssv: itemSV.mssv,
                                        kichHoat: 1,
                                        loaiHinhDaoTao: itemSV.loaiHinhDaoTao,
                                        khoa: itemSV.khoa,
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

    app.get('/api/dt/dssv-trong-dot-dkhp/item/:id', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.dtDssvTrongDotDkhp.get({ id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dssv-trong-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let data = req.body.item;
            await app.model.dtDssvTrongDotDkhp.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dssv-trong-dot-dkhp/checkDuplicated', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let { maSoSV, ngayBatDau, ngayKetThuc } = req.query;
            let message = null,
                dataSinhVien = null;
            let items = await app.model.dtDssvTrongDotDkhp.checkDuplicated(maSoSV, ngayBatDau, ngayKetThuc);
            items = items.rows;
            if (items.length != 0) message = 'Sinh viên đã đã có trong đợt đăng ký học phần: ' + items[0].tenDot;
            else {
                dataSinhVien = await app.model.fwStudent.getData(maSoSV);
                dataSinhVien = dataSinhVien.rows[0];
            }

            res.send({ items: { message, dataSinhVien } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dssv-trong-dot-dkhp/list', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let { data } = req.body,
                { listSV, idDot } = data,
                modifier = req.session.user.email;

            listSV = listSV.split('; ');
            await app.model.dtCauHinhDotDkhp.checkListSinhVien({ listStudent: listSV, idDot, modifier, isCreate: 1 });

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dssv-trong-dot-dkhp/reload', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let { idDot } = req.body;
            let listMienNN = await app.model.dtDssvTrongDotDkhp.getAll({ idDot, isMienNgoaiNgu: 1 }).then(list => list.map(i => i.mssv));
            await app.model.dtDssvTrongDotDkhp.delete({ idDot });

            const data = await app.model.dtCauHinhDotDkhp.get({ id: idDot });
            let listLoaiHinhDaoTao = data.loaiHinhDaoTao.split(', '),
                listKhoa = data.khoa.split(', '),
                listKhoaSV = data.khoaSinhVien.split(', '),
                { namHoc, hocKy } = data,
                modifier = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtCauHinhDotDkhp.checkSinhVienDangKy({ listLoaiHinhDaoTao, listKhoa, listKhoaSV, namHoc, hocKy, congNo: data.congNo, ngoaiNgu: data.ngoaiNgu, idDot, modifier, timeModified, listMienNN });

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/dssv-trong-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let id = req.body.id,
                item = req.body.changes;
            let changes = {
                kichHoat: item.kichHoat,
                modifier: req.session.user.email,
                timeModified: Date.now(),
                ghiChu: item.ghiChu
            };
            let items = await app.model.dtDssvTrongDotDkhp.update({ id }, changes);

            if (item.kichHoat) {
                await app.model.fwStudent.initCtdtRedis(item.mssv);
            } else {
                let allKeys = await app.database.dkhpRedis.keys(`CTDT:${item.mssv}|*`);
                await app.database.dkhpRedis.del(allKeys);
            }
            item.kichHoat = items.kichHoat;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/dssv-trong-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.dtDssvTrongDotDkhp.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    //Controller_Sinh_Vien_Dao_Tao ----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dssv-trong-dot-dkhp/student/:pageNumber/:pageSize', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
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

    app.get('/api/dt/dssv-trong-dot-dkhp/student/:mssv', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let dataSinhVien = await app.model.fwStudent.getData(mssv);
            res.send({ items: dataSinhVien.rows[0] });
        } catch (error) {
            res.send({ error });
        }
    });
};