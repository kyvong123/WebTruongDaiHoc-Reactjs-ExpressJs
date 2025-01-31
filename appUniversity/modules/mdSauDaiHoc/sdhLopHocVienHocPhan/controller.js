module.exports = app => {

    app.permission.add(
        'sdhLopHocVienHocPhan:read', 'sdhLopHocVienHocPhan:write', 'sdhLopHocVienHocPhan:delete');

    app.permissionHooks.add('staff', 'addRoleSdhLopHocVienHocPhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLopHocVienHocPhan:read', 'sdhLopHocVienHocPhan:write', 'sdhLopHocVienHocPhan:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/sdh/lop-hoc-vien-hoc-phan/all', app.permission.check('sdhLopHocVienHocPhan:read'), async (req, res) => {
        try {
            let items = await app.model.sdhLopHocVienHocPhan.getAll({}, '*', 'maHocPhan DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/sdh/hoc-phan-by-lop-hoc-vien', app.permission.check('sdhLopHocVienHocPhan:read'), async (req, res) => {
        try {
            let maLop = req.query.maLop;
            let items = await app.model.sdhLopHocVienHocPhan.getAll({ maLopHocVien: maLop }, '*', 'maHocPhan DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });


    app.get('/api/sdh/hoc-phan-by-ma-hoc-phan', app.permission.check('sdhLopHocVienHocPhan:read'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan;
            let items = await app.model.sdhLopHocVienHocPhan.getAll({ maHocPhan: maHocPhan });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
};