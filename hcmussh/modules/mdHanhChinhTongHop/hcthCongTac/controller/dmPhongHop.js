module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.hcth,
    //     menus: {
    //         521: { title: 'Phòng họp', link: '/user/category/loai-van-ban' },
    //     },
    // };
    app.permission.add(
        // { name: 'hcthDmPhongHop:read', menu },
        { name: 'hcthDmPhongHop:read' },
        { name: 'hcthDmPhongHop:write' },
        { name: 'hcthDmPhongHop:delete' },
        { name: 'hcthDmPhongHop:upload' },
    );


    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/phong-hop/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const statement = ['ten']
                .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
            if (req.query.condition) {
                condition = {
                    statement,
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.hcthDmPhongHop.getPage(pageNumber, pageSize, condition);
            res.send({ page });

        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/phong-hop/all', app.permission.check('staff:login'), async (req, res) => {
        try {
            const items = await app.model.hcthDmPhongHop.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/phong-hop/tra-cuu', app.permission.check('staff:login'), async (req, res) => {
        try {
            const permissionsDict = req.session.user.permissions.reduce((total, current) => {
                total[current] = true;
                return total;
            }, {});
            const dmPhongHop = await app.model.hcthDmPhongHop.getAll().then(items => items.filter(i => !i.userPermission || permissionsDict[i.userPermission]));
            const { rows: phongHopBan } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify(req.query));
            if (phongHopBan.find(i => i.phongHop == 'D201 - D202'))
                phongHopBan.push({ phongHop: 'D201' }, { phongHop: 'D202' });
            else if (phongHopBan.find(i => ['D201', 'D202'].includes(i.phongHop))) {
                phongHopBan.push({ phongHop: 'D201 - D202' });
            }
            res.send({ items: dmPhongHop.difference(phongHopBan, (a, b) => a.ma == b.phongHop) });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/phong-hop/item/:ma', app.permission.check('staff:login'), async (req, res) => {
        try {
            let item = await app.model.hcthDmPhongHop.get({ ma: req.params.ma });
            res.send({ item });
        }
        catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/phong-hop', app.permission.check('hcthDmPhongHop:write'), async (req, res) => {
        try {
            let data = req.body;
            const item = await app.model.hcthDmPhongHop.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/phong-hop', app.permission.check('hcthDmPhongHop:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.hcthDmPhongHop.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }

    });

    app.delete('/api/hcth/phong-hop', app.permission.check('hcthDmPhongHop:delete'), (req, res) => {
        app.model.hcthDmPhongHop.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
