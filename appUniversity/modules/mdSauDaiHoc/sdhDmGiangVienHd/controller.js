module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7535: {
                title: 'Giảng viên hướng dẫn', groupIndex: 2,
                link: '/user/sau-dai-hoc/giang-vien-huong-dan'
            },
        },
    };

    app.permission.add(
        { name: 'sdhDmGiangVienHd:manage', menu },
        { name: 'sdhDmGiangVienHd:write' },
        { name: 'sdhDmGiangVienHd:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesSdhDmGiangVienHd', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmGiangVienHd:manage', 'sdhDmGiangVienHd:write', 'sdhDmGiangVienHd:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/giang-vien-huong-dan', app.permission.check('sdhDmGiangVienHd:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/giang-vien-huong-dan/:shcc', app.permission.check('sdhDmGiangVienHd:manage'), app.templates.admin);

    //API------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/giang-vien-huong-dan/page/:pageNumber/:pageSize', app.permission.check('sdhDmGiangVienHd:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query,
                searchTerm = typeof condition === 'string' ? condition : '';
            const page = await app.model.tchcCanBo.canBoHdSearchPage(pagenumber, pagesize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        }
        catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/giang-vien-huong-dan/item/:shcc', app.permission.check('sdhDmGiangVienHd:write'), async (req, res) => {
        try {
            const shcc = req.params.shcc,
                item = await app.model.tchcCanBo.get({ shcc });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/giang-vien-huong-dan/de-tai/:shcc', app.permission.check('sdhDmGiangVienHd:write'), async (req, res) => {
        try {
            const shcc = req.params.shcc,
                page = await app.model.sdhDmQuanLyDeTai.getGvhdTemp(shcc);
            res.send({ page });
        } catch (error) {
            res.error(error);
        }
    });

    app.get('/api/sdh/giang-vien-huong-dan/edit/item', app.permission.check('sdhDmGiangVienHd:write'), async (req, res) => {
        try {
            const canBo = await app.model.tchcCanBo.get(req.query.condition);
            app.getCanBoProfile(res, canBo);
        } catch (error) {
            res.send({ error: 'Lỗi khi lấy thông tin cán bộ !' });
        }
    });
};