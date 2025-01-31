module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6178: { title: 'Sinh hoạt công dân', icon: 'fa-users', link: '/user/ctsv/shcd', groupIndex: 2, backgroundColor: '#898176' }
        }
    };

    app.permission.add(
        { name: 'ctsvShcd:read', menu: menu },
        'ctsvShcd:write',
        'ctsvShcd:delete',
        'ctsvShcd:export'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvShcd', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvShcd:read', 'ctsvShcd:write', 'ctsvShcd:delete', 'ctsvShcd:export');
        }
        resolve();
    }));

    app.get('/user/ctsv/shcd', app.permission.check('ctsvShcd:read'), app.templates.admin);
    app.get('/user/ctsv/shcd/edit/:id', app.permission.check('ctsvShcd:read'), app.templates.admin);

    // API =================================================================================================================================

    app.get('/api/ctsv/shcd/all', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const items = await app.model.svSinhHoatCongDan.getAll(null, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/item', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const id = req.query.id;
            const item = await app.model.svSinhHoatCongDan.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/shcd', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.svSinhHoatCongDan.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            if (parseInt(changes.kichHoat) == 1) {
                await app.model.svSinhHoatCongDan.update('', { kichHoat: 0 });
            }
            const item = await app.model.svSinhHoatCongDan.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/shcd', app.permission.check('ctsvShcd:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            // listEvent = await app.model.svShcdLich.getAll({ shcdId: id });
            const [listEvent, listNoiDung] = await Promise.all([
                app.model.svShcdLich.getAll({ shcdId: id }),
                app.model.svShcdNoiDung.getAll({ shcdId: id })
            ]);
            await Promise.all([
                app.model.svShcdNoiDung.delete({ shcdId: id }),
                (listNoiDung?.length && app.model.svShcdNoiDungHdt.delete({ statement: 'noiDungId in (:listNoiDung)', parameter: { listNoiDung: listNoiDung.map(nd => nd.id) } })),
                app.model.svShcdLich.delete({ shcdId: id }),
                app.model.svSinhHoatCongDan.delete({ id }),
                (listEvent?.length && app.model.svShcdLichNganh.delete({ statement: 'lichId in (:listEvent)', parameter: { listEvent: listEvent.map(lich => lich.id) } })),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/item/data', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const id = req.query.id;
            const { listnoidung: listNoiDung, listevent: listEvent, listguest: listGuest, rows: [item] } = await app.model.svSinhHoatCongDan.getData(id);

            let { rows: listAssignRole } = await app.model.svShcdAssignRole.getData(null, null, id);

            res.send({ item, listNoiDung, listEvent, listGuest, listAssignRole });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/download-excel', app.permission.check('ctsvShcd:export'), async (req, res) => {
        try {
            const shcdId = req.query.shcdId;
            const [shcdData, { rows: data }] = await Promise.all([
                app.model.svSinhHoatCongDan.get({ id: shcdId }),
                app.model.svSinhHoatCongDan.downloadExcel(shcdId)
            ]);
            if (!data || !data.length) throw 'Dữ liệu bị trống!';
            const wb = app.excel.create(),
                ws = wb.addWorksheet('Lịch');
            ws.columns = [{ header: 'STT', key: 'stt' }, ...Object.keys(data[0]).map(key => ({ header: key, key }))];
            data.forEach((item, index) => ws.addRow({ stt: index + 1, ...item }));

            // Set width to fit
            ws.columns.forEach(function (column) {
                const lengths = column.values.map(v => v.toString().length);
                const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
                column.width = maxLength;
                column.width = maxLength < 5 ? 5 : maxLength;
            });
            const buffer = await wb.xlsx.writeBuffer();
            res.send({ buffer, filename: `Lich SHCD ${shcdData.khoaSinhVien}.xlsx` });
            // app.excel.attachment(wb, res, `Lich SHCD ${shcdData.khoaSinhVien}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

};