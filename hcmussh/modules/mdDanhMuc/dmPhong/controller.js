module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4059: { title: 'Phòng học', link: '/user/category/phong' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7014: { title: 'Phòng học', link: '/user/dao-tao/phong', groupIndex: 2, parentKey: 7027 },
        },
    };
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7514: { title: 'Phòng học', link: '/user/sau-dai-hoc/phong', parentKey: 7570 },
        },
    };
    app.permission.add(
        { name: 'dmPhong:read', menu },
        { name: 'dtPhong:read', menu: menuDaoTao },
        { name: 'sdhPhong:read', menu: menuSdh },
        { name: 'dmPhong:write' },
        { name: 'dmPhong:delete' },
        { name: 'dmPhong:upload' },
        { name: 'dtLichEvent:manage' }

    );

    app.permissionHooks.add('staff', 'addRolesPhong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtPhong:read', 'dmPhong:write', 'dmPhong:delete', 'dtLichEvent:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/category/phong', app.permission.check('dmPhong:read'), app.templates.admin);
    app.get('/user/dao-tao/phong', app.permission.check('dtPhong:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/phong', app.permission.check('sdhPhong:read'), app.templates.admin);
    app.get('/user/category/phong/upload', app.permission.check('dmPhong:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phong/page/:pageNumber/:pageSize', app.permission.orCheck('dmPhong:read', 'dtPhong:read', 'dtThoiKhoaBieu:manage', 'ctsvShcd:read', 'sdhPhong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmPhong.getPage(pageNumber, pageSize, {
            statement: 'lower(ten) LIKE :searchText',
            parameter: {
                searchText: `%${req.query.condition ? req.query.condition.toLowerCase() : ''}%`
            }
        }, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/phong/all', app.permission.orCheck('dmPhong:read', 'dtPhong:read', 'dtThoiKhoaBieu:manage', 'sdhTuyenSinhLichThi:manage', 'staff:login', 'sdhPhong:read'), async (req, res) => {
        try {
            let maCoSo = req.query.maCoSo;
            let statement = 'kichHoat = 1', parameter = {};
            if (req.query.condition) {
                statement += ' AND lower(ten) LIKE :searchText';
                parameter.searchText = `%${req.query.condition.toLowerCase()}%`;
            }
            if (maCoSo) {
                statement += ' AND coSo = :maCoSo';
                parameter.maCoSo = maCoSo;
            }

            let items = await app.model.dmPhong.getAll({ statement, parameter }, '*', 'LPAD(ten, 10)');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/all-data', app.permission.orCheck('dmPhong:read', 'dtPhong:read', 'dtThoiKhoaBieu:manage', 'sdhTuyenSinhLichThi:manage', 'staff:login', 'sdhPhong:read'), async (req, res) => {
        try {
            let statement = '', parameter = {};
            if (req.query.condition) {
                statement += ' AND lower(ten) LIKE :searchText';
                parameter.searchText = `%${req.query.condition.toLowerCase()}%`;
            }

            let [items, dmTinhTrangPhong] = await Promise.all([
                app.model.dmPhong.getAll({ statement, parameter }, '*', 'LPAD(ten, 10)'),
                app.model.dmTinhTrangPhong.getAll({}),
            ]);
            items = items.map(i => {
                i.tenTinhTrang = dmTinhTrangPhong.find(dm => dm.id == i.tinhTrangPhong)?.ten || '';
                return i;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/data', app.permission.orCheck('staff:login', 'dtPhong:read', 'sdhPhong:read'), async (req, res) => {
        try {
            const items = await app.model.dmPhong.getData(req.query.maCoSo);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong-thi/filter', app.permission.orCheck('dmPhong:read', 'dtPhong:read', 'dtExam:manage'), async (req, res) => {
        try {
            const HOUR = 60 * 60 * 1000;
            let { condition } = req.query,
                { batDau, ketThuc } = req.query.filter;

            let ngayThi = parseInt(batDau) + 7 * HOUR,
                thu = new Date(ngayThi).getDay() + 1;
            thu = thu == 1 ? 8 : thu;
            let filter = { thuThi: thu, batDau, ketThuc };
            filter = app.utils.stringify(filter);
            let items = await app.model.dtExam.phongThiFilter(filter);
            items = items.rows.filter(item => item.ten.toLowerCase().includes((condition || '').toLowerCase()));
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/item/:ten', app.permission.orCheck('staff:teacher', 'dmPhong:read', 'dtPhong:read', 'dtThoiKhoaBieu:manage', 'sdhTuyenSinhLichThi:manage', 'staff:login'), (req, res) => {
        app.model.dmPhong.get({ ten: req.params.ten }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/danh-muc/phong/filter', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            let statement = '', parameter = {}, dataPhong = [];
            let { namHoc, hocKy, coSo, thu, tietBatDau, soTietBuoi, phong, ngayBatDau, ngayKetThuc } = filter;

            dataPhong = await app.model.dmPhong.getAll({ coSo, kichHoat: 1 }, 'ten, sucChua', 'ten');
            if (ngayBatDau && ngayKetThuc) {
                statement += 'namHoc = :namHoc AND hocKy = :hocKy';
                parameter.namHoc = namHoc;
                parameter.hocKy = hocKy;

                statement += ' AND (ngayBatDau BETWEEN :ngayBatDau AND :ngayKetThuc OR ngayKetThuc BETWEEN :ngayBatDau AND :ngayKetThuc)';
                parameter.ngayBatDau = parseInt(ngayBatDau);
                parameter.ngayKetThuc = parseInt(ngayKetThuc);

                if (thu) {
                    statement += ' AND thu = :thu ';
                    parameter.thu = thu;
                }

                if (phong) {
                    statement += 'AND phong != :phong ';
                    parameter.phong = phong;
                }

                if (tietBatDau && soTietBuoi) {
                    statement += ' AND (:tietBatDau BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1) OR (:tietBatDau + :soTietBuoi - 1) BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1)) ';
                    parameter.tietBatDau = parseInt(tietBatDau);
                    parameter.soTietBuoi = parseInt(soTietBuoi);
                }

                if (coSo) {
                    statement += ' AND coSo = :coSo';
                    parameter.coSo = coSo;
                }

                if (filter.id) {
                    statement += ' AND id != :id';
                    parameter.id = filter.id;
                }

                let tkbHienTai = await app.model.dtThoiKhoaBieu.getAll({ statement, parameter }, 'phong, sucChua');
                tkbHienTai = tkbHienTai.map(item => item.phong);
                dataPhong = dataPhong.filter(item => !tkbHienTai.includes(item.ten) && item.ten.toLowerCase().includes((searchTerm || '').toLowerCase()));
            } else {
                dataPhong = dataPhong.filter(item => item.ten.toLowerCase().includes((searchTerm || '').toLowerCase()));
            }
            res.send({ dataPhong });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/custom/filter', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query, { coSo, ngayHoc, tietBatDau, soTietBuoi } = filter,
                tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

            const caHoc = await app.model.dmCaHoc.getAll({ maCoSo: coSo });

            let batDau = caHoc.find(tiet => tiet.ten == tietBatDau),
                ketThuc = caHoc.find(tiet => tiet.ten == tietKetThuc);

            if (!ketThuc) throw 'Không tồn tiết kết thúc';

            const [gioBatDau, phutBatDau] = batDau.thoiGianBatDau.split(':'),
                [gioKetThuc, phutKetThuc] = ketThuc.thoiGianKetThuc.split(':'),
                ngayBatDau = new Date(parseInt(ngayHoc)).setHours(parseInt(gioBatDau), parseInt(phutBatDau)),
                ngayKetThuc = new Date(parseInt(ngayHoc)).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

            let [dataPhong, tkbHienTai, lichThi, lichEvent] = await Promise.all([
                app.model.dmPhong.getAll({ coSo, kichHoat: 1 }, 'ten, sucChua', 'ten'),
                app.model.dtThoiKhoaBieuCustom.getAll({
                    statement: 'isNghi IS NULL AND isNgayLe IS NULL AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                    parameter: { ngayBatDau, ngayKetThuc },
                }, 'phong'),
                app.model.dtExam.getAll({
                    statement: 'NOT ((:ngayBatDau > ketThuc) OR (:ngayKetThuc < batDau))',
                    parameter: { ngayBatDau, ngayKetThuc },
                }, 'phong'),
                app.model.dtLichEvent.getAll({
                    statement: 'NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                    parameter: { ngayBatDau, ngayKetThuc },
                }, 'phong'),
            ]);
            tkbHienTai = tkbHienTai.map(item => item.phong);
            lichThi = lichThi.map(i => i.phong);
            lichEvent = lichEvent.map(i => i.phong);
            dataPhong = dataPhong.filter(item => ![...tkbHienTai, ...lichThi, ...lichEvent].includes(item.ten) && item.ten.toLowerCase().includes((searchTerm || '').toLowerCase()));
            res.send({ dataPhong });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/condition/:maCoSo', app.permission.orCheck('dmPhong:read', 'dtPhong:read', 'dtThoiKhoaBieu:manage', 'sdhTuyenSinhLichThi:manage'), async (req, res) => {
        try {
            let condition = 'coSo = :maCoSo';
            if (req.query.condition) {
                condition = {
                    statement: 'coSo = :maCoSo ten LIKE :searchText',
                    parameter: {
                        searchText: `%${req.query.condition.toLowerCase()}%`,
                        maCoSo: req.params.maCoSo
                    }
                };
            }
            let items = await app.model.dmPhong.getAll(condition, '*', 'ten');
            res.send({ items: items.map(item => ({ ...item, tenCoSo: req.params.maCoSo })) });

        } catch (error) {
            res.send({ error });
        }

    });

    app.post('/api/danh-muc/phong', app.permission.check('dmPhong:write'), async (req, res) => {
        try {
            if (await app.model.dmPhong.get({ ten: req.body.item.ten })) throw { message: 'Phòng đã tồn tại!' };
            const item = await app.model.dmPhong.create(req.body.item);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/phong', app.permission.check('dmPhong:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmPhong.update({ ten: req.body.ten }, changes, (error, items) => res.send({ error, items }));
    });

    app.put('/api/danh-muc/phong/multiple', app.permission.check('dmPhong:write'), async (req, res) => {
        try {
            const { listPhong, changes } = req.body;
            await app.model.dmPhong.update({
                statement: 'ten IN (:listPhong)',
                parameter: { listPhong },
            }, changes);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/phong', app.permission.check('dmPhong:delete'), (req, res) => {
        app.model.dmPhong.delete({ ten: req.body.ten }, (error) => res.send({ error }));
    });

    app.post('/api/danh-muc/phong/createFromFile', app.permission.check('dmPhong:write'), (req, res) => {
        let dataUpload = req.body.item;
        for (let i = 0; i < dataUpload.length; i++) {
            app.model.dmPhong.createMulti(dataUpload[i], (error) => {
                if (error) {
                    res.send({ error });
                }
            });
        }
        res.send('success');
    });

    app.post('/api/danh-muc/phong/upload', app.permission.check('dmPhong:upload'), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            if (error) {
                res.send({ error });
            } else {
                let hasResponsed = false;
                app.uploadHooks.run(req, fields, files, req.query, data => {
                    if (hasResponsed == false) res.send(data);
                    hasResponsed = true;
                });
            }
        });
    });

    app.get('/api/danh-muc/phong-thi/get-phong-event', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            let { condition, filter } = req.query,
                { thoiGianBatDau, thoiGianKetThuc, soTuanLap, coSo } = filter,
                items = [];
            if (soTuanLap != 1) {
                items = await app.model.dmPhong.getAll({ coSo }, 'ten, sucChua, sucChuaThi', 'ten');
                for (let i = 0; i < soTuanLap; i++) {
                    let batDau = parseInt(thoiGianBatDau) + 604800000 * i,
                        ketThuc = parseInt(thoiGianKetThuc) + 604800000 * i;

                    let data = (await app.model.dtLichEvent.getPhong(app.utils.stringify({ coSo, thoiGianBatDau: batDau, thoiGianKetThuc: ketThuc }))).rows,
                        list = [];
                    data = data.map(e => e.ten);
                    items.forEach(e => {
                        if (data.includes(e.ten)) return list.push(e);
                    });
                    items = list;
                }
            } else items = (await app.model.dtLichEvent.getPhong(app.utils.stringify({ coSo, thoiGianBatDau, thoiGianKetThuc }))).rows;


            items = items.filter(item => item.ten.toLowerCase().includes((condition || '').toLowerCase()));
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phong/bao-bu/filter', app.permission.orCheck('staff:login', 'dmPhong:read'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query, { coSo, ngayHoc, tietBatDau, soTietBuoi } = filter,
                tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

            const caHoc = await app.model.dmCaHoc.getAll({ maCoSo: coSo });

            let batDau = caHoc.find(tiet => tiet.ten == tietBatDau),
                ketThuc = caHoc.find(tiet => tiet.ten == tietKetThuc);

            if (!batDau) throw 'Cơ sở không tồn tại tiết bắt đầu';
            if (!ketThuc) throw 'Cơ sở không tồn tại tiết kết thúc';

            const [gioBatDau, phutBatDau] = batDau.thoiGianBatDau.split(':'),
                [gioKetThuc, phutKetThuc] = ketThuc.thoiGianKetThuc.split(':'),
                thoiGianBatDau = new Date(parseInt(ngayHoc)).setHours(parseInt(gioBatDau), parseInt(phutBatDau)),
                thoiGianKetThuc = new Date(parseInt(ngayHoc)).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

            let { rows } = await app.model.dmPhong.getPhong(app.utils.stringify({ coSo, thoiGianBatDau, thoiGianKetThuc, searchTerm }));

            res.send({ dataPhong: rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    // // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    // const roomImportData = (req, fields, files, params, done) => {
    //     if (fields.userData && fields.userData[0] && fields.userData[0] == 'roomImportData' && files.RoomFile && files.RoomFile.length > 0) {
    //         const srcPath = files.RoomFile[0].path;
    //         const workbook = app.excel.create();
    //         const parseLanguage = (text, getAll) => {
    //             let obj = {};
    //             try { obj = JSON.parse(text); } catch (e) { console.error(e); }
    //             if (obj.vi == null) obj.vi = text;
    //             if (obj.en == null) obj.en = text;
    //             return getAll ? obj : obj[T.language()];
    //         };

    //         workbook.xlsx.readFile(srcPath).then(() => {
    //             const worksheet = workbook.getWorksheet(1);
    //             let index = 1, room = [];
    //             let allBuilding = [];
    //             app.model.dmToaNha.getAll((error, items) => {
    //                 allBuilding = items;
    //                 while (true) {
    //                     index++;
    //                     let ten = worksheet.getCell('A' + index).value;
    //                     if (ten) {
    //                         ten = ten.toString().trim();
    //                         const ten = worksheet.getCell('B' + index).value ? JSON.stringify({ vi: worksheet.getCell('B' + index).value.toString().trim(), en: worksheet.getCell('B' + index).value.toString().trim() }) : '';
    //                         let toaNha = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '';
    //                         allBuilding.forEach(i => {
    //                             if (toaNha == parseLanguage(i.ten, true).vi) {
    //                                 toaNha = i.ten;
    //                             }
    //                         });
    //                         const moTa = JSON.stringify({ vi: worksheet.getCell('D' + index).value.toString().trim(), en: '' });
    //                         const kichHoat = 1;
    //                         room.push({ ten, toaNha, moTa, kichHoat });
    //                     } else {
    //                         require('fs').unlinkSync(srcPath);
    //                         req.session.room = room;
    //                         done({
    //                             number: room.length,
    //                             room,
    //                             allBuilding
    //                         });
    //                         break;
    //                     }
    //                 }
    //             });
    //         });
    //     }
    // };

    // app.uploadHooks.add('roomImportData', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => roomImportData(req, fields, files, params, done), done, 'dmPhong:write'));
};