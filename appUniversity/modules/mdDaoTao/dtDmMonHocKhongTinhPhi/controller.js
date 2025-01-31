module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7034: {
                title: 'Môn học không tính phí', groupIndex: 2,
                link: '/user/dao-tao/mon-hoc-khong-tinh-phi', parentKey: 7027
            }
        }
    };

    app.permission.add(
        { name: 'dtDmMonHocKhongTinhPhi:manage', menu },
        { name: 'dtDmMonHocKhongTinhPhi:write' },
        { name: 'dtDmMonHocKhongTinhPhi:delete' },
    );

    app.get('/user/dao-tao/mon-hoc-khong-tinh-phi', app.permission.orCheck('dtDmMonHocKhongTinhPhi:manage', 'dtDmMonHocKhongTinhPhi:write', 'dtDmMonHocKhongTinhPhi:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDmMonHocKhongTinhPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmMonHocKhongTinhPhi:manage', 'dtDmMonHocKhongTinhPhi:write', 'dtDmMonHocKhongTinhPhi:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/mon-hoc-khong-tinh-phi/page/:pageNumber/:pageSize', app.permission.orCheck('dtDmMonHocKhongTinhPhi:read', 'dtDmMonHocKhongTinhPhi:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort || 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtDmMonHocKhongTinhPhi.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/mon-hoc-khong-tinh-phi', app.permission.check('dtDmMonHocKhongTinhPhi:write'), async (req, res) => {
        try {
            let { list } = req.body;
            list = list.split(', ');
            let monTrung = [], monKhongTrung = [], message = {};
            for (let mon of list) {
                let items = await app.model.dtDmMonHocKhongTinhPhi.getAll({ maMonHoc: mon });
                if (items.length) {
                    monTrung.push(mon);
                } else {
                    let data = { maMonHoc: mon };
                    await app.model.dtDmMonHocKhongTinhPhi.create(data);
                    monKhongTrung.push(mon);
                }
            }
            if (monTrung.length) {
                monTrung = monTrung.join(', ');
                message.failed = `Môn ${monTrung} đã tồn tại!`;
            }
            if (monKhongTrung.length) {
                monKhongTrung = monKhongTrung.join(', ');
                message.success = `Môn ${monKhongTrung} đã được thêm vào môn học không tính phí!`;
            }
            await app.dkhpRedis.initMonHocKhongTinhPhi();
            res.send({ message });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/mon-hoc-khong-tinh-phi', app.permission.check('dtDmMonHocKhongTinhPhi:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDmMonHocKhongTinhPhi.delete({ id });
            await app.dkhpRedis.initMonHocKhongTinhPhi();
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};