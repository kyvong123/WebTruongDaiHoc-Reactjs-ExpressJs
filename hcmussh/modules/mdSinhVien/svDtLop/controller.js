module.exports = app => {
    app.get('/api/sv/danh-sach-lop/item/:maLop', app.permission.check('student:login'), async (req, res) => {
        try {
            const item = await app.model.dtLop.get({ maLop: req.params.maLop }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};