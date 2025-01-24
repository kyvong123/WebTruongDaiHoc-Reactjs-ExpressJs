module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3043: { title: 'Quá trình Công tác trong nước', link: '/user/tccb/qua-trinh/cong-tac-trong-nuoc', icon: 'fa fa-building', backgroundColor: '#5E8F85', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1002: { title: 'Công tác trong nước', link: '/user/cong-tac-trong-nuoc', icon: 'fa fa-building', backgroundColor: '#5E8F85', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtCongTacTrongNuoc:read', menu },
        { name: 'qtCongTacTrongNuoc:write' },
        { name: 'qtCongTacTrongNuoc:delete' },
        { name: 'qtCongTacTrongNuoc:export' },
    );
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/:shcc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/cong-tac-trong-nuoc', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtCongTacTrongNuoc', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtCongTacTrongNuoc:read', 'qtCongTacTrongNuoc:write', 'qtCongTacTrongNuoc:delete', 'qtCongTacTrongNuoc:export');
        }
        resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/tccb/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtCongTacTrongNuoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/tccb/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/tccb/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/tccb/user/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi, mucDich } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    ///END USER ACTIONS

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi, mucDich } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/group/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi, mucDich } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };
        app.model.qtCongTacTrongNuoc.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:write'), (req, res) => {
        app.model.qtCongTacTrongNuoc.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Công tác trong nước');
            res.send({ error, item });
        });
    });

    app.post('/api/tccb/qua-trinh/cong-tac-trong-nuoc/create-multiple', app.permission.check('qtCongTacTrongNuoc:write'), (req, res) => {
        const { listShcc, noiDen, vietTat, lyDo, kinhPhi, ghiChu, soCv, ngayQuyetDinh, batDauType, batDau, ketThucType, ketThuc } = req.body.data, errorList = [];
        const solve = (index = 0) => {
            if (index == listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Công tác trong nước');
                res.send({ error: errorList });
                return;
            }
            const shcc = listShcc[index];
            const dataAdd = {
                shcc, noiDen, vietTat, lyDo, kinhPhi, ghiChu, soCv, ngayQuyetDinh, batDauType, batDau, ketThucType, ketThuc
            };
            app.model.qtCongTacTrongNuoc.create(dataAdd, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:write'), (req, res) => {
        app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Công tác trong nước');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:write'), (req, res) => {
        app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Công tác trong nước');
            res.send({ error });
        });
    });

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/download-excel/:listShcc/:listDv/:fromYear/:toYear/:timeType/:tinhTrang/:loaiHocVi/:mucDich', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        let { listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich } = req.params ? req.params : { listShcc: null, listDv: null, toYear: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };
        if (listShcc == 'null') listShcc = null;
        if (listDv == 'null') listDv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (tinhTrang == 'null') tinhTrang = null;
        if (loaiHocVi == 'null') loaiHocVi = null;
        if (mucDich == 'null') mucDich = null;
        app.model.qtCongTacTrongNuoc.download(listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('congtactrongnuoc');
                new Promise(resolve => {
                    let cells = [
                        // QT_CONG_TAC_TRONG_NUOC { id, ngayQuyetDinh, soCv, shcc, noiDen, vietTat, lyDo, batDau, batDauType, ketThuc, ketThucType, kinhPhi, ghiChu }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'NGÀY QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'SỐ CV', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'TÊN', bold: true, border: '1234' },
                        { cell: 'H1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'I1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'J1', value: 'NƠI ĐẾN', bold: true, border: '1234' },
                        { cell: 'K1', value: 'VIẾT TẮT', bold: true, border: '1234' },
                        { cell: 'L1', value: 'LÝ DO ĐI', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NGÀY ĐI', bold: true, border: '1234' },
                        { cell: 'N1', value: 'NGÀY VỀ', bold: true, border: '1234' },
                        { cell: 'O1', value: 'KINH PHÍ', bold: true, border: '1234' },
                        { cell: 'P1', value: 'GHI CHÚ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.ngayQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayQuyetDinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.soCv });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.danhSachTinh });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenMucDich });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.lyDo });
                        cells.push({ cell: 'M' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.kinhPhi });
                        cells.push({ cell: 'P' + (index + 2), border: '1234', value: item.ghiChu });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'congtactrongnuoc.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};