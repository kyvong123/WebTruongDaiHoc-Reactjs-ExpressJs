module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7036: {
                title: 'Môn học không tính trung bình', groupIndex: 2,
                link: '/user/dao-tao/mon-hoc-khong-tinh-trung-binh', parentKey: 7027
            }
        }
    };

    app.permission.add(
        { name: 'dtDmMonHocKhongTinhTb:manage', menu },
        { name: 'dtDmMonHocKhongTinhTb:write' },
        { name: 'dtDmMonHocKhongTinhTb:delete' },
    );

    app.get('/user/dao-tao/mon-hoc-khong-tinh-trung-binh', app.permission.orCheck('dtDmMonHocKhongTinhTb:manage', 'dtDmMonHocKhongTinhTb:write', 'dtDmMonHocKhongTinhTb:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesdtDmMonHocKhongTinhTb', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmMonHocKhongTinhTb:manage', 'dtDmMonHocKhongTinhTb:write', 'dtDmMonHocKhongTinhTb:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDmMonHocKhongTinhTb.getNhom();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/nhom-mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:write'), async (req, res) => {
        try {
            let item = req.body.item;

            let items = await app.model.dtDmNhomMonHocKhongTinhTb.getAll({});
            items = items.filter(e => e.ma == item.ma);
            if (items.length) throw 'Mã nhóm bị trùng';
            else await app.model.dtDmNhomMonHocKhongTinhTb.create(item);

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/nhom-mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:write'), async (req, res) => {
        try {
            let { ma, changes } = req.body;
            await app.model.dtDmNhomMonHocKhongTinhTb.update({ ma }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/nhom-mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.dtDmNhomMonHocKhongTinhTb.delete({ ma });
            await app.model.dtDmMonHocKhongTinhTb.delete({ maNhom: ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:write'), async (req, res) => {
        try {
            let { maNhom, maMonHoc } = req.body.item;
            maMonHoc = maMonHoc.split(', ');
            let monTrung = [], monKhongTrung = [], message = {};
            for (let mon of maMonHoc) {
                let items = await app.model.dtDmMonHocKhongTinhTb.getAll({ maMonHoc: mon });
                if (items.length) {
                    monTrung.push(mon);
                } else {
                    let data = { maNhom, maMonHoc: mon };
                    await app.model.dtDmMonHocKhongTinhTb.create(data);
                    monKhongTrung.push(mon);
                }
            }
            if (monTrung.length) {
                monTrung = monTrung.join(', ');
                message.failed = `Môn ${monTrung} đã được thêm vào môn học không tính trung bình trước đó!`;
            }
            if (monKhongTrung.length) {
                monKhongTrung = monKhongTrung.join(', ');
                message.success = `Môn ${monKhongTrung} đã được thêm vào môn học không tính trung bình!`;
            }
            res.send({ message });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            let items = await app.model.dtDmMonHocKhongTinhTb.getAll({ maMonHoc: changes.maMonHoc });
            if (items.length) throw 'Môn học đã được thêm vào môn học không tính trung bình';
            else await app.model.dtDmMonHocKhongTinhTb.update({ id }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/mon-hoc-khong-tinh-tb', app.permission.check('dtDmMonHocKhongTinhTb:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDmMonHocKhongTinhTb.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};