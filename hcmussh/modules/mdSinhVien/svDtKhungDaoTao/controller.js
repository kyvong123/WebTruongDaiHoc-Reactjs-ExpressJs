module.exports = app => {
    app.get('/api/sv/chuong-trinh-dao-tao/item/:id', app.permission.check('student:login'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};