
module.exports = app => {
    //-------------------------------------APIs------------------------------------------------//

    app.get('/api/sdh/lich-thi/danh-sach-thi-sinh/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter && filter != '%%%%%%%%' ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi/danh-sach-them/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter.sort || 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.dsThemSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, totalslots: totalSlots, arrangedSlots } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list, totalSlots, arrangedSlots } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi/danh-sach-thi-sinh-duoc-xep/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter.sort || 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.dsdxSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list, filter } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi/danh-sach-them-tuy-chon/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter.sort || 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.dstcSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi/danh-sach-them/mon-thi/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter.sort || 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.searchPageByMonThi(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/lich-thi/thi-sinh-du-thi/delete', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const { sbd, idLichThi } = req.body;
            await app.model.sdhTsInfoCaThiThiSinh.delete({ sbd, idLichThi });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/lich-thi/thi-sinh-du-thi/multi-delete', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const lst = req.body.lst || [], idLichThi = req.body.idLichThi;
            await Promise.all([lst.length ? app.model.sdhTsInfoCaThiThiSinh.delete({
                statement: 'sbd IN (:lstSbd) AND idLichThi = (:id)',
                parameter: { lstSbd: lst, id: idLichThi }
            }) : null]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi/item/:id', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const item = await app.model.sdhTsInfoCaThiThiSinh.getInfoLichThi(id);
            res.send({ item: item.rows[0] });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.put('/api/sdh/lich-thi/danh-sach-thi-sinh/update', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { changes, idLichThi } = req.body;
            const { add, remove } = changes;
            const addLoop = add && add.length ? async () => {
                for (const { soBaoDanh, id, maHinhThuc } of add) {
                    const item = await app.model.sdhTsInfoCaThiThiSinh.get({ idLichThi, idThiSinh: id });
                    if (item) {
                        continue;
                    } else {
                        const toHop = await app.model.sdhTsInfoLichThi.get({ id: idLichThi });
                        const monThi = await app.model.sdhTsInfoCaThiThiSinh.getTenMonThi(id, toHop.idToHop);
                        await app.model.sdhTsInfoCaThiThiSinh.create({ idLichThi, sbd: soBaoDanh, idThiSinh: id, maMonThi: monThi.rows[0].maMonThi || '', maHinhThuc: maHinhThuc });
                    }
                }
            } : () => { }, removeLoop = remove && remove.length ? async () => {
                for (const { id } of remove) {
                    await app.model.sdhTsInfoCaThiThiSinh.delete({ idLichThi, idThiSinh: id });
                }
            } : () => { };
            await Promise.all([addLoop(), removeLoop()]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    // app.get('/api/sdh/lich-thi/mon-danh-phach', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
    //     try {
    //         let dot = await app.model.sdhTsInfoTime.get({processing:1});

    //         // const pagenumber = parseInt(req.params.pageNumber),
    //         //     pagesize = parseInt(req.params.pageSize),
    //         //     searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    //         // let filter = req.query.filter;
    //         // const sort = filter.sort || 'ten_ASC';
    //         // filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
    //         // const page = await app.model.sdhTsInfoCaThiThiSinh.searchPageByMonThi(pagenumber, pagesize, filter, searchTerm);
    //         // const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //         // res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });
};