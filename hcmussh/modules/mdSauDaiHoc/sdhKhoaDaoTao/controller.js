module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7564: {
                title: 'Khóa đào tạo', link: '/user/sau-dai-hoc/khoa-dao-tao', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'sdhKhoaDaoTao:read', menu }, 'sdhKhoaDaoTao:write', 'sdhKhoaDaoTao:delete'
    );
    app.permissionHooks.add('staff', 'addRoleSdhKhoaDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhKhoaDaoTao:read', 'sdhKhoaDaoTao:write', 'sdhKhoaDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/khoa-dao-tao', app.permission.check('sdhKhoaDaoTao:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/khoa-dao-tao/all', app.permission.check('sdhKhoaDaoTao:read'), async (req, res) => {
        try {
            let { idKhoa, searchTerm } = req.query;
            let items = await app.model.sdhKhoaDaoTao.searchAll(idKhoa, searchTerm);
            res.send({ items: items.rows ? items.rows : [] });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.get('/api/sdh/khoa-dao-tao/item/:id', app.permission.check('sdhKhoaDaoTao:read'), async (req, res) => {
        try {
            let khoa = await app.model.sdhKhoaDaoTao.get({ id: req.params.id });
            let phanHe = await app.model.dmHocSdh.get({ ma: khoa.phanHe }, '*', 'ma');
            let item = { ...khoa, tenPhanHe: phanHe.ten };
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/khoa-dao-tao', app.permission.check('sdhKhoaDaoTao:write'), async (req, res) => {
        try {
            let { data, id } = req.body;
            await app.model.sdhKhoaDaoTao.update({ id: id }, data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/khoa-dao-tao', app.permission.check('sdhKhoaDaoTao:write'), async (req, res) => {
        try {
            let data = req.body.data, duplicate = '', item = '';
            let check = await app.model.sdhKhoaDaoTao.get({ namTuyenSinh: data.namTuyenSinh, phanHe: data.phanHe, idInfoPhanHe: data.idInfoPhanHe ? data.idInfoPhanHe : '' });
            duplicate = check ? 'Khóa đào tạo đã tồn tại' : '';
            item = check ? '' : await app.model.sdhKhoaDaoTao.create(data);
            res.send({ item, error: duplicate });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/khoa-dao-tao', app.permission.check('sdhKhoaDaoTao:delete'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.sdhKhoaDaoTao.delete({ id: id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/khoa-hoc-vien/all', app.permission.check('sdhKhoaDaoTao:write'), async (req, res) => {
        try {
            let items = await app.model.sdhKhoaDaoTao.getKhoaSinhVien(req.query.searchTerm || '');
            res.send({ items: items.rows.map(item => item.namTuyenSinh) });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/khoa-dao-tao/item-khoa-hoc-vien/:khoaHocVien', app.permission.check('sdhKhoaDaoTao:write'), async (req, res) => {
        try {
            let item = await app.model.sdhKhoaDaoTao.get({ namTuyenSinh: req.params.khoaHocVien });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/khoa-dao-tao/check-lop-hoc-vien', app.permission.check('sdhKhoaDaoTao:read'), async (req, res) => {
        try {
            let item = await app.model.sdhLopHocVien.get({ idKhoaDaoTao: req.query.idKhoaDaoTao });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};