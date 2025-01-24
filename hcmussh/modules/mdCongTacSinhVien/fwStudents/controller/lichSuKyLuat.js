module.exports = app => {
    app.get('/api/ctsv/student/ky-luat', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const mssv = req.query.mssv;
            const items = await app.model.svQtKyLuat.getByStudent(mssv).then(({ rows }) => rows);
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};