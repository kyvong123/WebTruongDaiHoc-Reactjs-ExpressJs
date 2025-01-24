module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7035: {
                title: 'Chứng chỉ ngoại ngữ', link: '/user/dao-tao/chung-chi-ngoai-ngu',
                groupIndex: 2, parentKey: 7068
            }
        }
    };
    app.permission.add(
        { name: 'dtDmChungChiNgoaiNgu:manage', menu },
        { name: 'dtDmChungChiNgoaiNgu:write' },
        { name: 'dtDmChungChiNgoaiNgu:delete' }
    );

    app.get('/user/dao-tao/chung-chi-ngoai-ngu', app.permission.check('dtDmChungChiNgoaiNgu:manage'), app.templates.admin);
    // app.get('/user/dao-tao/chung-chi-ngoai-ngu/detail/:id', app.permission.check('dtDmChungChiNgoaiNgu:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/chung-chi-ngoai-ngu/all', app.permission.check('dtDmChungChiNgoaiNgu:manage'), async (req, res) => {
        try {
            let [items, listNgoaiNgu, listTrinhDo] = await Promise.all([
                app.model.dtDmChungChiNgoaiNgu.getAll({}, '*', 'ten ASC'),
                app.model.dtDmNgoaiNgu.getAll({}),
                app.model.dtTrinhDoTuongDuong.getAll({}, '*', 'trinhDo ASC')
            ]);
            for (let item of items) {
                item.tenKhoa = [];
                if (item.khoa) {
                    for (let unit of item.khoa.split(', ')) {
                        let donVi = await app.model.dmDonVi.get({ ma: unit }, 'ten');
                        item.tenKhoa.push(donVi.ten.getFirstLetters());
                    }
                    item.tenKhoa = item.tenKhoa.join(', ');
                }
                item.sub = [];
                let lang = listNgoaiNgu.filter(e => e.ma == item.maNgoaiNgu),
                    trinhDo = listTrinhDo.filter(e => e.idChungChi == item.id);
                if (lang.length) item.tenNgoaiNgu = lang[0].ten;
                if (trinhDo.length) {
                    trinhDo.forEach(e => {
                        item.sub.push(e);
                    });
                }
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-ngoai-ngu/item/:id', app.permission.check('dtDmChungChiNgoaiNgu:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDmChungChiNgoaiNgu.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-ngoai-ngu', app.permission.check('dtDmChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let item = req.body.item;
            item.khoa = item.multipleKhoa;
            item.khoaSinhVien = item.multipleKhoaSV;
            item.loaiHinhDaoTao = item.multipleLoaiHinhDaoTao;
            await app.model.dtDmChungChiNgoaiNgu.create(item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-ngoai-ngu', app.permission.check('dtDmChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            let item = req.body.changes;
            item.khoa = item.multipleKhoa;
            item.khoaSinhVien = item.multipleKhoaSV;
            item.loaiHinhDaoTao = item.multipleLoaiHinhDaoTao;
            await app.model.dtDmChungChiNgoaiNgu.update({ id: req.body.id }, item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/chung-chi-ngoai-ngu', app.permission.check('dtDmChungChiNgoaiNgu:delete'), async (req, res) => {
        try {
            await Promise.all([
                app.model.dtDmChungChiNgoaiNgu.delete({ id: req.body.id }),
                app.model.dtTrinhDoTuongDuong.delete({ idChungChi: req.body.id })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/trinh-do-tuong-duong/all', app.permission.check('dtDmChungChiNgoaiNgu:manage'), async (req, res) => {
        try {
            let chungChi = await app.model.dtDmChungChiNgoaiNgu.get({ id: req.query.id }),
                [ngoaiNgu, items] = await Promise.all([
                    app.model.dtDmNgoaiNgu.get({ ma: chungChi.maNgoaiNgu }),
                    app.model.dtTrinhDoTuongDuong.getAll({ idChungChi: req.query.id }, '*', 'trinhDo ASC'),
                ]);
            items = items.map(e => {
                e.tenChungChi = chungChi.ten;
                e.tenNgoaiNgu = ngoaiNgu.ten;
                return e;
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/trinh-do-tuong-duong', app.permission.check('dtDmChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            await app.model.dtTrinhDoTuongDuong.create(req.body.item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/trinh-do-tuong-duong', app.permission.check('dtDmChungChiNgoaiNgu:write'), async (req, res) => {
        try {
            await app.model.dtTrinhDoTuongDuong.update({ id: req.body.id }, req.body.changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/trinh-do-tuong-duong', app.permission.check('dtDmChungChiNgoaiNgu:delete'), async (req, res) => {
        try {
            await app.model.dtTrinhDoTuongDuong.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};