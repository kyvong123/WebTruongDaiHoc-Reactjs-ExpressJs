module.exports = (app) => {

    //------API--------------s

    app.post('/api/sdh/ts-info/phong-thi', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            let data = req.body.data;
            data.phong = data.phong.join(',');
            let item = await app.model.sdhTsDmPhongThi.create({ ...data });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/phong-thi', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            let data = req.body.data;
            data.phong = data.phong.join(',');
            let id = req.body.id;
            let item = await app.model.sdhTsDmPhongThi.update({ id }, { ...data });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/phong-thi', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            await app.model.sdhTsDmPhongThi.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/phong-thi/multiple', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const listId = req.body.listId;
            await app.model.sdhTsDmPhongThi.delete({
                statement: 'id IN (:listLichThi)',
                parameter: { listLichThi: listId }
            });

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phong-thi/item/:id', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const id = req.body.params.id;
            let item = await app.model.sdhTsInfoLichThi.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phong-thi/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter && filter != '%%%%%%%%' ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsDmPhongThi.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


};
