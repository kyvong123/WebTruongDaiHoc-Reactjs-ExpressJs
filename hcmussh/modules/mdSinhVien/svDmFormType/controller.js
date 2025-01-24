module.exports = app => {
    const PERMISSION = app.isDebug ? 'student:login' : 'student:login';

    app.get('/api/sv/form-type/all', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            const { kieuForm, namHoc } = req.query;
            const { khoaSV: khoaSinhVien, loaiHinhDaoTao: heDaoTao } = req.session.user.data ? req.session.user.data : { khoaSV: '', loaiHinhDaoTao: ''};
            const items = await app.model.svDmFormType.getAll({
                statement: 'kieuForm = :kieuForm AND namHoc = :namHoc AND kichHoat = 1 AND (loaiHinhDaoTao IS NULL OR (loaiHinhDaoTao like :loaiHinhDaoTao)) AND (khoaSinhVien IS NULL OR (khoaSinhVien like :khoaSinhVien))',
                parameter: {
                    kieuForm, namHoc, loaiHinhDaoTao: `%${heDaoTao}%`, khoaSinhVien: `%${khoaSinhVien}%`
                }
            });
            const condition = items.length > 0 ? {
                statement: 'maForm in (:listMaForm)',
                parameter: { listMaForm: items.map(item => item.ma) }
            } : {};
            const customParamList = await app.model.svFormCustom.getAll(condition, '*', 'id');
            items.map(item => {
                item.customParam = customParamList.filter(param => param.maForm == item.ma);
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/form-type/item', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            const { ma } = req.query;
            const item = await app.model.svDmFormType.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};