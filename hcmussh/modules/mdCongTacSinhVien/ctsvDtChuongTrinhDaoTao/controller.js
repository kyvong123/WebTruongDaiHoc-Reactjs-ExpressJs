module.exports = app => {

    app.get('/api/ctsv/chuong-trinh-dao-tao/item/:id', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/chuong-trinh-dao-tao-theo-nganh/item', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const { maNganh, maChuyenNganh, lhdt, khoaDt } = req.query;
            const item = await app.model.dtKhungDaoTao.get({
                maNganh,
                chuyenNganh: maChuyenNganh != '' ? maChuyenNganh : null,
                loaiHinhDaoTao: lhdt,
                khoaSinhVien: khoaDt
            }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/chuong-trinh-dao-tao/ctdt-all/:loaiHinhDt/:khoaSinhVien', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtKhungDaoTao.getAll({
                statement: '(lower(MA_NGANH) LIKE :searchTerm OR LOWER(TEN_NGANH) LIKE :searchTerm) AND KHOA_SINH_VIEN = :khoaSinhVien AND LOAI_HINH_DAO_TAO = :loaiHinhDt',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                    khoaSinhVien: req.params.khoaSinhVien,
                    loaiHinhDt: req.params.loaiHinhDt
                }
            }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/chuong-trinh-dao-tao/ctdt-filter/:loaiHinhDt/:khoaSinhVien/:maNganh', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtKhungDaoTao.getAll({
                statement: '(lower(MA_NGANH) LIKE :searchTerm OR LOWER(TEN_NGANH) LIKE :searchTerm) AND KHOA_SINH_VIEN = :khoaSinhVien AND LOAI_HINH_DAO_TAO = :loaiHinhDt AND MA_NGANH = :maNganh',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                    khoaSinhVien: req.params.khoaSinhVien,
                    loaiHinhDt: req.params.loaiHinhDt,
                    maNganh: req.params.maNganh
                }
            }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });
};