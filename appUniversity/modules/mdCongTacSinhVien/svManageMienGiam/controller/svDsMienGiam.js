module.exports = app => {
    app.get('/api/ctsv/ds-mien-giam/page/:pageNumber/:pageSize', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter || {};
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, totalactive: totalActive, timeline, rows: list } = await app.model.svDsMienGiam.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter)),
                summary = { totalItem, totalActive, };
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: list }, timeline, summary });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/ds-mien-giam/active', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const { sqd } = req.query;
            const { rows: items } = await app.model.svDsMienGiam.getBySqd(sqd);
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/ds-mien-giam/hoan', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const { condition, changes } = req.body;
            const { email } = req.session.user;
            const now = Date.now();
            let item = null;
            if (changes.isHoan) {
                if (changes.isHoan == 1) {
                    item = await app.model.svDsMienGiamHoan.create({ ...condition, timeStart: now, staffHandle: email, lyDo: changes.lyDo });
                } else {
                    item = await app.model.svDsMienGiamHoan.update({
                        ...condition, timeEnd: null
                    }, { timeEnd: now, staffHandle: email });
                }
            }
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/ds-mien-giam/update-end-date', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const { mssv, qdId, changes } = req.body;
            const item = await app.model.svDsMienGiam.update({ mssv, qdId }, { timeEnd: changes.timeEnd });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};
