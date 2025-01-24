module.exports = app => {
    app.get('/api/sdh/ts/dm-truong/item', async (req, res) => {
        const ten = req.query.ten;
        const item = await app.model.sdhTsDmTruong.get({ ten }) || { ma: 'Trường khác', ten };
        res.send({ item });
    });
    app.get('/api/sdh/ts/dm-truong/all', (req, res) => {
        const searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '';
        const condition = {
            statement: ' lower(ten) LIKE :searchTerm ',
            parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
        };

        app.model.sdhTsDmTruong.getAll(condition, '*', 'ten', (error, items) => res.send({ error, items }));
    });
};