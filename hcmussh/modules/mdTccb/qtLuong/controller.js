module.exports = app => {
    const QtLuongSheetName = 'QtLuongImportData';

    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3052: { title: 'Diễn biến lương cán bộ', link: '/user/tccb/qua-trinh/luong', icon: 'fa-money', backgroundColor: '#21b849', groupIndex: 0 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1010: { title: 'Diễn biến lương', link: '/user/luong', icon: 'fa-money', backgroundColor: '#1a5b87', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtLuong:read', menu },
        { name: 'qtLuong:write' },
        { name: 'qtLuong:delete' },
        { name: 'qtLuong:import' },
    );
    app.get('/user/tccb/qua-trinh/luong', app.permission.check('qtLuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/luong/import', app.permission.check('qtLuong:import'), app.templates.admin);
    // app.get('/user/tccb/qua-trinh/luong/group/:ma', app.permission.check('qtLuong:read'), app.templates.admin);
    // app.get('/user/luong', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtLuong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtLuong:read', 'qtLuong:write', 'qtLuong:import');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);
    app.get('/api/tccb/qua-trinh/luong/page/:pageNumber/:pageSize', app.permission.check('qtLuong:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                filter = app.utils.stringify(req.query.filter || {}),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
            const page = await app.model.qtLuong.searchPage(_pageNumber, _pageSize, filter, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/luong/group/page/:pageNumber/:pageSize', app.permission.check('qtLuong:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
            const page = await app.model.qtLuong.groupPage(_pageNumber, _pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/luong/all', checkGetStaffPermission, async (req, res) => {
        try {
            const items = await app.model.qtLuong.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/qua-trinh/luong', app.permission.check('qtLuong:write'), async (req, res) => {
        try {
            const item = await app.model.qtLuong.create(req.body.data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/qua-trinh/luong', app.permission.check('qtLuong:write'), async (req, res) => {
        try {
            const item = await app.model.qtLuong.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/qua-trinh/luong', app.permission.check('qtLuong:delete'), async (req, res) => {
        try {
            await app.model.qtLuong.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh-luong-template', async (req, res) => {
        try {
            res.sendFile(app.path.join(app.publicPath, 'sample', 'TEMPLATE_IMPORT_QT_LUONG.xlsx'));
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // API Import Insert ------------------------------------
    app.post('/api/tccb/qua-trinh-luong/multiple', app.permission.check('qtLuong:write'), async (req, res) => {
        try {
            let resultItems = [];
            let { items } = req.body;
            items = app.utils.parse(items);
            for (let item of items) {
                let { bac, batDau, heSoLuong, ketThuc, maNgach, mscb, mocNangBacLuong, phuCapThamNienVuotKhung, soHieuVanBan, tyLePhuCapThamNien, tyLePhuCapUuDai, tyLeVuotKhung } = item;

                const resultItem = await app.model.qtLuong.create({
                    batDau, batDauType: 'dd/mm/yyyy', ketThuc, ketThucType: 'dd/mm/yyyy', chucDanhNgheNghiep: maNgach, heSoLuong, phuCapThamNienVuotKhung, mocNangBacLuong, soHieuVanBan, shcc: mscb, tyLeVuotKhung, tyLePhuCapThamNien, tyLePhuCapUuDai, bac
                });
                resultItems.push(resultItem);
            }
            res.send({ item: resultItems });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // Hook Upload ------------------------------------
    app.uploadHooks.add('tccbQtLuong', (req, fields, files, params, done) => app.permission.has(req, () => tccbQtLuongUploadData(req, fields, files, params, done), done, 'qtLuong:import'));

    const isDateConflicted = (batDau1, ketThuc1, batDau2, ketThuc2) => {
        return !(batDau1 >= ketThuc2 || batDau2 >= ketThuc1);
    };

    const tccbQtLuongUploadData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TccbQtLuong' && files.TccbQtLuong && files.TccbQtLuong.length) {
            const errorDescription = {
                1: 'Thiếu mã số cán bộ',
                2: 'Không tồn tại cán bộ với mã số cán bộ này',
                3: 'Thiếu ngày bắt đầu',
                4: 'Ngày bắt đầu không hợp lệ (dd-mm-yy hoặc dd/mm/yy)',
                5: 'Thiếu ngày kết thúc',
                6: 'Ngày kết thúc không hợp lệ (dd-mm-yy hoặc dd/mm/yy)',
                7: 'Lỗi ngày bắt đầu không nằm trước ngày kết thúc',
                8: 'Thiếu ngày hưởng lương',
                9: 'Ngày hưởng lương không hợp lệ (dd-mm-yy hoặc dd/mm/yy)',
                10: 'Họ tên cán bộ với mã số cán bộ này không khớp với dữ liệu trong hệ thống',
                11: 'Thiếu mã ngạch (không chấp nhận dữ liệu bậc, hệ số lương cho dòng dữ liệu này)',
                12: 'Thiếu bậc lương (không chấp nhận dữ liệu hệ số lương cho dữ liệu này)',
                13: 'Không tồn tại ngạch với mã này',
                14: 'Ngạch không chứa bậc lương này',
            };
            const warningDescription = {
                1: 'Thiếu hệ số lương (dùng hệ số lương lưu trong hệ thống)',
                2: 'Hệ số lương không khớp với dữ liệu ngạch lương trong hệ thống (dùng hệ số lương lưu trong hệ thống)',
                3: 'Dữ liệu bị trùng ngày với những quá trình lương đã có của cán bộ này'
            };
            const srcPath = files.TccbQtLuong[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                let dataSheet = workbook.getWorksheet(QtLuongSheetName);
                if (!dataSheet) {
                    done && done({ error: 'Invalid worksheet' });
                } else {
                    let items = [], falseItems = [], index = 2;
                    try {
                        const getVal = (column, Default) => {
                            Default = Default ? Default : '';
                            let val = dataSheet.getCell(column + index).text;
                            return val ? val : Default;
                        };

                        const ngachCdnnLuongData = await app.model.dmNgachCdnn.getAllDetail();

                        while (true) {
                            if (dataSheet.getCell(`A${index}`).text == '') {
                                done && done({ items, falseItems });
                                break;
                            } else {
                                let data = {
                                    mscb: getVal('A').trim(),
                                    ho: getVal('B').trim(),
                                    ten: getVal('C').trim(),
                                    maNgach: getVal('D').trim(),
                                    bac: getVal('E').trim(),
                                    heSoLuong: getVal('F').trim(),
                                    tyLePhuCapUuDai: getVal('G').trim(),
                                    tyLePhuCapThamNien: getVal('H').trim(),
                                    tyLeVuotKhung: getVal('I').trim(),
                                    phuCapThamNienVuotKhung: getVal('J').trim(),
                                    batDau: getVal('K').trim(),
                                    ketThuc: getVal('L').trim(),
                                    mocNangBacLuong: getVal('M').trim(),
                                    soHieuVanBan: getVal('N').trim(),
                                    errorCode: [],
                                    warningCode: [],
                                    conflictedQtLuong: []
                                };

                                /* Check MSCB */
                                if (!data.mscb) {
                                    data.errorCode.push(1);
                                    data.isError = true;
                                } else {
                                    const canBoByShcc = await app.model.tchcCanBo.get({ statement: 'lower(shcc) = lower(:mscb)', parameter: { mscb: data.mscb } });
                                    if (!canBoByShcc) {
                                        data.errorCode.push(2);
                                        data.isError = true;
                                    } else {
                                        if (data.ten.trim().toLowerCase() != canBoByShcc.ten?.trim().toLowerCase() || data.ho.trim().toLowerCase() != canBoByShcc.ho?.trim().toLowerCase()) {
                                            data.errorCode.push(10);
                                            data.isError = true;
                                        }
                                        data.ten = data.ten.toUpperCase();
                                        data.ho = data.ho.toUpperCase();
                                    }
                                }

                                /* Check ngay */
                                if (!data.batDau) {
                                    data.errorCode.push(3);
                                    data.isError = true;
                                    data.batDau = null;
                                } else if (!data.batDau.includes('/') && !data.batDau.includes('-')) {
                                    data.errorCode.push(4);
                                    data.isError = true;
                                    data.batDau = null;
                                } else {
                                    let [day, month, year] = (data.batDau.includes('/')) ? data.batDau.split('/').map(item => Number(item)) : data.batDau.split('-').map(item => Number(item));
                                    data.batDau = new Date(year, month - 1, day, 0, 0, 0).getTime();
                                }
                                if (!data.ketThuc) {
                                    data.errorCode.push(5);
                                    data.isError = true;
                                    data.ketThuc = null;
                                } else if (!data.ketThuc.includes('/') && !data.ketThuc.includes('-')) {
                                    data.errorCode.push(6);
                                    data.isError = true;
                                    data.ketThuc = null;
                                } else {
                                    let [day, month, year] = (data.ketThuc.includes('/')) ? data.ketThuc.split('/').map(item => Number(item)) : data.ketThuc.split('-').map(item => Number(item));
                                    data.ketThuc = new Date(year, month - 1, day, 0, 0, 0).getTime();
                                }
                                if (data.ketThuc < data.batDau) {
                                    data.errorCode.push(7);
                                    data.isError = true;
                                }
                                if (!data.mocNangBacLuong) {
                                    data.errorCode.push(8);
                                    data.isError = true;
                                    data.mocNangBacLuong = null;
                                } else if (!data.mocNangBacLuong.includes('/') && !data.mocNangBacLuong.includes('-')) {
                                    data.errorCode.push(9);
                                    data.isError = true;
                                    data.mocNangBacLuong = null;
                                } else {
                                    let [day, month, year] = (data.mocNangBacLuong.includes('/')) ? data.mocNangBacLuong.split('/').map(item => Number(item)) : data.mocNangBacLuong.split('-').map(item => Number(item));
                                    data.mocNangBacLuong = new Date(year, month - 1, day, 0, 0, 0).getTime();
                                }

                                /* Check maNgach, bac, heSoLuong */
                                if (!data.maNgach) {
                                    data.errorCode.push(11);
                                    data.isError = true;
                                    data.bac = '';
                                    data.heSoLuong = '';
                                } else {
                                    const ngachCdnnLuongInfo = { ...ngachCdnnLuongData.filter((item) => item.ma == data.maNgach)[0] };

                                    /* Check if exist ngachCdnn with this maNgach */
                                    if (Object.keys(ngachCdnnLuongInfo).length === 0 && ngachCdnnLuongInfo.constructor === Object) {
                                        data.errorCode.push(13);
                                        data.isError = true;
                                        data.heSoLuong = '';
                                    } else {
                                        /* Check if this ngachCdnn have the bac */
                                        if (!data.bac) {
                                            data.errorCode.push(12);
                                            data.isError = true;
                                            data.heSoLuong = '';
                                        } else {
                                            ngachCdnnLuongInfo.luongs = { ...ngachCdnnLuongInfo.luongs.filter(luong => luong.bac == data.bac)[0] };
                                            if (Object.keys(ngachCdnnLuongInfo.luongs).length === 0 && ngachCdnnLuongInfo.luongs.constructor === Object) {
                                                data.errorCode.push(14);
                                                data.isError = true;
                                                data.heSoLuong = '';
                                            } else {
                                                if (!data.heSoLuong) {
                                                    data.warningCode.push(1);
                                                }
                                                if (Number(ngachCdnnLuongInfo.luongs.heSo).toFixed(2) != Number(data.heSoLuong).toFixed(2)) {
                                                    data.warningCode.push(2);
                                                    data.heSoLuong = ngachCdnnLuongInfo.luongs.heSo;
                                                }
                                            }
                                        }
                                    }
                                }

                                /* Check qua trinh luong co bi xung dot ngay (khoang ngay bi giao nhau) voi nhung qua trinh luong truoc do */
                                const qtLuongItemsByShcc = await app.model.qtLuong.getAll({ shcc: data.mscb }, '*', 'batDau,ketThuc');

                                qtLuongItemsByShcc.forEach(item => {
                                    if (item.ketThuc == -1 /* case denNay */ || isDateConflicted(item.batDau, item.ketThuc, data.batDau, data.ketThuc)) {
                                        data.conflictedQtLuong.push(item);
                                    }
                                });
                                if (data.conflictedQtLuong.length > 0) {
                                    data.warningCode.push(3);
                                }

                                data = {
                                    ...data,
                                    errorDetail: data.errorCode.map(errCode => errorDescription[errCode]),
                                    warningDetail: data.warningCode.map(warningCode => warningDescription[warningCode])
                                };
                                if (data.isError) {
                                    falseItems.push(data);
                                } else {
                                    items.push(data);
                                }
                            }
                            index++;
                        }
                    } catch (error) {
                        console.error(error);
                        done && done({ error });
                    }
                }
            }
        }
    };
};