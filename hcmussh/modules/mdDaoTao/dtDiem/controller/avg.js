module.exports = app => {
    app.get('/api/dt/diem/avg/latest', app.permission.check('student:login'), async (req, res) => {
        try {
            const { user } = req.session;
            let items = await app.model.dtDiemTrungBinh.getAll({ mssv: user.mssv }, '*', 'namHoc ASC, hocKy ASC');
            items = items.filter(item => Number(item.diemTrungBinh)).map(item => ({
                hocKy: `${item.namHoc.split(' - ')[0].substring(2, 4)}${item.hocKy}`,
                diemTrungBinh: Number(item.diemTrungBinh).toFixed(2),
                diemTrungBinhTichLuy: Number(item.diemTrungBinhTichLuy).toFixed(2),
            }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};