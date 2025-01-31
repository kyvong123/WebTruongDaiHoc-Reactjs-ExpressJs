module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7545: {
                title: 'Đợt đăng ký',
                link: '/user/sau-dai-hoc/dot-dang-ky',
                parentKey: 7557
            }
        },
    };
    app.permission.add(
        { name: 'sdhDmDotDangKy:manage', menu },
        { name: 'sdhDmDotDangKy:write' },
        { name: 'sdhDmDotDangKy:delete' },
    );
    app.get('/user/sau-dai-hoc/dot-dang-ky', app.permission.orCheck('sdhDmDotDangKy:write', 'sdhDmDotDangKy:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/cau-hinh-dot-dkhp/edit/:id', app.permission.orCheck('sdhDmDotDangKy:write', 'sdhDmDotDangKy:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDotDangKy', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmDotDangKy:write', 'sdhDmDotDangKy:delete', 'sdhDmDotDangKy:manage');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/dot-dang-ky/page/:pageNumber/:pageSize', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort || null;
            if (sort) {
                filter = { ...filter, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] };
            }
            let page = await app.model.sdhDotDangKy.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/sdh/dot-dang-ky/all', app.permission.orCheck('sdhDmDotDangKy:manage', 'studentSdh:login'), async (req, res) => {
        try {
            const user = req.session.user;
            const items = await app.model.sdhDotDangKy.checkDotDangKy(user.data.mssv);
            const date = new Date().getTime();
            const result = items.rows.filter(ele => ele.batDau <= date && ele.ketThuc >= date).map(element => {
                const rs = {};
                rs.title = 'Tên:' + element.ten + ' năm :' + element.nam + '-' + 'Học kỳ :' + element.hocKy;
                rs.id = element.id;
                return rs;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dot-dang-ky/item/:id', app.permission.orCheck('sdhDmDotDangKy:manage', 'sdhDmDotDangKy:write'), async (req, res) => {
        try {
            const data = await app.model.sdhDotDangKy.get({ id: req.params.id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dot-dang-ky', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let data = req.body.item;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            data.isDelete = 0;

            let listLoaiHinhDaoTao = data.loaiHinhDaoTao && data.loaiHinhDaoTao.split(', '),
                listKhoa = data.khoa && data.khoa.split(', '),
                listKhoaSV = data.khoaSinhVien && data.khoaSinhVien.split(', ');
            const listMaKhungDaoTao = await app.model.sdhKhungDaoTao.getAll({
                statement: 'maKhoa IN (:listKhoa) AND khoaHocVien IN (:listKhoaSV) AND bacDaoTao IN (:listLoaiHinhDaoTao)',
                parameter: {
                    listKhoa,
                    listKhoaSV,
                    listLoaiHinhDaoTao
                }
            }, 'id');
            const listMaHocPhan = await app.model.sdhThoiKhoaBieu.getAll({
                statement: 'khoaDangKy IN (:listKhoa) AND khoaSinhVien IN (:listKhoaSV) AND loaiHinhDaoTao IN (:listLoaiHinhDaoTao) AND tinhTrang IN (:listTinhTrang)',
                parameter: {
                    listKhoa,
                    listKhoaSV,
                    listLoaiHinhDaoTao,
                    listTinhTrang: [1, 2]
                }
            }, 'maHocPhan');
            await checkTimeCH(data, null);
            let nam = data.nam.split(' - ');
            nam = parseInt(nam[0]);
            const newItem = await app.model.sdhDotDangKy.create({ ...data, nam: `${nam} - ${nam + 1}`, kichHoat: 0 });
            let { hocKy } = data;
            let listSv = await app.model.sdhDotDangKy.getListStudents(app.utils.stringify({ listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(), listKhoa: listKhoa.toString(), listKhoaSV: listKhoaSV.toString(), nam, hocKy }));

            // let listMaHocPhan = await app.model.sdhThoiKhoaBieu.getAll({
            //     nam: parseInt(data.nam.split(' - ')[1]),
            //     hocKy: parseInt(hocKy)
            // });
            for (let itemHocPhan of listMaHocPhan) {
                let item = {
                    idDot: newItem.id,
                    kichHoat: 1,
                    maHocPhan: itemHocPhan.maHocPhan,
                };
                await app.model.sdhDshpDotDkhp.create(item);
            }
            for (let sinhVien of listSv.rows) {
                let data = {
                    idDot: newItem.id,
                    mssv: sinhVien.mssv,
                    kichHoat: 1,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                if (sinhVien.tinhTrang != 1) data.kichHoat = 0;
                await app.model.sdhDssvDotDkhp.create(data);
            }

            for (let itemLHDT of listLoaiHinhDaoTao) {
                let item = {
                    loaiHinhDaoTao: itemLHDT,
                    idDot: newItem.id,

                };
                await app.model.sdhDkhpLhdt.create(item);
            }
            for (let itemKhoa of listKhoa) {
                let item = {
                    idDot: newItem.id,
                    khoa: itemKhoa,
                };
                await app.model.sdhDkhpKhoa.create(item);
            }
            for (let itemKhoaSV of listKhoaSV) {
                let item = {
                    idDot: newItem.id,
                    khoaHocVien: itemKhoaSV,
                };
                await app.model.sdhDkhpKhoaHocVien.create(item);
            }
            // TODO KHUNG DAO TAO
            for (let itemKhungDaoTao of listMaKhungDaoTao) {
                let item = {
                    idDot: newItem.id,
                    khungDaoTao: itemKhungDaoTao.id,
                };
                await app.model.sdhDkhpKhungDt.create(item);
            }
            res.send({ item: newItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/sdh/dot-dang-ky', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let id = req.body.id,
                changes = req.body.changes;

            const user = req.session.user.email, now = Date.now();
            let kichHoat = 0;
            let item = await app.model.sdhDotDangKy.get({ id });
            if (changes.ngayKetThuc && changes.ngayKetThuc != item.ngayKetThuc) {
                await checkTimeCH(changes, id);
            }
            if (changes.kichHoat === 'true' || changes.kichHoat === 'false') kichHoat = changes.kichHoat === 'true' ? 1 : 0;
            item = await app.model.sdhDotDangKy.update({ id }, { ...changes, kichHoat, modifier: user, timeModified: now });

            if (changes.check === 'true') {
                let listLoaiHinhDaoTao = item.loaiHinhDaoTao && item.loaiHinhDaoTao.split(', '),
                    listKhoa = item.khoa && item.khoa.split(', '),
                    listKhoaSV = item.khoaSinhVien && item.khoaSinhVien.split(', ');
                let { nam, hocKy } = changes;
                nam = nam.split(' - ');
                nam = nam[0];
                await app.model.sdhDssvDotDkhp.delete({ idDot: id });
                let listSv = await app.model.sdhDotDangKy.getListStudents(app.utils.stringify({ listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(), listKhoa: listKhoa.toString(), listKhoaSV: listKhoaSV.toString(), nam, hocKy }));
                for (let sinhVien of listSv.rows) {
                    let data = {
                        idDot: id,
                        mssv: sinhVien.mssv,
                        kichHoat: 1,
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                    };
                    if (sinhVien.tinhTrang != 1) data.kichHoat = 0;
                    await app.model.sdhDssvDotDkhp.create(data);
                }

                await app.model.sdhDkhpLhdt.delete({ idDot: id });
                for (let itemLHDT of listLoaiHinhDaoTao) {
                    let item = { loaiHinhDaoTao: itemLHDT, idDot: id, };
                    await app.model.sdhDkhpLhdt.create(item);
                }

                await app.model.sdhDkhpKhoa.delete({ idDot: id });
                for (let itemKhoa of listKhoa) {
                    let item = { idDot: id, khoa: itemKhoa, };
                    await app.model.sdhDkhpKhoa.create(item);
                }

                await app.model.sdhDkhpKhoaHocVien.delete({ idDot: id });
                for (let itemKhoaSV of listKhoaSV) {
                    let item = { idDot: id, khoaSinhVien: itemKhoaSV, };
                    await app.model.sdhDkhpKhoaHocVien.create(item);
                }
            } else if (changes.active === 'true') {
                await app.model.sdhDotDangKy.update({
                    statement: 'ngayKetThuc < :now',
                    parameter: { now }
                }, { active: 0 });
                await app.dkhpRedis.hotInit(id);
            } else if (changes.active === 'false') {
                await app.model.sdhDotDangKy.update({
                    statement: 'ngayKetThuc < :now',
                    parameter: { now }
                }, { active: 0 });
            }

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/sdh/dot-dang-ky', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        app.model.sdhDotDangKy.delete({ id: req.body.id }, error => res.send({ error }));
        try {
            let id = req.body.id;
            await app.model.sdhDotDangKy.delete({ id });
            await app.model.sdhDkhpKhoa.delete({ idDot: id });
            await app.model.sdhDkhpKhoaHocVien.delete({ idDot: id });
            await app.model.sdhDkhpKhungDt.delete({ idDot: id });
            await app.model.sdhDkhpLhdt.delete({ idDot: id });
            await app.model.sdhDshpDotDkhp.delete({ idDot: id });
            await app.model.sdhDssvDotDkhp.delete({ idDot: id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
    const checkTimeCH = async (data, id) => {
        let listLoaiHinhDaoTao = data.loaiHinhDaoTao && data.loaiHinhDaoTao.split(', '),
            listKhoa = data.khoa && data.khoa.split(', '),
            listKhoaSV = data.khoaSinhVien && data.khoaSinhVien.split(', ');
        let checkLHDT = false,
            checkKhoa = false,
            checkKhoaSV = false;
        let listDot = await app.model.dtCauHinhDotDkhp.getAll({ namHoc: data.namHoc, hocKy: data.hocKy }); //list cấu hình hx phần đã tạo ở NH, HK này
        if (id) listDot = listDot.filter(e => e.id != id);
        if (listDot.length != 0) {
            for (let itemDot of listDot) {
                if (!(data.ngayKetThuc <= itemDot.ngayBatDau || data.ngayBatDau >= itemDot.ngayKetThuc)) { //Check ngày có lồng nhau hay không
                    let listLHDT = await app.model.dtChdkhpLhdt.getAll({ idDot: itemDot.id }); //Kiểm tra Loại hình đào tạo có trùng!!
                    for (let itemLHDT of listLHDT) {
                        let checkItem = listLoaiHinhDaoTao.includes(itemLHDT.loaiHinhDaoTao);
                        if (checkItem == true) {
                            checkLHDT = true;
                            break;
                        }
                    }
                    let listKDT = await app.model.dtChdkhpKhoa.getAll({ idDot: itemDot.id }); //Kiểm tra Khoa có trùng!!
                    for (let itemKDT of listKDT) {
                        let checkItem = listKhoa.includes(itemKDT.khoa.toString());
                        if (checkItem == true) {
                            checkKhoa = true;
                            break;
                        }
                    }
                    let listKSV = await app.model.dtChdkhpKhoaSv.getAll({ idDot: itemDot.id }); //Kiểm tra Khóa sinh viên có trùng!!
                    for (let itemKSV of listKSV) {
                        let checkItem = listKhoaSV.includes(itemKSV.khoaSinhVien.toString());
                        if (checkItem == true) {
                            checkKhoaSV = true;
                            break;
                        }
                    }
                    if (checkLHDT == true && checkKhoa == true && checkKhoaSV == true) {
                        throw 'Bị trùng thời gian đăng ký với đợt ' + itemDot.tenDot;
                    }
                }
            }
        }
    };

    app.get('/api/sdh/dot-dang-ky/count', app.permission.check('sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            let id = req.query.id;
            const length = await app.model.sdhDssvDotDkhp.count({ idDot: id, kichHoat: 1 });
            res.send({ count: length.rows[0]['COUNT(*)'] });
        } catch (error) {
            res.send({ error });
        }
    });
};