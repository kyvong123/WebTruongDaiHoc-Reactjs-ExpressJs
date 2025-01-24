module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3027: { title: 'Danh sách giải thưởng', link: '/user/tccb/qua-trinh/giai-thuong', icon: 'fa-trophy', backgroundColor: '#fc7b5d', groupIndex: 5 },
        },
    };
    app.permission.add(
        { name: 'qtGiaiThuong:read', menu },
        { name: 'qtGiaiThuong:write' },
        { name: 'qtGiaiThuong:delete' },
    );
    app.get('/user/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/giai-thuong/group/:shcc', app.permission.check('qtGiaiThuong:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtGiaiThuong', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtGiaiThuong:read', 'qtGiaiThuong:write', 'qtGiaiThuong:delete');
        }
        resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/giai-thuong/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtGiaiThuong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/giai-thuong/group/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtGiaiThuong.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:write'), (req, res) => {
        app.model.qtGiaiThuong.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Giải thưởng');
            res.send({ error, item });
        });
    });

    app.post('/api/tccb/qua-trinh/giai-thuong/create-multiple', app.permission.check('qtGiaiThuong:write'), (req, res) => {
        const { listShcc, tenGiaiThuong, noiDung, noiCap, namCap, soQuyetDinh } = req.body.data, errorList = [];
        const solve = (index = 0) => {
            if (index == listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Giải thưởng');
                res.send({ error: errorList });
                return;
            }
            const shcc = listShcc[index];
            const dataAdd = {
                shcc, tenGiaiThuong, noiDung, noiCap, namCap, soQuyetDinh
            };
            app.model.qtGiaiThuong.create(dataAdd, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:write'), (req, res) => {
        app.model.qtGiaiThuong.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Giải thưởng');
            res.send({ error, item });
        });
    });

    app.delete('/api/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:write'), (req, res) => {
        app.model.qtGiaiThuong.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Giải thưởng');
            res.send({ error });
        });
    });

    app.post('/api/tccb/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtGiaiThuong.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/tccb/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtGiaiThuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtGiaiThuong.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/tccb/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtGiaiThuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtGiaiThuong.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};