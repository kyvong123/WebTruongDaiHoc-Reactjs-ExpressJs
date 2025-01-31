module.exports = app => {
    app.get('/api/sdh/ts-info/nganh/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhTsInfoNganh.getAll();
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoNganh.getData(app.utils.stringify(req.query.data));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/nganh', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { maNganh, phanHe, idPhanHe } = req.body.data;
            const nganh = await app.model.sdhTsInfoNganh.get({ maNganh, phanHe, idPhanHe });
            await Promise.all([
                app.model.sdhTsInfoNganh.delete({ maNganh, phanHe, idPhanHe }),
                app.model.sdhTsInfoMonThi.delete({ idNganh: nganh.id })]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/nganh', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let data = req.body.data;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            let items = await app.model.sdhTsInfoNganh.create(data);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/nganh/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            await Promise.all([...req.body.data].map(i => {
                i.modifier = req.session.user.email;
                i.timeModified = Date.now();
                app.model.sdhTsInfoNganh.create(i);
            }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh/item/:id', app.permission.orCheck('sdhTsInfoTime:manage', 'sdhTsThongKe:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhTsInfoNganh.get({ id: req.parms.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh/items', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { idPhanHe, searchTerm } = req.query;
            let data = await app.model.sdhTsInfoNganh.getByPhanHe(idPhanHe);
            const items = data.rows;
            res.send({ items, searchTerm });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh-by-dot/item/:idNganh', app.permission.orCheck('sdhTsInfoTime:manage', 'sdhTsThongKe:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhTsInfoNganh.getOne(req.params.idNganh);
            const result = item.rows[0];
            res.send({ item: result });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh-by-dot/items', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhDsTs:read'), async (req, res) => {
        try {
            const { idDot, searchTerm } = req.query;
            let data = await app.model.sdhTsInfoNganh.getByDot(idDot, searchTerm);
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/nganh/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        const idPhanHe = req.body.data;
        const listNganh = await app.model.sdhTsInfoNganh.getAll({ idPhanHe }, '*', 'idPhanHe');
        const listNganhId = listNganh.map(item => item.id);
        await Promise.all([
            app.model.sdhTsInfoNganh.delete({ idPhanHe }),
            app.model.sdhTsInfoMonThi.delete({
                statement: 'idNganh IN (:listNganh)',
                parameter: { listNganh: listNganhId }
            })
        ]);
        res.end();

    });
    app.put('/api/sdh/ts-info/nganh', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { key, data } = req.body;
            //key:{id:idNganh}, data: {value, idHinhThuc};
            const idHinhThuc = data.idHinhThuc, idNganh = key.id;
            if (idHinhThuc) {
                let { listIdHinhThuc } = await app.model.sdhTsInfoNganh.get(key) || { listIdHinhThuc: '' };
                listIdHinhThuc = listIdHinhThuc?.split(',') || [];
                if (listIdHinhThuc.includes(idHinhThuc)) {
                    if (data.value != 1) {
                        listIdHinhThuc = listIdHinhThuc.filter(item => item && item != idHinhThuc);
                        listIdHinhThuc = listIdHinhThuc.join(',');
                        // updated list hình thức;
                        await app.model.sdhTsInfoNganh.update(key, { listIdHinhThuc });
                        //dọn, xoá các môn không được kích hoạt hình thức
                        const toHopRows = await app.model.sdhTsInfoToHopThi.getAll({ idHinhThuc });
                        const listIdToHop = toHopRows.map(i => i.id);
                        await app.model.sdhTsInfoMonThi.delete({
                            statement: 'idToHop in (:listIdToHop) and idNganh=:idNganh',
                            parameter: { listIdToHop, idNganh }
                        });
                    }
                    res.end();
                } else {
                    if (data.value == 1) {
                        listIdHinhThuc.push(idHinhThuc);
                        listIdHinhThuc = listIdHinhThuc.join(',');
                        await app.model.sdhTsInfoNganh.update(key, { listIdHinhThuc });
                    }
                    res.end();
                }
            } else {
                await app.model.sdhTsInfoNganh.update(key, data);
                res.end();
            }

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/nganh/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter && filter != '%%%%%%%%' ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoNganh.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};