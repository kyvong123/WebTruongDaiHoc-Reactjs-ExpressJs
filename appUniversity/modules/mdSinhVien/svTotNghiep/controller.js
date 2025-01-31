module.exports = app => {
    const PERMISSION = 'student:login';

    const menu = {
        parentMenu: app.parentMenu.hocTap,
        menus: {
            7735: { title: 'Tra cứu tốt nghiệp', link: '/user/tra-cuu-tot-nghiep' },
        }
    };

    app.permission.add(
        { name: PERMISSION, menu },
    );

    app.get('/user/tra-cuu-tot-nghiep', app.permission.check(PERMISSION), app.templates.admin);

    // APIS ==========================================
    app.get('/api/sv/ket-qua-tot-nghiep', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { mssv } = req.session.user,
                { idDot } = req.query;

            const { rows: list } = await app.model.dtKetQuaTotNghiep.searchPage(1, 50, app.utils.stringify({ mssv, idDot }));
            res.send({ list });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};