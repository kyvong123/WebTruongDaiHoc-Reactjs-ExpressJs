module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/danh-sach-nganh/page/:pageNumber/:pageSize', app.permission.orCheck('ctsvNganhDaoTao:read', 'dtQuanLyHocPhan:manage', 'student:shcd-manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                filter = req.query.filter ? req.query.filter : '',
                searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '';
            filter.kichHoat = 1;
            const page = await app.model.dtNganhDaoTao.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list, dsChuyenNganh } = page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list }, dsChuyenNganh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-nganh/all', app.permission.orCheck('ctsvNganhDaoTao:read', 'tccbLop:manage', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const items = await app.model.dtNganhDaoTao.getAll({}, 'maNganh, tenNganh, khoa');
            const nganhHeDaoTao = await app.model.dtNganhHeDaoTao.getAll({
                statement: 'nganhDaoTao in (:listNganh)',
                parameter: {
                    listNganh: items.length ? items.map(item => item.maNganh) : ['-1']
                }
            }, '*');
            for (let i = 0; i < items.length; i++) {
                items[i].heDaoTao = nganhHeDaoTao.filter(nganh => nganh.nganhDaoTao == items[i].maNganh).map(nganh => nganh.heDaoTao);
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-nganh', app.permission.orCheck('ctsvNganhDaoTao:read', 'tccbLop:manage', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                item = await app.model.dtNganhDaoTao.get({ maNganh });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-nganh/count-student/all', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            let { searchTerm = '', filter = {} } = req.query;
            const { rows: items } = await app.model.dtNganhDaoTao.searchAllCount(searchTerm, app.utils.stringify(filter));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-nganh/count-student/item', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const { maNganh, khoaSinhVien, listHeDaoTao } = req.query;
            const { rows: [item] } = await app.model.dtNganhDaoTao.searchAllCount('', app.utils.stringify({ listNganh: maNganh, khoaSinhVien, listHeDaoTao }));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};