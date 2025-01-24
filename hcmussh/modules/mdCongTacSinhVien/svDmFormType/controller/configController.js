module.exports = app => {
    app.put('/user/ctsv/category-forms/cau-hinh', app.permission.check('svDmFormType:read'), async (req, res) => {
        try {
            const { changes: { listTinhTrang } } = req.body;
            let items = [];
            if (listTinhTrang && Array.isArray(listTinhTrang)) {
                items = await Promise.all(listTinhTrang.map(({ ma, hienThiBieuMau }) => app.model.dmTinhTrangSinhVien.update({ ma }, { hienThiBieuMau })));
            }
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};