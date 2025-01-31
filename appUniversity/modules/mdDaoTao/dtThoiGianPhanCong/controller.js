module.exports = app => {

    app.permission.add(
        'dtThoiGianPhanCong:read', 'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete'
    );

    app.permissionHooks.add('staff', 'addRolesDtThoiGianPhanCong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/dt/thoi-gian-phan-cong', app.permission.check('dtThoiGianPhanCong:read'), async (req, res) => {
        try {
            let semester = await app.model.dtSemester.get({ active: 1 });
            let hocKy = await app.model.dtDmHocKy.get({ ma: semester.hocKy });
            let items = await app.model.dtThoiGianPhanCong.getAll({ nam: semester.namHoc });
            let listDonVi = await app.model.dmDonVi.getAll();
            const data = await Promise.all(items.map(async item => {
                let donvi = listDonVi.find(donvi => donvi.ma == item.donVi);
                return {
                    ...item,
                    tenHocKy: hocKy.ten,
                    tenDonVi: donvi.ten
                };
            }));
            res.send({ data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-gian-phan-cong', app.permission.check('dtThoiGianPhanCong:write'), async (req, res) => {
        try {
            let data = req.body.data,
                semester = await app.model.dtSemester.get({ active: 1 });
            const item = app.model.dtThoiGianPhanCong.create({ ...data, nam: semester.namHoc, hocKy: semester.hocKy });
            res.send(item);
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-gian-phan-cong', app.permission.check('dtThoiGianPhanCong:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.dtThoiGianPhanCong.update({ id: id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};
