module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7015: { title: 'Danh sách Môn học', link: '/user/dao-tao/mon-hoc', groupIndex: 1, icon: 'fa-briefcase', backgroundColor: '#CFFF8D', color: 'black' },
        },
    };
    app.permission.add(
        { name: 'dmMonHoc:read', menu },
        { name: 'dmMonHoc:manage', menu },
        { name: 'dmMonHoc:write' },
        { name: 'dmMonHoc:delete' },
        { name: 'dmMonHoc:upload' },
        { name: 'dmMonHoc:download' },
    );

    app.get('/user/dao-tao/mon-hoc', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage', 'dmMonHoc:download'), app.templates.admin);
    app.get('/user/dao-tao/mon-hoc/import', app.permission.check('dmMonHoc:manage', 'dmMonHoc:write', 'dmMonHoc:upload'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtMonHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dmMonHoc:read', 'dmMonHoc:write', 'dmMonHoc:delete', 'dmMonHoc:upload');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/mon-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            let filter = req.query.filter || {}, sort = filter.sort || 'ten_ASC';
            if (req.query.donVi) filter.donViFilter = req.query.donVi;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dmMonHoc.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mon-hoc/item/:ma', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage', 'staff:login'), (req, res) => {
        app.model.dmMonHoc.get({ ma: req.params.ma }, (error, item) => {
            if (error) res.send({ error });
            else {
                app.model.dmDonVi.get({ ma: item.khoa }, (error, khoa) => {
                    res.send({ error, item: { ...item, khoa } });
                });
            }
        });
    });

    app.get('/api/dt/mon-hoc/:ma', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let item = await app.model.dmMonHoc.getAll({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mon-hoc-diem-thanh-phan', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let items = await app.model.dtMonHocDiemThanhPhan.getAll({ maMonHoc: req.query.ma });
            let listThanhPhan = await app.model.dtDiemDmLoaiDiem.getAll({});
            if (items && items.length) {
                for (let item of items) {
                    listThanhPhan.forEach(e => {
                        if (e.ma == item.loaiThanhPhan) item.tenThanhPhan = e.ten;
                    });
                }
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let data = req.body.item,
                list = req.body.list;
            if (list) {
                await app.model.dtMonHocDiemThanhPhan.delete({ maMonHoc: data.ma });
                for (let item of list) {
                    await app.model.dtMonHocDiemThanhPhan.create(item);
                }
            }

            data.isTheChat = data.isTheChat == 'true' ? 1 : 0;
            let item = await app.model.dmMonHoc.create(data);
            app.dkhpRedis.initMonHoc();
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/list-mon-hoc', app.permission.check('dmMonHoc:upload'), async (req, res) => {
        try {
            let list = req.body.list;
            for (let item of list) {
                let monHoc = await app.model.dmMonHoc.get({ ma: item.maMonHoc });
                if (!monHoc) {
                    let data = {
                        ma: item.maMonHoc,
                        ten: app.utils.stringify({
                            vi: item.tenMonTiengViet,
                            en: item.tenMonTiengAnh
                        }),
                        kichHoat: 1,
                        khoa: item.khoa,
                        tinChiLt: parseInt(item.tinChiLyThuyet),
                        tinChiTh: parseInt(item.tinChiThucHanh),
                        tietLt: parseInt(item.tinChiLyThuyet) * 15,
                        tietTh: parseInt(item.tinChiThucHanh) * 30,
                        tongTiet: parseInt(item.tinChiLyThuyet) * 15 + parseInt(item.tinChiThucHanh) * 30,
                        tongTinChi: parseInt(item.tinChiLyThuyet) + parseInt(item.tinChiThucHanh),
                        isTheChat: item == '1' ? 1 : 0,
                        phanTramDiem: item.thanhPhanDiem
                    };
                    await app.model.dtMonHocDiemThanhPhan.delete({ maMonHoc: data.ma });

                    if (item.thanhPhanDiem != '') {
                        let listDiem = item.thanhPhanDiem.split(';');
                        for (let e of listDiem) {
                            e = e.split(':');
                            let diem = {
                                maMonHoc: item.maMonHoc,
                                loaiThanhPhan: e[0],
                                phanTram: e[1]
                            };
                            await app.model.dtMonHocDiemThanhPhan.create(diem);
                        }
                    }
                    await app.model.dmMonHoc.create(data);
                }
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let { changes, list } = req.body;
            await app.model.dtMonHocDiemThanhPhan.delete({ maMonHoc: changes.ma });
            if (list) {
                for (let item of list) {
                    await app.model.dtMonHocDiemThanhPhan.create(item);
                }
            }

            changes.isTheChat = changes.isTheChat == 'true' ? 1 : 0;
            const items = await app.model.dmMonHoc.update({ ma: req.body.ma }, changes);
            await app.dkhpRedis.initMonHoc();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/mon-hoc/list', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let { listMa, changes } = req.body;
            listMa = listMa.split(', ');
            for (let ma of listMa) {
                await app.model.dtMonHocDiemThanhPhan.delete({ maMonHoc: ma });
                for (let item of changes) {
                    item.maMonHoc = ma;
                    await app.model.dtMonHocDiemThanhPhan.create(item);
                }
            }
            await app.dkhpRedis.initMonHoc();
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/mon-hoc/faculty', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), async (req, res) => {
        try {
            let { listMa, khoa } = req.body;
            listMa = listMa.split(', ');
            for (let ma of listMa) {
                await app.model.dmMonHoc.update({ ma }, { khoa });
            }
            await app.dkhpRedis.initMonHoc();
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), async (req, res) => {
        try {
            const soHocPhan = await app.model.dtThoiKhoaBieu.getAll({ maMonHoc: req.body.ma });
            if (soHocPhan.length) {
                return res.send({ warning: 'Môn học này đã được tạo học phần' });
            }
            const monCtdt = await app.model.dtChuongTrinhDaoTao.getAll({ maMonHoc: req.body.ma });
            if (monCtdt.length) {
                return res.send({ warning: 'Môn học này đã được thêm vào CTĐT' });
            }

            await app.model.dmMonHoc.delete({ ma: req.body.ma });
            await app.model.dtMonHocDiemThanhPhan.delete({ maMonHoc: req.body.ma });
            await app.dkhpRedis.initMonHoc();
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/mon-hoc/page-all/:pageNumber/:pageSize', app.permission.orCheck('dtDangKyMoMon:read', 'dmMonHoc:read', 'tcHocPhiTheoMon:manage', 'staff:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            isDangKyMoMon = req.query.isDangKyMoMon,
            searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
            statement = 'lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm';
        if (isDangKyMoMon) statement = `khoa != 33 AND (${statement})`;
        app.model.dmMonHoc.getPage(pageNumber, pageSize, {
            statement,
            parameter: { searchTerm }
        }, '*', 'khoa,ten,ma', (error, page) => {
            res.send({ error, page });
        });
    });

    //Import excel -------------------------------------------------------------------------------------------------
    const getCells = async (filter) => {
        let list = await app.model.dmMonHoc.getExportData(filter);

        let cells = [
            { cell: 'A1', value: 'MÃ', bold: true, border: '1234' },
            { cell: 'B1', value: 'TÊN MÔN HỌC', bold: true, border: '1234' },
            { cell: 'C1', value: 'TỔNG TC', bold: true, border: '1234' },
            { cell: 'D1', value: 'TC LT', bold: true, border: '1234' },
            { cell: 'E1', value: 'TC TH', bold: true, border: '1234' },
            { cell: 'F1', value: 'TỔNG TIẾT', bold: true, border: '1234' },
            { cell: 'G1', value: 'TIẾT LT', bold: true, border: '1234' },
            { cell: 'H1', value: 'TIẾT TH', bold: true, border: '1234' },
            { cell: 'I1', value: 'KHOA/BÔ MÔN', bold: true, border: '1234' },
            { cell: 'J1', value: 'THÀNH PHẦN ĐIỂM', bold: true, border: '1234' },
            { cell: 'K1', value: 'KÍCH HOẠT', bold: true, border: '1234' },
        ];

        for (let [index, item] of list.rows.entries()) {
            let kichHoat = item.kichHoat == 1 ? 'Có' : 'Không';
            let ten = app.utils.parse(item.ten).vi + (app.utils.parse(item.ten).en ? ' ( ' + app.utils.parse(item.ten).en + ' )' : '');
            cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.ma });
            cells.push({ cell: 'B' + (index + 2), border: '1234', value: ten });
            cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.tongTinChi });
            cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tinChiLt });
            cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tinChiTh });
            cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tongTiet });
            cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tietLt });
            cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tietTh });
            cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenKhoa });
            cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.phanTramDiem });
            cells.push({ cell: 'K' + (index + 2), border: '1234', value: kichHoat });
        }
        return cells;
    };

    app.get('/api/dt/mon-hoc-export-data', app.permission.check('dmMonHoc:download'), async (req, res) => {
        try {
            let filter = req.query.filter;
            const workbook = app.excel.create(),
                workSheetMonHoc = workbook.addWorksheet('Mon_hoc');
            let cellsMonHoc = await getCells(filter);

            app.excel.write(workSheetMonHoc, cellsMonHoc);
            app.excel.attachment(workbook, res);

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //Export template
    app.get('/api/dt/mon-hoc-template/download', app.permission.check('dmMonHoc:upload'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const wsDK = workBook.addWorksheet('Mon_hoc_Template'),
                wsKhoa = workBook.addWorksheet('Danh_sach_khoa');
            let defaultColumnsDK = [
                { cell: 'A1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'B1', value: 'TÊN MÔN TIẾNG VIỆT', bold: true, border: '1234' },
                { cell: 'C1', value: 'TÊN MÔN TIẾNG ANH', bold: true, border: '1234' },
                { cell: 'D1', value: 'MÃ KHOA/BỘ MÔN', bold: true, border: '1234' },
                { cell: 'E1', value: 'TÍN CHỈ LÝ THUYẾT', bold: true, border: '1234' },
                { cell: 'F1', value: 'TÍN CHỈ THỰC HÀNH', bold: true, border: '1234' },
                { cell: 'G1', value: 'MÔN THỂ CHẤT', bold: true, border: '1234' },
                { cell: 'H1', value: 'THÀNH PHẦN ĐIỂM', bold: true, border: '1234' },

                { cell: 'A2', value: 'DAI054', border: '1234' },
                { cell: 'B2', value: 'Lịch sử Đảng Cộng sản Việt Nam', border: '1234' },
                { cell: 'C2', value: 'History of Vietnamese Communist Party', border: '1234' },
                { cell: 'D2', value: '33', border: '1234' },
                { cell: 'E2', value: '3', border: '1234' },
                { cell: 'F2', value: '0', border: '1234' },
                { cell: 'G2', value: '0', border: '1234' },
                { cell: 'H2', value: 'GK:30;CK:70', border: '1234' },
            ],
                defaultColKhoa = [
                    { cell: 'A1', value: 'MÃ KHOA', bold: true, border: '1234' },
                    { cell: 'B1', value: 'TÊN KHOA/ĐƠN VỊ', bold: true, border: '1234' },
                ];
            let data = await app.model.dmDonVi.getAll({ kichHoat: 1 }, '*', 'ma ASC');
            for (let [index, item] of data.entries()) {
                defaultColKhoa.push({ cell: 'A' + (index + 2), border: '1234', value: item.ma });
                defaultColKhoa.push({ cell: 'B' + (index + 2), border: '1234', value: item.ten });
            }
            app.excel.write(wsDK, defaultColumnsDK);
            app.excel.write(wsKhoa, defaultColKhoa);
            app.excel.attachment(workBook, res, 'Mon_hoc_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('DmMonHocData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmMonHocImportData(req, fields, files, params, done), done, 'dmMonHoc:upload')
    );

    const dmMonHocImportData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DmMonHocData' && files.DmMonHocData && files.DmMonHocData.length) {
            const srcPath = files.DmMonHocData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const listMaMonHoc = [],
                        successItems = [],
                        falseItem = [],
                        listItems = [];
                    let index = 2;
                    try {
                        while (true) {
                            const maMonHoc = worksheet.getCell('A' + index).text?.toString().trim() || '',
                                tenMonTiengViet = worksheet.getCell('B' + index).text?.toString().trim() || '',
                                tenMonTiengAnh = worksheet.getCell('C' + index).text?.toString().trim() || '',
                                khoa = worksheet.getCell('D' + index).text,
                                tinChiLyThuyet = worksheet.getCell('E' + index).text,
                                tinChiThucHanh = worksheet.getCell('F' + index).text,
                                isTheChat = worksheet.getCell('G' + index).text,
                                thanhPhanDiem = worksheet.getCell('H' + index).text?.toString().trim() || '';
                            if (!maMonHoc) break;

                            let data = { stt: index, maMonHoc, tenMonTiengViet, tenMonTiengAnh, khoa, tinChiLyThuyet, tinChiThucHanh, isTheChat, thanhPhanDiem, ghiChu: '', isCheck: false };
                            listItems.push(data);

                            if (listMaMonHoc.includes(maMonHoc)) {
                                let list = listItems.filter(e => e.maMonHoc == maMonHoc);
                                data.ghiChu = `Mã môn học đã được nhập ở dòng ${list[0].stt}.`;
                                falseItem.push(data);
                            } else {
                                listMaMonHoc.push(maMonHoc);
                                let monHoc = await app.model.dmMonHoc.get({ ma: maMonHoc });
                                if (monHoc) {
                                    data.ghiChu = 'Mã học phần đã tồn tại.';
                                    falseItem.push(data);
                                } else if (!tenMonTiengViet) {
                                    data.ghiChu = 'Tên môn học (tiếng Việt) bị trống.';
                                    falseItem.push(data);
                                } else if (!khoa) {
                                    data.ghiChu = 'Khoa/bộ môn bị trống.';
                                    falseItem.push(data);
                                } else {
                                    let tenKhoa = await app.model.dmDonVi.get({ ma: khoa });
                                    if (!tenKhoa) {
                                        data.ghiChu = 'Không tìm thấy khoa/bộ môn.';
                                        falseItem.push(data);
                                    } else {
                                        tenKhoa = tenKhoa.ten;
                                        data.tenKhoa = tenKhoa;
                                        if ((parseInt(tinChiLyThuyet) + parseInt(tinChiThucHanh)) <= 0) {
                                            data.ghiChu = 'Tổng số tín chỉ phải lớn hơn 0.';
                                            falseItem.push(data);
                                        } else {
                                            if (thanhPhanDiem) {
                                                let phanTram = 0,
                                                    listDiem = thanhPhanDiem.split(';'),
                                                    items = await app.model.dtDiemDmLoaiDiem.getAll({ kichHoat: 1 });
                                                items = items.map(e => e.ma);
                                                for (let diem of listDiem) {
                                                    diem = diem.split(':');
                                                    phanTram = phanTram + parseInt(diem[1]);
                                                    if (!items.includes(diem[0]) && data.ghiChu == '') data.ghiChu = 'Mã thành phần điểm không phù hợp.';
                                                }
                                                if (phanTram != 100 && data.ghiChu == '') data.ghiChu = 'Tổng thành phần điểm khác 100.';
                                                else if (phanTram != 100) data.ghiChu = data.ghiChu + ' Tổng thành phần điểm khác 100.';
                                            }
                                            if (data.ghiChu != '') falseItem.push(data);
                                            else {
                                                data.isCheck = true;
                                                successItems.push(data);
                                            }
                                        }
                                    }
                                }
                            }

                            index++;
                        }
                        done({ successItems, falseItem });
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


    //Phân quyền cho đơn vị ------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'dmMonHoc:read', text: 'Đào tạo: Quản lý môn học' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyMonHoc', (user) => new Promise(resolve => {
    //     if (user.permissions.includes('manager:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'dmMonHoc:read');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyMonHoc', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'dmMonHoc:read' && user.permissions.includes('faculty:login')) {
    //             app.permissionHooks.pushUserPermission(user, 'dmMonHoc:read');
    //         }
    //     });
    //     resolve();
    // }));
};