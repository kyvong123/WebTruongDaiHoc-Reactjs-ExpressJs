module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            // 3037: { title: 'Quá trình Bảo hiểm xã hội', link: '/user/tccb/qua-trinh/bao-hiem-xa-hoi', icon: 'fa-life-ring', backgroundColor: '#02006e', groupIndex: 0 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1009: { title: 'Bảo hiểm xã hội', link: '/user/bao-hiem-xa-hoi', icon: 'fa-life-ring', color: '#ffffff', backgroundColor: '#4faa45', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBaoHiemXaHoi:read', menu },
        { name: 'qtBaoHiemXaHoi:write' },
        { name: 'qtBaoHiemXaHoi:delete' },
    );
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi/group/:shcc', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/bao-hiem-xa-hoi', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/tccb/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBaoHiemXaHoi.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/tccb/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/tccb/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/tccb/user/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/group/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/download-excel/:listShcc/:listDv/:fromYear/:toYear/:timeType/:tinhTrang', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        let { listShcc, listDv, fromYear, toYear, timeType, tinhTrang } = req.params ? req.params : { listShcc: null, listDv: null, toYear: null, timeType: 0, tinhTrang: null };
        if (listShcc == 'null') listShcc = null;
        if (listDv == 'null') listDv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (tinhTrang == 'null') tinhTrang = null;
        app.model.qtBaoHiemXaHoi.download(listShcc, listDv, fromYear, toYear, timeType, tinhTrang, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('baohiemxahoi');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_BAO_HIEM_XA_HOI { id, batDau, batDauType, ketThuc, ketThucType, chucVu, mucDong, phuCapChucVu, phuCapThamNienVuotKhung, phuCapThamNienNghe, tyLeDong, shcc }
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ và tên cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Mức đóng', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Phụ cấp chức vụ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Phụ cấp thâm niên vượt khung', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Phụ cấp thâm niên nghề', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Tỷ lệ đóng', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Bắt đầu', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Kết thúc', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', number: item.mucDong });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', number: item.phuCapChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', number: item.phuCapThamNienVuotKhung });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', number: item.phuCapThamNienNghe });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', number: item.tyLeDong });
                        cells.push({ cell: 'J' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'K' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'baohiemxahoi.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });

};