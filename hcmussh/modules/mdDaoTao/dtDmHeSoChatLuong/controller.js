module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7062: {
                title: 'Hệ số chất lượng', groupIndex: 2,
                link: '/user/dao-tao/he-so-chat-luong', parentKey: 7050
            }
        }
    };

    app.permission.add(
        { name: 'dtDmHeSoChatLuong:manage', menu },
        { name: 'dtDmHeSoChatLuong:write' },
        { name: 'dtDmHeSoChatLuong:delete' },
    );

    app.get('/user/dao-tao/he-so-chat-luong', app.permission.orCheck('dtDmHeSoChatLuong:manage', 'dtDmHeSoChatLuong:write', 'dtDmHeSoChatLuong:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDmHeSoChatLuong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmHeSoChatLuong:manage', 'dtDmHeSoChatLuong:write', 'dtDmHeSoChatLuong:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/he-so-chat-luong/page/:pageNumber/:pageSize', app.permission.check('dtDmHeSoChatLuong:manage'), async (req, res) => {
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
            let page = await app.model.dtDmHeSoChatLuong.getPage(_pageNumber, _pageSize, filter, null, 'heSo ASC');
            const listNgach = await app.model.dmNgachCdnn.getAll();
            const { totalItem, pageSize, pageTotal, pageNumber, list } = page;
            const listReturn = list.map(item => {
                if (item.ngach) {
                    item['tenNgach'] = listNgach.find(cur => item.ngach.includes(cur.ma))?.ten || null;
                }
                return item;
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list: listReturn, filter } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/he-so-chat-luong/create', app.permission.check('dtDmHeSoChatLuong:write'), async (req, res) => {
        try {
            const { ma, ngach, hocVi, hocHam, heSo, namHoc } = req.body?.data;
            const condition = {
                statement: 'ma = :ma OR (hocVi = :hocVi AND hocHam = :hocHam AND namHoc = :namHoc)',
                parameter: {
                    ma, hocVi, hocHam, namHoc
                }
            };
            const checkHeSo = await app.model.dtDmHeSoChatLuong.get(condition);
            if (checkHeSo) {
                throw 'Danh mục hệ số đã tồn tại';
            }

            await app.model.dtDmHeSoChatLuong.create({ ma, ngach, hocVi, hocHam, heSo, namHoc });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/he-so-chat-luong/delete', app.permission.check('dtDmHeSoChatLuong:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.dtDmHeSoChatLuong.delete({ ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/he-so-chat-luong/update', app.permission.check('dtDmHeSoChatLuong:write'), async (req, res) => {
        try {
            let { ma, changes } = req.body;
            let items = await app.model.dtDmHeSoChatLuong.update({ ma }, { heSo: changes.heSo });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/he-so-chat-luong/item/:ma', app.permission.check('dtDmHeSoChatLuong:manage'), async (req, res) => {
        try {
            const item = await app.model.dtDmHeSoChatLuong.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/he-so-chat-luong/page/all', app.permission.check('dtDmHeSoChatLuong:manage'), async (req, res) => {
        try {
            let condition = {
                statement: 'namHoc = :namHoc  AND heSo LIKE :searchTerm',
                parameter: {
                    namHoc: req.query.filter,
                    searchTerm: `%${req.query.searchTerm}%`
                }
            };
            const items = await app.model.dtDmHeSoChatLuong.getAll(condition, '*', 'heSo DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};