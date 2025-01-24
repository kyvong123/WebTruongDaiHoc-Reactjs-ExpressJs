module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7064: {
                title: 'Đơn giá giảng dạy', groupIndex: 2,
                link: '/user/dao-tao/don-gia-giang-day', parentKey: 7050
            }
        }
    };

    app.permission.add(
        { name: 'dtDmDonGiaGiangDay:manage', menu },
        { name: 'dtDmDonGiaGiangDay:write' },
        { name: 'dtDmDonGiaGiangDay:delete' },
    );

    app.get('/user/dao-tao/don-gia-giang-day', app.permission.orCheck('dtDmDonGiaGiangDay:manage', 'dtDmDonGiaGiangDay:write', 'dtDmDonGiaGiangDay:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDmDonGiaGiangDay', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmDonGiaGiangDay:manage', 'dtDmDonGiaGiangDay:write', 'dtDmDonGiaGiangDay:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/don-gia-giang-day/page/:pageNumber/:pageSize', app.permission.check('dtDmDonGiaGiangDay:manage'), async (req, res) => {
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

            let page = await app.model.dtDmDonGiaGiangDay.getPage(_pageNumber, _pageSize, filter, null, 'heDaoTao ASC');
            let listHeDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll();
            listHeDaoTao = listHeDaoTao.mapArrayToObject('ma');
            let { totalItem, pageSize, pageTotal, pageNumber, list } = page;
            const listReturn = list.map(item => {
                item['tenHeDaoTao'] = listHeDaoTao[item.heDaoTao]?.ten || '';
                return item;
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list: listReturn, filter } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/don-gia-giang-day/create', app.permission.check('dtDmDonGiaGiangDay:write'), async (req, res) => {
        try {
            const { ten, namHoc, heDaoTao, donGia } = req.body?.data;

            const checkDonGia = await app.model.dtDmDonGiaGiangDay.get({ namHoc, heDaoTao });
            if (checkDonGia) {
                throw 'Đơn giá đã tồn tại trong danh mục';
            }

            let item = await app.model.dtDmDonGiaGiangDay.create({ ten, namHoc, heDaoTao, donGia });
            res.send(item);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/don-gia-giang-day/delete', app.permission.check('dtDmDonGiaGiangDay:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDmDonGiaGiangDay.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/don-gia-giang-day/update', app.permission.check('dtDmDonGiaGiangDay:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let { ten, namHoc, heDaoTao, donGia } = changes;
            const checkDonGia = await app.model.dtDmDonGiaGiangDay.get({ id });
            if (!checkDonGia) {
                throw 'Không tồn tại đơn giá giảng dạy!';
            }
            let item = await app.model.dtDmDonGiaGiangDay.update({ id }, { ten, namHoc, heDaoTao: heDaoTao, donGia });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/don-gia-giang-day/item/:id', app.permission.check('dtDmDonGiaGiangDay:manage'), async (req, res) => {
        try {
            const item = await app.model.dtDmDonGiaGiangDay.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/don-gia-giang-day/page/all', app.permission.check('dtDmDonGiaGiangDay:manage'), async (req, res) => {
        try {
            let condition = {
                statement: 'namHoc = :namHoc  AND heSo LIKE :searchTerm',
                parameter: {
                    namHoc: req.query.filter,
                    searchTerm: `%${req.query.searchTerm}%`
                }
            };
            const items = await app.model.dtDmDonGiaGiangDay.getAll(condition, '*', 'heSo DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};