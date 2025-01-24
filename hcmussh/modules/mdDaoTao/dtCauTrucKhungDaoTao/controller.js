module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7012: {
                title: 'Khung chung Chương trình đào tạo',
                link: '/user/dao-tao/cau-truc-khung-dao-tao', icon: 'fa-cogs', backgroundColor: '#A84A48', parentKey: 7028
            },
        },
    };
    app.permission.add(
        { name: 'dtCauTrucKhungDaoTao:read', menu },
        { name: 'dtCauTrucKhungDaoTao:write' },
        { name: 'dtCauTrucKhungDaoTao:delete' },
    );
    app.permissionHooks.add('staff', 'addRolesDtCauTrucKhungDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:write', 'dtCauTrucKhungDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:read'), app.templates.admin);
    app.get('/user/dao-tao/cau-truc-khung-dao-tao/:maKhung', app.permission.check('dtCauTrucKhungDaoTao:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/cau-truc-khung-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:read'), async (req, res) => {
        try {
            let pageSize = req.params.pageSize,
                pageNumber = req.params.pageNumber;
            const page = await app.model.dtCauTrucKhungDaoTao.getPage(pageNumber, pageSize, '');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-truc-khung-dao-tao/all', app.permission.check('dtCauTrucKhungDaoTao:read'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/cau-truc-khung-dao-tao/item/:maKhung', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtChuongTrinhDaoTao:manage', 'dtThoiGianMoMon:write', 'dtChuongTrinhDaoTao:read'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.get({ maKhung: req.params.maKhung }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dt/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:write'), async (req, res) => {
        try {
            let item = req.body.item,
                data = await app.model.dtCauTrucKhungDaoTao.get({ maKhung: item.maKhung });
            if (data) throw 'Mã khung đã tồn tại!';
            else item = await app.model.dtCauTrucKhungDaoTao.create({ ...item, bacDaoTao: 'DH' });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }

    });

    app.post('/api/dt/cau-truc-khung-dao-tao/multiple', app.permission.check('dtCauTrucKhungDaoTao:write'), (req, res) => {
        const { data } = req.body;
        const { items, namDaoTao, maKhoa, id: idKhungDt } = data;
        const dataImported = [];

        const handleCreate = (index, idKhungDt) => {
            if (index >= items.length) res.send({ items: dataImported });
            else app.model.dtCauTrucKhungDaoTao.get({ id: items[index].id }, (error, item) => {
                const currentData = { ...items[index], ...{ maKhungDaoTao: idKhungDt } };
                delete currentData['id'];
                if (error) res.send({ error });
                else if (item) {
                    app.model.dtCauTrucKhungDaoTao.update({ id: items[index].id }, currentData, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                        }
                    });
                    handleCreate(index + 1, idKhungDt);
                }
                else {
                    app.model.dtCauTrucKhungDaoTao.create(currentData, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                            handleCreate(index + 1);
                        }
                    });
                }
            });
        };
        if (idKhungDt > 0) {
            app.model.dtKhungDaoTao.get({ id: idKhungDt }, (error, item) => {
                if (error) res.send({ error });
                else if (item) {
                    const { id: idKhungDt, namDaoTao: dbNamDaoTao, maKhoa: dbMaKhoa } = item;
                    const changes = {};
                    if (namDaoTao != dbNamDaoTao) {
                        changes[namDaoTao] = namDaoTao;
                    }
                    if (maKhoa != dbMaKhoa) {
                        changes[maKhoa] = maKhoa;
                    }
                    app.model.dtKhungDaoTao.update({ id: idKhungDt }, changes, () => { });
                    handleCreate(0, idKhungDt);
                }
                else {
                    app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            const { id: idKhungDt } = item;
                            handleCreate(0, idKhungDt);
                        }
                    });
                }
            });
        } else {
            app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                if (error) res.send({ error });
                else {
                    const { id: idKhungDt } = item;
                    handleCreate(0, idKhungDt);
                }
            });
        }

    });

    app.put('/api/dt/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:write'), async (req, res) => {
        let changes = req.body.changes;
        try {
            const item = await app.model.dtCauTrucKhungDaoTao.update({ maKhung: req.body.maKhung }, changes);
            await app.model.dtCauTrucTinChiCtdt.delete({ maKhung: req.body.maKhung });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:delete'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.delete({ maKhung: req.body.maKhung }, errors => res.send({ errors }));
    });

    app.delete('/api/dt/cau-truc-khung-dao-tao/multiple', app.permission.check('dtCauTrucKhungDaoTao:delete'), (req, res) => {
        const { data } = req.body;
        const { items } = data;
        const handleDelete = (index) => {
            if (index >= items.length) res.send();
            app.model.dtCauTrucKhungDaoTao.delete({ id: items[index].id }, (errors) => {
                if (errors) res.send({ errors });
            });
        };
        handleDelete(0);
    });

    //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'dtCauTrucKhungDaoTao:manage', text: 'Đào tạo: Quản lý Cấu trúc khung đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:manage');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'dtCauTrucKhungDaoTao:manage') {
    //             app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:manage');
    //         }
    //     });
    //     resolve();
    // }));
};