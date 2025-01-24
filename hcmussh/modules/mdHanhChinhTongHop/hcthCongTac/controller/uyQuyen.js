module.exports = app => {
    app.permission.add('hcthCongTac:uyQuyen');

    // app.permissionHooks.add('staff', 'addRoleUyQuyenCongTac', async user => {
    //     if (user.permissions.includes('manager:login') || user.permissions.includes('rectors:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'hcthCongTac:uyQuyen');
    //     }
    // });

    // app.permissionHooks.add('staff', 'addRoleLichUyQuyenCongTac', async (user) => {
    //     await app.model.hcthUyQuyen.get({ shcc: user.shcc }).then(item => item && app.permissionHooks.pushUserPermission(user, 'hcthCongTac:lichUyQuyen'));
    // });

    const hcthMenu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            524: { title: 'Lịch công tác ủy quyền', link: '/user/vpdt/uy-quyen/lich-cong-tac', icon: 'fa-building', backgroundColor: '#4895ef', groupIndex: 1 },
        },
    };
    app.permission.add({ name: 'hcthCongTac:lichUyQuyen', menu: hcthMenu });
    app.get('/user/vpdt/uy-quyen/lich-cong-tac', app.permission.check('hcthCongTac:lichUyQuyen'), app.templates.admin);
    app.get('/user/vpdt/uy-quyen/lich-cong-tac/:shcc', app.permission.check('hcthCongTac:lichUyQuyen'), app.templates.admin);


    app.get('/api/hcth/cong-tac/uy-quyen/all', app.permission.check('hcthCongTac:uyQuyen'), async (req, res) => {
        try {
            let items = await app.model.hcthUyQuyen.getAll({ shccUyQuyen: req.session.user.shcc });
            items = await Promise.all(items.map(async item => {
                const canBoInfo = await app.model.tchcCanBo.get({ shcc: item.shcc }, 'ten,ho,maDonVi'),
                    donVi = canBoInfo && await app.model.dmDonVi.get({ ma: canBoInfo.maDonVi });

                return {
                    shcc: item.shcc, id: item.id, ten: canBoInfo?.ten || '',
                    ho: canBoInfo?.ho || '', tenDonVi: donVi?.ten
                };
            }));

            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/uy-quyen/list', app.permission.check('hcthCongTac:lichUyQuyen'), async (req, res) => {
        try {
            let items = await app.model.hcthUyQuyen.getAll({ shcc: req.session.user.shcc });
            items = await Promise.all(items.map(async item => {
                const canBoInfo = await app.model.tchcCanBo.get({ shcc: item.shccUyQuyen }, 'ten,ho,maDonVi'),
                    [donVi, image] = await Promise.all([
                        canBoInfo && app.model.dmDonVi.get({ ma: canBoInfo.maDonVi }),
                        app.model.fwUser.get({ shcc: item.shccUyQuyen }, 'image').then(fUser => fUser.image),
                    ]);

                return {
                    shcc: item.shccUyQuyen, id: item.id, ten: canBoInfo?.ten || '',
                    ho: canBoInfo?.ho || '', tenDonVi: donVi?.ten, image: image || '/img/avatar.png',
                };
            }));

            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-tac/uy-quyen/all', app.permission.check('hcthCongTac:uyQuyen'), async (req, res) => {
        try {
            const { shcc } = req.body;
            await app.model.hcthUyQuyen.create({ shcc, shccUyQuyen: req.session.user.shcc, timeModified: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/uy-quyen/all', app.permission.check('hcthCongTac:uyQuyen'), async (req, res) => {
        try {
            const { shcc, id } = req.body;
            await app.model.hcthUyQuyen.update({ id }, { shcc, timeModified: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/uy-quyen/all', app.permission.check('hcthCongTac:uyQuyen'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.hcthUyQuyen.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/user-uy-quyen/page/:pageNumber/:pageSize', app.permission.check('hcthCongTac:lichUyQuyen'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            let filterData = req.query.filter || {};
            filterData = { ...filterData, batDau: Number(filterData.batDau) || null, ketThuc: Number(filterData.ketThuc) || null };
            const pageCondition = req.query.condition;
            const [page, canBoInfo] = await Promise.all([
                app.model.hcthCongTacItem.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition),
                app.model.tchcCanBo.get({ shcc: filterData.userShcc }, 'shcc, ho, ten')
            ]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }, canBoInfo });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};