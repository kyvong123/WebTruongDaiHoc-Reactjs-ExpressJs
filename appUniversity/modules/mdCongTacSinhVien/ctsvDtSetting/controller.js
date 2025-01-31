module.exports = app => {
    app.get('/api/ctsv/settings/schedule-settings', app.permission.check('user:login'), async (req, res) => {
        try {
            const result = {};
            result.currentSemester = await app.model.dtSemester.getCurrent();
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/semester/item', app.permission.check('user:login'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query;
            const semester = await app.model.dtSemester.get({ namHoc, hocKy });
            res.send({ semester });
        } catch (error) {
            res.send({ error });
        }
    });
};