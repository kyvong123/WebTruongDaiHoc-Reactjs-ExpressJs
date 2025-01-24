module.exports = app => {
    app.get('/api/sv/danh-sach-nganh', app.permission.check('student:login'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                item = await app.model.dtNganhDaoTao.get({ maNganh });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};