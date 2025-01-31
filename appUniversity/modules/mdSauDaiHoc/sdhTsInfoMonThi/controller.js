module.exports = app => {
    app.get('/api/sdh/ts-info/mon-thi/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoMonThi.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/mon-thi', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { data } = req.body;
            await app.model.sdhTsInfoMonThi.delete(data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/mon-thi', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { changes } = req.body;
            const { newItems, newItem, deleteItems, deleteItem } = changes;
            if (newItems && newItems.length) {
                await Promise.all(newItems.map(item => {
                    item.modifier = req.session.user.email;
                    item.timeModified = Date.now();
                    return app.model.sdhTsInfoMonThi.create(item);
                }));
            }
            if (deleteItems && deleteItems.length) {
                const { idNganh, idToHop } = deleteItems[0], listMa = deleteItems.map(item => item.maMonThi);
                const condition = {
                    statement: 'maMonThi IN (:listMa) AND idNganh=:idNganh AND idToHop=:idTohop',
                    parameter: { listMa, idNganh, idToHop }
                };
                await app.model.sdhTsInfoMonThi.delete(condition);
            }
            if (newItem) {
                newItem.modifier = req.session?.user?.email;
                newItem.timeModified = Date.now();
                await app.model.sdhTsInfoMonThi.create({ ...newItem });
            }
            if (deleteItem && deleteItem.maMonThi) {
                await app.model.sdhTsInfoMonThi.delete(deleteItem);

            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/mon-thi', app.permission.orCheck('sdhTsInfoTime:manage', 'sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            let data = req.body.data;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            await app.model.sdhTsInfoMonThi.create(data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/mon-thi/item/:id', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const id = req.params.id;
            let item = await app.model.sdhTsInfoMonThi.get({ id: id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/mon-thi/filter', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { filter } = req.query;
            let data = await app.model.sdhTsInfoMonThi.getByFilter(app.utils.stringify(filter));
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/mon-thi/by-dot', app.permission.orCheck('sdhTsKetQuaThi:write', 'sdhTsKetQuaThi:read'), async (req, res) => {
        try {
            const { idDot } = req.query;
            let data = await app.model.sdhTsInfoMonThi.getByDot(idDot).then(rs => rs.rows);
            const items = data.flatMap(item => {
                if (item.isNgoaiNgu) return [{ ...item, kyNang: 'Speaking' }, { ...item, kyNang: 'Reading' }, { ...item, kyNang: 'Writing' }, { ...item, kyNang: 'Listening' }];
                else return { ...item, kyNang: '' };
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};