module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            512: { title: 'Hệ thống trạng thái văn bản đi', link: '/user/hcth/trang-thai-van-ban-di', icon: 'fa fa-list-alt', backgroundColor: '#AC2D34', groupIndex: 2 },
        },
    };
    app.permission.add('hcthVanBanDiStatusSystem:write', { name: 'hcthVanBanDiStatusSystem:manage', menu: staffMenu }, 'hcthVanBanDiStatusSystem:delete');

    app.get('/user/hcth/trang-thai-van-ban-di', app.permission.check('hcthVanBanDiStatusSystem:manage'), app.templates.admin);
    app.get('/user/hcth/trang-thai-van-ban-di/:id', app.permission.check('hcthVanBanDiStatusSystem:manage'), app.templates.admin);

    app.get('/api/hcth/trang-thai-van-ban-di/page/:pageNumber/:pageSize', app.permission.orCheck('hcthVanBanDiStatusSystem:manage', 'staff:login'), async (req, res) => {
        try {
            const { condition, filter = {} } = req.query;
            const { pageSize, pageNumber } = req.params;
            const page = await app.model.hcthVanBanDiStatusSystem.searchPage(parseInt(pageNumber), parseInt(pageSize), condition, app.utils.stringify(filter));
            res.send({ page: { list: page.rows, pageNumber: page.pagenumber, pageSize: page.pagesize, totalItem: page.totalitem, pageTotal: page.pagetotal } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/trang-thai-van-ban-di', app.permission.check('hcthVanBanDiStatusSystem:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthVanBanDiStatusSystem.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/trang-thai-van-ban-di/copy', app.permission.check('hcthVanBanDiStatusSystem:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            const newItem = await app.model.hcthVanBanDiStatusSystem.create(data);
            const sourceId = data.sourceId;
            const details = await app.model.hcthVanBanDiStatusDetail.getAll({ systemId: sourceId });

            await Promise.all(details.map(async detail => {
                const { id: detailId, ...detailData } = detail;
                const newDetail = await app.model.hcthVanBanDiStatusDetail.create({ ...detailData, systemId: newItem.id });
                const doiTuongList = await app.model.hcthDoiTuongTrangThai.getAll({ trangThaiId: detailId });
                await app.model.hcthDoiTuongTrangThai.bulkCreate(doiTuongList.map(item => ({ ...item, trangThaiId: newDetail.id })));
            }));
            res.send({ newItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/trang-thai-van-ban-di/item/:id', app.permission.check('hcthVanBanDiStatusSystem:manage'), async (req, res) => {
        try {
            const id = req.params.id;
            const changes = req.body;
            if (!await app.model.hcthVanBanDiStatusSystem.get({ id }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthVanBanDiStatusSystem.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/trang-thai-van-ban-di/ctsv/qd', app.permission.orCheck('hcthVanBanDiStatusSystem:manage', 'hcthCongVanDi:manage', 'staff:login'), async (req, res) => {
        try {
            const setting = await app.model.svSetting.getValue('systemId');
            let item;
            if (!(item = await app.model.hcthVanBanDiStatusSystem.get({ id: setting.systemId })))
                throw 'Dữ liệu không tồn tại';
            const details = await app.model.hcthVanBanDiStatusSystem.getItem(item.id);
            item.details = details.rows;
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/trang-thai-van-ban-di/item/:id', app.permission.orCheck('hcthVanBanDiStatusSystem:manage', 'hcthCongVanDi:manage', 'staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            if (!await app.model.hcthVanBanDiStatusSystem.get({ id }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthVanBanDiStatusSystem.get({ id });

            const details = await app.model.hcthVanBanDiStatusSystem.getItem(parseInt(id));
            item.details = details.rows;
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/trang-thai-van-ban-di', app.permission.orCheck('hcthVanBanDiStatusSystem:manage', 'hcthCongVanDi:manage'), async (req, res) => {
        try {
            const id = req.body.id;
            let instance;
            if (!parseInt(id) || !(instance = await app.model.hcthVanBanDiStatusSystem.get({ id })))
                throw 'Dữ liệu không tồn tại';
            await app.model.hcthVanBanDiStatusSystem.delete({ id: instance.id });
            const details = await app.model.hcthVanBanDiStatusDetail.getAll({ systemId: instance.id });
            await app.model.hcthVanBanDiStatusDetail.delete({ systemId: instance.id });
            if (details.length)
                await app.model.hcthDoiTuongTrangThai.delete({
                    statement: 'trangThaiId in (:idList)',
                    parameter: { idList: details.map(item => item.id) }
                });
            res.send({ instance });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    // Phân quyền soạn thảo văn bản đi trong đơn vị
    const settingRole = 'hcthStatusSetting';

    app.assignRoleHooks.addRoles(settingRole, { id: 'hcthVanBanDiStatusSystem:manage', text: 'Hành chính - Tổng hợp: Cấu hình trạng thái văn bản đi' });

    app.assignRoleHooks.addHook(settingRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === settingRole && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(settingRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleCauHinhCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == settingRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthVanBanDiStatusSystem:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcthVanBanDiStatusSystem:manage', 'hcthVanBanDiStatusSystem:write', 'hcthVanBanDiStatusSystem:delete', 'hcthVanBanDiStatusSystemDetail:write', 'hcthVanBanDiStatusSystemDetail:manage', 'hcthVanBanDiStatusSystemDetail:delete', 'hcthDoiTuongKiemDuyet:manage', 'hcthSignType:manage', 'hcthVanBanDiStatus:manage', 'hcthVanBanDiStatus:write');
            }
        });
        resolve();
    }));

    app.permissionHooks.add('staff', 'checkRoleCauHinhQuanLyHCTH', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length > 0 && staff.donViQuanLy.some(item => item.maDonVi == 29)) {
            app.permissionHooks.pushUserPermission(user, 'hcthVanBanDiStatusSystem:manage', 'hcthVanBanDiStatusSystem:write', 'hcthVanBanDiStatusSystem:delete', 'hcthVanBanDiStatusSystemDetail:write', 'hcthVanBanDiStatusSystemDetail:manage', 'hcthVanBanDiStatusSystemDetail:delete', 'hcthDoiTuongKiemDuyet:manage', 'hcthSignType:manage', 'hcthVanBanDiStatus:manage', 'hcthVanBanDiStatus:write');
        }
        resolve();
    }));

};