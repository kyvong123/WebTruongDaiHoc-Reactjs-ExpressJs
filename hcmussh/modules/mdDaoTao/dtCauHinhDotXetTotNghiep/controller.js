module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7066: {
                title: 'Cấu hình đợt xét tốt nghiệp', link: '/user/dao-tao/graduation/setting', groupIndex: 1, parentKey: 7080,
                icon: 'fa-cogs', backgroundColor: '#F7C04A'
            }
        }
    };
    app.permission.add(
        { name: 'dtCauHinhDotXetTotNghiep:manage', menu },
        { name: 'dtCauHinhDotXetTotNghiep:write' },
        { name: 'dtCauHinhDotXetTotNghiep:delete' },
        { name: 'dtDanhSachXetTotNghiep:manage' },
    );

    app.get('/user/dao-tao/graduation/setting', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), app.templates.admin);
    app.get('/user/dao-tao/graduation/setting/edit/:id', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), app.templates.admin);
    app.get('/user/dao-tao/graduation/setting/detail', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), app.templates.admin);
    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/page/:pageNumber/:pageSize', app.permission.orCheck('dtCauHinhDotXetTotNghiep:manage', 'ctsvThongKeTotNghiep:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            let page = await app.model.dtCauHinhDotXetTotNghiep.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/all', app.permission.orCheck('dtCauHinhDotXetTotNghiep:manage', 'student:login'), async (req, res) => {
        try {
            const { searchTerm } = req.query;

            let data = await app.model.dtCauHinhDotXetTotNghiep.getAll({}, '*', 'ngayBatDau DESC');

            if (searchTerm) data = data.filter(item => `NH${item.namHoc} HK${item.hocKy}: ${item.ten}`.toLowerCase().includes(searchTerm.toLowerCase()));

            res.send({ data: data });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/item/:id', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.dtCauHinhDotXetTotNghiep.get({ id });
            res.send({ data: data });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/count', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), async (req, res) => {
        try {
            let id = req.query.id;
            const length = await app.model.dtDssvTrongDotDkhp.count({ idDot: id, kichHoat: 1 });
            res.send({ count: length.rows[0]['COUNT(*)'] });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/cau-hinh-dot-xet-tot-nghiep', app.permission.check('dtCauHinhDotXetTotNghiep:write'), async (req, res) => {
        try {
            let data = req.body.item;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();

            await app.model.dtCauHinhDotXetTotNghiep.create(data);

            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });


    app.put('/api/dt/cau-hinh-dot-xet-tot-nghiep', app.permission.check('dtCauHinhDotXetTotNghiep:write'), async (req, res) => {
        try {
            let id = req.body.id,
                changes = req.body.changes;

            changes.modifier = req.session.user.email;
            changes.timeModified = Date.now();

            await app.model.dtCauHinhDotXetTotNghiep.update({ id }, changes);

            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/cau-hinh-dot-xet-tot-nghiep', app.permission.check('dtCauHinhDotXetTotNghiep:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.dtCauHinhDotXetTotNghiep.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/setup', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), async (req, res) => {
        try {
            const { data } = req.query,
                { listSv, idDot } = data;

            await app.model.dtDanhSachXetTotNghiep.setUpTotNghiep(listSv, idDot, req.session.user.email);

            res.send({});
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/cau-hinh-dot-xet-tot-nghiep/get-list-sinh-vien', app.permission.check('dtCauHinhDotXetTotNghiep:manage'), async (req, res) => {
        try {
            const ma = req.query.ma,
                items = await app.model.fwStudent.getAll({ lop: ma, tinhTrang: 1 }, 'mssv, ho, ten', 'mssv');
            res.send({ items });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
};
