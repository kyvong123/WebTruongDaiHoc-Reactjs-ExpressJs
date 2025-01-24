module.exports = app => {
    app.get('/api/sv/settings/schedule-settings', app.permission.orCheck('student:login', 'staff:form-teacher'), async (req, res) => {
        try {
            const result = {};
            result.currentSemester = await app.model.dtSemester.getCurrent();
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });
};