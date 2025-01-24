module.exports = app => {
    app.get('/api/ctsv/danh-sach-chuyen-nganh/all', app.permission.orCheck('manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                items = await app.model.dtChuyenNganh.getAll({ maNganh, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-chuyen-nganh', app.permission.orCheck('manageQuyetDinh:ctsv', 'student:login', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                item = await app.model.dtChuyenNganh.get({ ma: maNganh });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};