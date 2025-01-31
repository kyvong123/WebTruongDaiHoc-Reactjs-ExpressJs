module.exports = app => {

    app.get('/api/ctsv/quoc-gia/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const statement = ['maCode', 'shortenName', 'tenKhac', 'tenQuocGia', 'country'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
            if (req.query.condition) {
                condition = {
                    statement,
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.dmQuocGia.getPage(pageNumber, pageSize, condition, '*', 'maCode');
            if (page.list && page.list.length) {
                if (page.list.some(item => item.maCode == 'VN')) {
                    let vn = page.list.find(item => item.maCode == 'VN');
                    page.list.filter(item => item.maCode != 'VN');
                    page.list.unshift(vn);
                } else {
                    let vn = await app.model.dmQuocGia.get({ maCode: 'VN' });
                    page.list.unshift(vn);
                }
            }
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/quoc-gia/item/:maCode', app.permission.check('user:login'), (req, res) => {
        app.model.dmQuocGia.get({ maCode: req.params.maCode }, (error, item) => res.send({ error, item }));
    });
};