module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1021: { title: 'Danh sách nhân sự đơn vị', link: '/user/nhan-su-don-vi', icon: 'fa-user-circle-o', backgroundColor: '#e30000', pin: true },
        },
    };

    app.permission.add(
        { name: 'manager:read', menu: menuStaff },
        { name: 'manager:write' }
    );
    app.get('/user/nhan-su-don-vi', app.permission.check('manager:read'), app.templates.admin);

    app.get('/api/tccb/nhan-su-don-vi', app.permission.check('manager:read'), (req, res) => {
        let listDonVi = req.query.listDonVi || [],
            condition = {
                statement: 'maDonVi IN (:listDonVi)',
                parameter: { listDonVi }
            };
        if (req.session.user.isStaffTest) condition.statement += ' AND isTest = 1';
        else condition.statement += ' AND isTest IS NULL';
        listDonVi.length ? app.model.tchcCanBo.getAll(condition, 'shcc,ho,ten,email,dienThoaiCaNhan,ngach,maDonVi,ngayNghi', 'ten', (error, items) => {
            if (error || !items) {
                res.send({ error });
            } else if (listDonVi.includes('30')) {
                let result = [];
                items.forEach((tccbStaff, index, list) =>
                    app.model.tccbStaffLog.get({ email: tccbStaff.email }, (error, tccbLog) => {
                        if (error) {
                            res.send({ error });
                        } else {
                            app.model.dmNgachCdnn.get({ ma: tccbStaff.ngach }, (error, ngachCDNN) => {
                                if (!error && ngachCDNN) {
                                    tccbStaff = app.clone(tccbStaff, { tccbLog, tenNgach: ngachCDNN.ten });
                                    result.push(tccbStaff);
                                    if (index === list.length - 1) res.send({ error, items: result });
                                }
                            });
                        }
                    }
                    ));
            } else {
                res.send({ error, items });
            }
        }) : res.send({ items: [] });
    });
};