module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7065: {
                title: 'Hệ số khối lượng', groupIndex: 2,
                link: '/user/dao-tao/he-so-khoi-luong', parentKey: 7050
            }
        }
    };

    app.permission.add(
        { name: 'dtDmHeSoKhoiLuong:manage', menu },
        { name: 'dtDmHeSoKhoiLuong:write' },
        { name: 'dtDmHeSoKhoiLuong:delete' },
    );

    app.get('/user/dao-tao/he-so-khoi-luong', app.permission.orCheck('dtDmHeSoKhoiLuong:manage', 'dtDmHeSoKhoiLuong:write', 'dtDmHeSoKhoiLuong:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDmHeSoKhoiLuong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmHeSoKhoiLuong:manage', 'dtDmHeSoKhoiLuong:write', 'dtDmHeSoKhoiLuong:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/he-so-khoi-luong/page/:pageNumber/:pageSize', app.permission.check('dtDmHeSoKhoiLuong:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            let filter = req.query.filter;
            if (!filter) {
                const currentSemester = await app.model.dtSemester.getCurrent();
                filter = {
                    namHoc: currentSemester?.namHoc
                };
            }
            // let condition = { statement: null };
            // if (req.query.condition) {
            //     condition = {
            //         statement: 'lower(ten) LIKE: searchText',
            //         parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            //     };
            // }
            let page = await app.model.dtDmHeSoKhoiLuong.getPage(_pageNumber, _pageSize, filter, null, 'soLuongDuoi ASC');
            const { totalItem, pageSize, pageTotal, pageNumber, list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list, filter } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/he-so-khoi-luong/create', app.permission.check('dtDmHeSoKhoiLuong:write'), async (req, res) => {
        try {
            const { soLuongTren, soLuongDuoi, heSo, namHoc } = req.body?.data || {};
            if (!soLuongTren || !soLuongDuoi || !heSo || !namHoc) {
                throw 'Tham số không hợp lệ';
            }
            if (parseInt(soLuongTren) <= parseInt(soLuongDuoi)) {
                throw 'Tham số không hợp lệ';
            }
            const condition = {
                statement: 'NOT ((soLuongDuoi > :soLuongTren OR soLuongTren < :soLuongDuoi) AND namHoc = :namHoc OR namHoc != :namHoc)',
                parameter: {
                    soLuongDuoi: parseInt(soLuongDuoi),
                    soLuongTren: parseInt(soLuongTren),
                    namHoc
                }
            };
            const checkKhoangHopLe = await app.model.dtDmHeSoKhoiLuong.get(condition);
            if (!checkKhoangHopLe) {
                await app.model.dtDmHeSoKhoiLuong.create({ soLuongTren, soLuongDuoi, heSo, namHoc });
            } else {
                throw 'Tham số không hợp lệ';
            }
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/he-so-khoi-luong/delete', app.permission.check('dtDmHeSoKhoiLuong:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDmHeSoKhoiLuong.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/he-so-khoi-luong/update', app.permission.check('dtDmHeSoKhoiLuong:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let items = await app.model.dtDmHeSoKhoiLuong.update({ id }, changes);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/he-so-khoi-luong/item/:id', app.permission.check('dtDmHeSoKhoiLuong:manage'), async (req, res) => {
        try {
            const item = await app.model.dtDmHeSoKhoiLuong.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/he-so-khoi-luong/page/all', app.permission.check('dtDmHeSoKhoiLuong:manage'), async (req, res) => {
        try {
            let condition = {
                statement: 'namHoc = :namHoc  AND heSo LIKE :searchTerm',
                parameter: {
                    namHoc: req.query.filter.namHoc,
                    searchTerm: `%${req.query.searchTerm}%`
                }
            };
            const items = await app.model.dtDmHeSoKhoiLuong.getAll(condition, '*', 'heSo DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};