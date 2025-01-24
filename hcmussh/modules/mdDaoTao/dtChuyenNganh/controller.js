module.exports = app => {
    app.get('/api/dt/chuyen-nganh/all', app.permission.orCheck('dtNganhDaoTao:read', 'staff:login'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtChuyenNganh.getAll({
                statement: '(lower(MA) LIKE :searchTerm OR lower(ten) LIKE :searchTerm) AND (:maNganh IS NULL OR maNganh = :maNganh) AND (:kichHoat IS NULL OR kichHoat = 1)',
                parameter: {
                    searchTerm: `%${searchTerm}%`,
                    maNganh: req.query.maNganh,
                    kichHoat: req.query.kichHoat
                }
            }, '*', 'maNganh');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/danh-sach-chuyen-nganh/:manganh', app.permission.check('dtNganhDaoTao:read'), async (req, res) => {
        try {
            const items = await app.model.dtChuyenNganh.getAll({ maNganh: req.params.manganh }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/danh-sach-chuyen-nganh/item/:ma', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const item = await app.model.dtChuyenNganh.get({ ma: req.params.ma }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};