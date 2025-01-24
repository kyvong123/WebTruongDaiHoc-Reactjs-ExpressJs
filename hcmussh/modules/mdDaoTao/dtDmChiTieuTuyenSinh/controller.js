module.exports = app => {


    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7201: {
                title: 'Chỉ tiêu tuyển sinh', groupIndex: 1, parentKey: 7200,
                link: '/user/dao-tao/tuyen-sinh/chi-tieu', icon: 'fa-list-alt', backgroundColor: '#1ca474'
            }
        }
    };

    app.permission.add({ name: 'dtDmChiTieuTuyenSinh:manage', menu }, 'dtDmChiTieuTuyenSinh:write');

    app.get('/user/dao-tao/tuyen-sinh/chi-tieu', app.permission.check('dtDmChiTieuTuyenSinh:manage'), app.templates.admin);
    app.get('/user/dao-tao/tuyen-sinh/chi-tieu/:namTuyenSinh/:dot', app.permission.check('dtDmChiTieuTuyenSinh:manage'), app.templates.admin);



    app.get('/api/dt/tuyen-sinh/chi-tieu/all', app.permission.check('dtDmChiTieuTuyenSinh:manage'), async (req, res) => {
        try {
            const { rows: items } = await app.model.dtDmChiTieuTuyenSinh.getGroup();
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/tuyen-sinh/chi-tieu/:namTuyenSinh/:dot', app.permission.check('dtDmChiTieuTuyenSinh:manage'), async (req, res) => {
        try {
            const { rows: items } = await app.model.dtDmChiTieuTuyenSinh.getItems(parseInt(req.params.namTuyenSinh), parseInt(req.params.dot));
            const loaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({}, '*', 'ten');
            const nganhList = await app.model.dtNganhDaoTao.getAll();
            const data = loaiHinhDaoTao.map(he => {
                he.nganh = nganhList.map(nganh => ({ ...nganh, soLuong: items.find(i => i.loaiHinhDaoTao == he.ma && i.nganh == nganh.maNganh)?.soLuong || 0 }));
                return he;
            });
            res.send({ data });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/tuyen-sinh/chi-tieu/:namTuyenSinh/:dot', async (req, res) => {
        try {
            const { loaiHinhDaoTao, nganh, soLuong } = req.body;
            const { namTuyenSinh, dot } = req.params;
            let item;
            if (await app.model.dtDmChiTieuTuyenSinh.get({ namTuyenSinh, loaiHinhDaoTao, nganh, dot })) {
                item = await app.model.dtDmChiTieuTuyenSinh.update({ namTuyenSinh, loaiHinhDaoTao, nganh, dot }, { soLuong });
            } else {
                item = await app.model.dtDmChiTieuTuyenSinh.create({ namTuyenSinh, loaiHinhDaoTao, nganh, soLuong, dot });
            }
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

};