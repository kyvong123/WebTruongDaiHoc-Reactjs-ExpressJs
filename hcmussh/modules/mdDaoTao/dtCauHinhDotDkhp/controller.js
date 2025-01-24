module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7033: {
                title: 'Cấu hình đợt đăng ký học phần', link: '/user/dao-tao/edu-schedule/cau-hinh-dkhp', groupIndex: 1, parentKey: 7029,
                icon: 'fa-cogs', backgroundColor: '#F7C04A'
            }
        }
    };
    app.permission.add(
        { name: 'dtCauHinhDotDkhp:manage', menu },
        { name: 'dtCauHinhDotDkhp:write' },
        { name: 'dtCauHinhDotDkhp:active' },
        { name: 'dtCauHinhDotDkhp:delete' }
    );

    app.get('/user/dao-tao/edu-schedule/cau-hinh-dkhp', app.permission.check('dtCauHinhDotDkhp:manage'), app.templates.admin);
    app.get('/user/dao-tao/edu-schedule/cau-hinh-dkhp/edit/:id', app.permission.check('dtCauHinhDotDkhp:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtCauHinhDotDkhp', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCauHinhDotDkhp:manage', 'dtCauHinhDotDkhp:write', 'dtCauHinhDotDkhp:delete', 'dtCauHinhDotDkhp:active');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/cau-hinh-dot-dkhp/page/:pageNumber/:pageSize', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtCauHinhDotDkhp.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    // Activate redis ----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('dtCauHinhDkhp:ScheduleActivateRedis', {
        ready: () => app.database.dkhpRedis && app.model && app.model.dtCauHinhDotDkhp,
        run: () => {
            app.primaryWorker && app.appName == 'mdDaoTaoService' && app.schedule('0 7-23 * * *', async () => {
                try {
                    let now = Date.now();
                    let checkData = await app.model.dtCauHinhDotDkhp.getAll({
                        statement: '((active = 0 AND (ngayBatDau BETWEEN :fromTime AND :toTime)) OR (active = 1 AND ngayKetThuc < :fromTime))',
                        parameter: {
                            fromTime: now, toTime: now + 1 * 60 * 60 * 1000
                        }
                    }, 'id,active,ngayBatDau,ngayKetThuc');
                    if (checkData.filter(item => item.active == 0).length) {
                        await app.model.dtCauHinhDotDkhp.update({
                            statement: 'id IN (:listId)',
                            parameter: { listId: checkData.filter(item => item.active == 0).map(item => item.id) }
                        }, { active: 1 });
                        await app.dkhpRedis.hotInit();
                    }
                    if (checkData.filter(item => item.active == 1).length) {
                        await app.model.dtCauHinhDotDkhp.update({
                            statement: 'id IN (:listId)',
                            parameter: { listId: checkData.filter(item => item.active == 1).map(item => item.id) }
                        }, { active: 0 });
                    }
                } catch (error) {
                    console.error('dtCauHinhDkhp:ScheduleActivateRedis', { error });
                }
            });
        },
    });

    app.get('/api/dt/cau-hinh-dot-dkhp/all', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const data = await app.model.dtCauHinhDotDkhp.getAll({});
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-dkhp/dot/all', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const items = await app.model.dtCauHinhDotDkhp.getAll({});
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-dkhp/item/:id', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.dtCauHinhDotDkhp.get({ id });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-dkhp/count', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            let id = req.query.id;
            const length = await app.model.dtDssvTrongDotDkhp.count({ idDot: id, kichHoat: 1 });
            res.send({ count: length.rows[0]['COUNT(*)'] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/cau-hinh-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let data = req.body.item;

            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            data.isDelete = 0;

            let listLoaiHinhDaoTao = data.loaiHinhDaoTao.split(', '),
                listKhoa = data.khoa.split(', '),
                listKhoaSV = data.khoaSinhVien.split(', ');

            await checkTimeCH(data, null);

            const newItem = await app.model.dtCauHinhDotDkhp.create(data);
            let { namHoc, hocKy } = data;

            let modifier = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtCauHinhDotDkhp.checkSinhVienDangKy({ listLoaiHinhDaoTao, listKhoa, listKhoaSV, namHoc, hocKy, congNo: data.congNo, ngoaiNgu: data.ngoaiNgu, idDot: newItem.id, modifier, timeModified });

            await Promise.all([
                ...listLoaiHinhDaoTao.map(lh => app.model.dtChdkhpLhdt.create({ loaiHinhDaoTao: lh, idDot: newItem.id })),
                ...listKhoa.map(khoa => app.model.dtChdkhpKhoa.create({ khoa, idDot: newItem.id })),
                ...listKhoaSV.map(khoaSinhVien => app.model.dtChdkhpKhoaSv.create({ khoaSinhVien, idDot: newItem.id })),
            ]);

            res.send({ item: newItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const checkTimeCH = async (data, id) => {
        let listLoaiHinhDaoTao = data.loaiHinhDaoTao.split(', '),
            listKhoa = data.khoa.split(', '),
            listKhoaSV = data.khoaSinhVien.split(', ');
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

    app.put('/api/dt/cau-hinh-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:write'), async (req, res) => {
        try {
            let id = req.body.id,
                changes = req.body.changes;
            const user = req.session.user.email, now = Date.now();
            let active = 0;
            let item = await app.model.dtCauHinhDotDkhp.get({ id });
            if (changes.ngayKetThuc && changes.ngayKetThuc != item.ngayKetThuc) {
                await checkTimeCH(changes, id);
            }

            if (changes.active === 'true' || changes.active === 'false') active = changes.active === 'true' ? 1 : 0;
            item = await app.model.dtCauHinhDotDkhp.update({ id }, { ...changes, active, modifier: user, timeModified: now });
            if (changes.ngayKetThuc && changes.ngayKetThuc != item.ngayKetThuc) {
                await app.dkhpRedis.initConfigDotDky();
            }

            if (changes.check === 'true') {
                let listLoaiHinhDaoTao = item.loaiHinhDaoTao.split(', '),
                    listKhoa = item.khoa.split(', '),
                    listKhoaSV = item.khoaSinhVien.split(', ');
                let { namHoc, hocKy } = changes,
                    listMienNN = await app.model.dtDssvTrongDotDkhp.getAll({ idDot: id, isMienNgoaiNgu: 1 }).then(list => list.map(i => i.mssv));

                await Promise.all([
                    app.model.dtDssvTrongDotDkhp.delete({ idDot: id }),
                    app.model.dtChdkhpLhdt.delete({ idDot: id }),
                    app.model.dtChdkhpKhoa.delete({ idDot: id }),
                    app.model.dtChdkhpKhoaSv.delete({ idDot: id })
                ]);

                let modifier = req.session.user.email,
                    timeModified = Date.now();

                await app.model.dtCauHinhDotDkhp.checkSinhVienDangKy({ listLoaiHinhDaoTao, listKhoa, listKhoaSV, namHoc, hocKy, congNo: changes.congNo, ngoaiNgu: changes.ngoaiNgu, idDot: id, modifier, timeModified, listMienNN });

                await Promise.all([
                    ...listLoaiHinhDaoTao.map(lh => app.model.dtChdkhpLhdt.create({ loaiHinhDaoTao: lh, idDot: id })),
                    ...listKhoa.map(khoa => app.model.dtChdkhpKhoa.create({ khoa, idDot: id })),
                    ...listKhoaSV.map(khoaSinhVien => app.model.dtChdkhpKhoaSv.create({ khoaSinhVien, idDot: id })),
                ]);

            } else if (changes.active === 'true') {
                await app.model.dtCauHinhDotDkhp.update({
                    statement: 'ngayKetThuc < :now',
                    parameter: { now }
                }, { active: 0 }).catch(err => console.error(err));
                await app.dkhpRedis.hotInit(id);
            } else if (changes.active === 'false') {
                await app.model.dtCauHinhDotDkhp.update({
                    statement: 'ngayKetThuc < :now',
                    parameter: { now }
                }, { active: 0 }).catch(err => console.error(err));
            }

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/cau-hinh-dot-dkhp', app.permission.check('dtCauHinhDotDkhp:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.dtCauHinhDotDkhp.delete({ id });

            await app.model.dtDssvTrongDotDkhp.delete({ idDot: id });

            await app.model.dtChdkhpLhdt.delete({ idDot: id });
            await app.model.dtChdkhpKhoa.delete({ idDot: id });
            await app.model.dtChdkhpKhoaSv.delete({ idDot: id });

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            let [dotDangKyAll, semester] = await Promise.all([
                app.model.dtCauHinhDotDkhp.getAll({
                    statement: 'ngayKetThuc <= :currNgay OR (ngayBatDau <= :currNgay AND ngayKetThuc >= :currNgay)',
                    parameter: {
                        currNgay: Date.now(),
                    },
                }),
                app.model.dtSemester.get({ active: 1 }, 'namHoc, hocKy')
            ]);
            res.send({ items: dotDangKyAll, semester });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot/mien/download-template', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
        ];

        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        app.excel.attachment(workBook, res, 'ImportMienChungChi.xlsx');
    });

    app.get('/api/dt/cau-hinh-dot/mien/page/:pageNumber/:pageSize', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const { filter } = req.query,
                _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let page = await app.model.dtDssvTrongDotDkhp.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot/mien/page/:pageNumber/:pageSize', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const { filter } = req.query,
                _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let page = await app.model.dtDssvTrongDotDkhp.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/cau-hinh-dot/mien', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const { idDot, list } = req.body;
            await Promise.all(list.map(item => {
                return [
                    app.model.dtDssvTrongDotDkhp.update({ mssv: item.mssv, idDot }, { isMienNgoaiNgu: 1 }),
                    app.database.dkhpRedis.set(`NGOAI_NGU:${item.mssv}`, JSON.stringify({ status: 1 })),
                ];
            }));

            await app.model.dtCauHinhDotDkhp.checkListSinhVien({ listStudent: list.map(i => i.mssv), idDot, modifier: req.session.user.email, isUpdate: 1 });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/cau-hinh-dot/mien', app.permission.check('dtCauHinhDotDkhp:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.dtDssvTrongDotDkhp.update({ id }, { isMienNgoaiNgu: 0 });
            await app.model.dtCauHinhDotDkhp.checkListSinhVien({ listStudent: [item.mssv], idDot: item.idDot, modifier: req.session.user.email, isUpdate: 1 });

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportSinhVienMien', (req, fields, files, params, done) =>
        app.permission.has(req, () => ImportSinhVienMien(req, fields, files, params, done), done, 'dtCauHinhDotDkhp:manage')
    );

    const ImportSinhVienMien = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportSinhVienMien' && files.ImportSinhVienMien && files.ImportSinhVienMien.length) {
            const srcPath = files.ImportSinhVienMien[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);
                if (worksheet) {
                    try {
                        // read columns header                        
                        done({});
                        let items = [], falseItems = [], index = 2;
                        let idDot = params.idDot;
                        const dssvDot = await app.model.dtDssvTrongDotDkhp.getAll({ idDot }, 'mssv, isMienNgoaiNgu');
                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(Number(val))) return Number(val);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };
                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    row: index,
                                };

                                if (!dssvDot.find(i => i.mssv == data.mssv)) {
                                    falseItems.push({ ...data, error: 'Sinh viên không tồn tại trong đợt!' });
                                } else if (dssvDot.find(i => i.mssv == data.mssv && i.isMienNgoaiNgu == 1)) {
                                    falseItems.push({ ...data, error: 'Sinh viên đã được miễn trong đợt!' });
                                } else if (items.find(i => i.mssv == data.mssv)) {
                                    falseItems.push({ ...data, error: 'Trùng sinh viên trong danh sách!' });
                                } else {
                                    const { ho, ten } = await app.model.fwStudent.get({ mssv: data.mssv }, 'ho, ten');
                                    data.hoTen = ho + ' ' + ten;
                                    items.push({ ...data });
                                }

                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('import-mien-chung-chi', { status: 'importing', items, falseItems });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('import-mien-chung-chi', { status: 'done', items, falseItems });
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
};
