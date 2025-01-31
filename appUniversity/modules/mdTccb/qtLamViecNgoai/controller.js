module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            // 3040: { title: 'Quá trình Làm việc ngoài', link: '/user/tccb/qua-trinh/lam-viec-ngoai', icon: 'fa fa-external-link ', color: '#000000', backgroundColor: '#cc6c6c', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1025: { title: 'Làm việc ngoài', subTitle: 'Được mời đi làm việc tại các nơi khác', link: '/user/lam-viec-ngoai', icon: 'fa fa-external-link ', color: '#000000', backgroundColor: '#9cff67', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtLamViecNgoai:read', menu },
        { name: 'qtLamViecNgoai:write' },
        { name: 'qtLamViecNgoai:delete' }
    );
    app.get('/user/tccb/qua-trinh/lam-viec-ngoai', app.permission.check('qtLamViecNgoai:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/lam-viec-ngoai/group/:shcc', app.permission.check('qtLamViecNgoai:read'), app.templates.admin);
    app.get('/user/lam-viec-ngoai', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/tccb/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtLamViecNgoai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/tccb/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtLamViecNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtLamViecNgoai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/tccb/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtLamViecNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.tchcCanBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtLamViecNgoai.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/tccb/user/qua-trinh/lam-viec-ngoai/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/lam-viec-ngoai/page/:pageNumber/:pageSize', app.permission.check('qtLamViecNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/lam-viec-ngoai/group/page/:pageNumber/:pageSize', app.permission.check('qtLamViecNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/qua-trinh/lam-viec-ngoai', app.permission.check('qtLamViecNgoai:write'), (req, res) =>
        app.model.qtLamViecNgoai.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Làm việc ngoài');
            res.send({ error, item });
        }));

    app.post('/api/tccb/qua-trinh/lam-viec-ngoai/create-multiple', app.permission.check('qtLamViecNgoai:write'), (req, res) => {
        const { listShcc, batDauType, batDau, ketThucType, ketThuc, noiLamViec, noiDung } = req.body.data, errorList = [];
        const solve = (index = 0) => {
            if (index == listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Làm việc ngoài');
                res.send({ error: errorList });
                return;
            }
            const shcc = listShcc[index];
            const dataAdd = {
                shcc, batDauType, batDau, ketThucType, ketThuc, noiLamViec, noiDung
            };
            app.model.qtLamViecNgoai.create(dataAdd, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/tccb/qua-trinh/lam-viec-ngoai', app.permission.check('qtLamViecNgoai:write'), (req, res) =>
        app.model.qtLamViecNgoai.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Làm việc ngoài');
            res.send({ error, item });
        }));

    app.delete('/api/tccb/qua-trinh/lam-viec-ngoai', app.permission.check('qtLamViecNgoai:write'), (req, res) =>
        app.model.qtLamViecNgoai.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Làm việc ngoài');
            res.send({ error });
        }));

};