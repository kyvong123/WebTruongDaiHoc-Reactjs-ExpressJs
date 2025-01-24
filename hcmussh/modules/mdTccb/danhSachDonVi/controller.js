module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3050: { title: 'Danh sách đơn vị', link: '/user/tccb/ds-don-vi', icon: 'fa-list', backgroundColor: '#4297ff', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbDanhSachDonVi:read', menu },
        { name: 'tccbDanhSachDonVi:write' },
        { name: 'tccbDanhSachDonVi:delete' },
        { name: 'tccbDanhSachDonVi:export' }
    );

    app.get('/user/tccb/ds-don-vi', app.permission.check('tccbDanhSachDonVi:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDanhSachDonVi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbDanhSachDonVi:read', 'tccbDanhSachDonVi:write', 'tccbDanhSachDonVi:export', 'dmBacDonVi:read', 'dmBacDonVi:write', 'dmBacDonVi:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // TCCB_DANH_SACH_DON_VI
    //---------------------------
    app.get('/api/tccb/ds-don-vi/page/:pageNumber/:pageSize', app.permission.check('tccbDanhSachDonVi:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhSachDonVi.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            app.tccbSaveCRUD(req.session.user.email, 'R', 'Danh sách đơn vị');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/ds-don-vi/download-excel', app.permission.check('tccbDanhSachDonVi:export'), async (req, res) => {
        try {
            const filter = req.query.filter || '';
            const searchTerm = req.query.searchTerm || '';
            const result = await app.model.tccbDanhSachDonVi.downloadExcel(filter, searchTerm);
            app.tccbSaveCRUD(req.session.user.email, 'R', 'Danh sách đơn vị');
            const list = result.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DSDV');
            ws.columns = [
                { header: 'Số thứ tự', key: 'stt' },
                { header: 'Tên đơn vị', key: 'ten' },
                { header: 'Loại đơn vị', key: 'loai' },
                { header: 'Tên viết tắt', key: 'vietTat' },
                { header: 'Cấp bậc đơn vị', key: 'capBac' },
                { header: 'Ngày thành lập', key: 'ngayThanhLap' },
                { header: 'Ghi chú', key: 'ghiChu' },
                { header: 'Đơn vị truyền thông', key: 'dvTt' },
            ];
            list.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    ten: item.ten,
                    loai: item.loai,
                    vietTat: item.vietTat,
                    capBac: item.capBac,
                    ngayThanhLap: item.ngayThanhLap ? app.date.dateTimeFormat(new Date(parseInt(item.ngayThanhLap)), 'dd/mm/yyyy') : '',
                    ghiChu: item.ghiChu,
                    dvTt: item.dvTt,
                });
            });
            let fileName = 'DANH_SACH_DON_VI.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/ds-don-vi', app.permission.check('tccbDanhSachDonVi:write'), async (req, res) => {
        try {
            const item = await app.model.tccbDanhSachDonVi.create(req.body.data);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Danh sách đơn vị');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/ds-don-vi', app.permission.check('tccbDanhSachDonVi:write'), async (req, res) => {
        try {
            const item = await app.model.tccbDanhSachDonVi.update({ id: req.body.id }, { ...req.body.changes, modifier: req.session.user.email, lastModified: Date.now() });
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Danh sách đơn vị');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/ds-don-vi', app.permission.check('tccbDanhSachDonVi:delete'), async (req, res) => {
        try {
            await app.model.tccbDanhSachDonVi.delete({ id: req.body.id });
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Danh sách đơn vị');
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};