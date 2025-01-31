module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7103: { title: 'Sinh viên chương trình đào tạo', pin: true, link: '/user/dao-tao/svChuongTrinhDaoTao', icon: 'fa-university', backgroundColor: '#186cf2' },
        },
    };

    app.permission.add(
        { name: 'dtSvCtdt:manage', menu },
    );

    app.get('/user/dao-tao/svChuongTrinhDaoTao', app.permission.check('dtSvCtdt:manage'), app.templates.admin);

    // API ============================================
    app.get('/api/dt/svChuongTrinhDaoTao/all', app.permission.check('dtSvCtdt:manage'), async (req, res) => {
        try {
            let items = await app.model.dtSvChuongTrinhDaoTao.getAllCtdt('');
            res.send({ items: items.rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/svChuongTrinhDaoTao', app.permission.check('dtSvCtdt:manage'), async (req, res) => {
        try {
            const { mssv, maCtdt } = req.body.data;
            let exist = await app.model.dtSvChuongTrinhDaoTao.get({ mssv, maCtdt });
            if (exist) throw { message: 'Sinh viên đã đăng ký chương trình đào tạo này rồi!' };
            await app.model.dtSvChuongTrinhDaoTao.create({ mssv, maCtdt, userModified: req.session.user.email, timeModified: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/svChuongTrinhDaoTao', app.permission.check('dtSvCtdt:manage'), async (req, res) => {
        try {
            await app.model.dtSvChuongTrinhDaoTao.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};