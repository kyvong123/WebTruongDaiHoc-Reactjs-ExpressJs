module.exports = app => {
    app.get('/api/tccb/settings/schedule-settings', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            const result = {};
            result.currentSemester = await app.model.dtSemester.getCurrent();
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });
};