module.exports = app => {
    const adminBlackboxMenu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4508: { title: 'Admin Blackbox', link: '/user/tt/lien-he/blackbox/admin', icon: 'fa fa-envelope-o', backgroundColor: '#5a5a5a', groupIndex: 2 },
        },
    };

    // Constant
    const { isTtLienHeBeta } = require('../constant');

    // Config
    const { blackBoxAdminPermission } = require('./config')(app);

    app.permission.add({ name: blackBoxAdminPermission, menu: adminBlackboxMenu });

    app.get('/user/tt/lien-he/blackbox/admin', app.permission.check(blackBoxAdminPermission), app.templates.admin);

    app.readyHooks.add('addSocketListener:BlackBoxAdminListener', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('fwQABlackBoxAdmin', async (socket) => {
            const user = app.io.getSessionUser(socket);
            if ((!isTtLienHeBeta && user && user.permissions && user.permissions.exists(['fwQuestionAnswer:blackBoxAdmin'])) || (user && user.permissions && user.permissions.exists(['fwQuestionAnswer:blackBoxAdminTest']))) {
                socket.join('fwBlackboxAdmin');
            }
        })
    });

    // Admin Blackbox APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/an-danh/admin/page/:pageNumber/:pageSize', app.permission.check(blackBoxAdminPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            filter.isBlackBox = 1;
            const page = await app.model.fwQuestionAnswer.searchBlackBoxPage(_pageNumber, _pageSize, null, app.utils.stringify(filter), searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            for (let i = 0; i < list.length; i++) {
                if (list[i].isBlackBox == 1) {
                    list[i] = { ...list[i], maDoiTuong: null, creatorEmail: null, hoNguoiTao: null, tenNguoiTao: null };
                }
            }
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};