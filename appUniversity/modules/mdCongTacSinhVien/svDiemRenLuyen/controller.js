module.exports = app => {
    app.get('/api/ctsv/diem-ren-luyen', app.permission.orCheck('student:login', 'manageForm:ctsv'), async (req, res) => {
        try {
            const { filter = {} } = req.query;
            const { rows: [item] } = await app.model.svDiemRenLuyen.groupByNamHoc(app.utils.stringify(filter));
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/diem-ren-luyen/nam-hoc', app.permission.orCheck('student:login', 'manageForm:ctsv'), async (req, res) => {
        try {
            const { mssv } = req.query;
            const { rows: items } = await app.model.svDiemRenLuyen.groupByNamHoc(app.utils.stringify({ mssv }));
            res.send({ items: items.map(item => ({ namHoc: item.namHoc })) });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // For mobile app
    app.get('/api/ctsv/diem-ren-luyen/all', app.permission.orCheck('student:login', 'manageForm:ctsv'), async (req, res) => {
        try {
            const { mssv } = req.query;
            const { rows: items } = await app.model.svDiemRenLuyen.groupByNamHoc(app.utils.stringify({ mssv }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};