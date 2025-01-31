module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7584: {
                title: 'Thang điểm - Xếp loại', link: '/user/sau-dai-hoc/diem/thang-diem', parentKey: 7560
            }
        }
    };
    app.permission.add(
        { name: 'sdhDiemThangDiem:manage', menu }, 'sdhDiemThangDiem:write', 'sdhDiemThangDiem:delete', 'sdhDiemThangDiem:read'
    );

    app.get('/user/sau-dai-hoc/diem/thang-diem', app.permission.check('sdhDiemThangDiem:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDiemThangDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDiemThangDiem:manage', 'sdhDiemThangDiem:write', 'sdhDiemThangDiem:read', 'sdhDiemThangDiem:delete');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/diem/thang-diem/all', app.permission.check('sdhDiemThangDiem:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemThangDiem.getAll({}, '*', 'ma  ASC');
            items = await Promise.all(items.map(async ({ id, ma, diemDat }) => {
                let xepLoai = await app.model.sdhDiemThangDiemDetail.getAll({ idThangDiem: id, isDelete: 0 }, '*', 'minThangMuoi ASC');
                return ({ id, ma, diemDat, xepLoai });
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/diem/thang-diem', app.permission.check('sdhDiemThangDiem:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemThangDiem.getAll({}, '*', 'ma  ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem/thang-diem', app.permission.check('sdhDiemThangDiem:manage'), async (req, res) => {
        try {
            let { id, thangDiem, thangDiemDetail } = req.body;
            await Promise.all([
                app.model.sdhDiemThangDiem.update({ id }, thangDiem),
                app.model.sdhDiemThangDiemDetail.delete({ idThangDiem: id })
            ]);
            await Promise.all(thangDiemDetail.map(item => {
                item['idThangDiem'] = id;
                app.model.sdhDiemThangDiemDetail.create(item);
            }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/diem/thang-diem', app.permission.check('sdhDiemThangDiem:manage'), async (req, res) => {
        try {
            let { thangDiem, thangDiemDetail } = req.body;
            let dataThangDiem = await app.model.sdhDiemThangDiem.create(thangDiem);
            thangDiemDetail && await Promise.all(thangDiemDetail.map(item => {
                item['idThangDiem'] = dataThangDiem.id;
                app.model.sdhDiemThangDiemDetail.create(item);
            }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/diem/thang-diem-khoa-hoc-vien', app.permission.check('sdhDiemThangDiem:manage'), async (req, res) => {
        try {
            let { khoaHocVien, idThangDiem } = req.body;
            let thangDiemKhoaHv = await app.model.sdhDiemThangDiemKhoaHv.create({ khoaHocVien, idThangDiem });
            res.send({ item: thangDiemKhoaHv });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/diem/thang-diem-khoa-hoc-vien', app.permission.check('sdhDiemThangDiem:manage'), async (req, res) => {
        try {
            let { id, idThangDiem } = req.body;
            let item = await app.model.sdhDiemThangDiemKhoaHv.update({ id }, { idThangDiem });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem/thang-diem-hoc-vien/all', app.permission.check('sdhDiemThangDiem:manage'), async (req, res) => {
        try {
            let khoaHv = await app.model.sdhKhoaDaoTao.getAll({}, 'namTuyenSinh', 'namTuyenSinh ASC');
            khoaHv = Object.keys(khoaHv.groupBy('namTuyenSinh'));
            let items = await Promise.all(khoaHv.map(async (khoa) => {
                let thangDiemHV = await app.model.sdhDiemThangDiemKhoaHv.get({ khoaHocVien: khoa }, '*', '');
                return ({ id: thangDiemHV?.id || '', khoaHocVien: thangDiemHV?.khoaHocVien || khoa, idThangDiem: thangDiemHV?.idThangDiem || '' });
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};
