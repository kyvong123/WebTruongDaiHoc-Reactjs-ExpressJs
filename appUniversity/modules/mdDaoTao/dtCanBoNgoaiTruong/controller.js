module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7300: {
                title: 'Quản lý cán bộ', groupIndex: 1, icon: 'fa-user',
                link: '/user/dao-tao/can-bo',
            }
        }
    };
    app.permission.add(
        { name: 'dtCanBoNgoaiTruong:manage', menu },
        'dtCanBoNgoaiTruong:export',
        'dtCanBoNgoaiTruong:read',
        'dtCanBoNgoaiTruong:write',
        'dtCanBoNgoaiTruong:delete',
    );

    app.permissionHooks.add('staff', 'addRoleDtCanBoNgoaiTruong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCanBoNgoaiTruong:manage', 'dtCanBoNgoaiTruong:read', 'dtCanBoNgoaiTruong:write', 'dtCanBoNgoaiTruong:delete', 'dtCanBoNgoaiTruong:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/can-bo', app.permission.check('dtCanBoNgoaiTruong:manage'), app.templates.admin);

    // APIs -----------------------------
    app.get('/api/dt/staff/page/:pageNumber/:pageSize', app.permission.check('dtCanBoNgoaiTruong:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let time = req.query.timeCondition || new Date().getTime();
        const filter = JSON.stringify({ ...req.query.filter, time });
        app.model.dtCanBoNgoaiTruong.canBoSearchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });


    app.get('/api/dt/can-bo-ngoai-truong', app.permission.check('dtCanBoNgoaiTruong:manage'), async (req, res) => {
        try {
            const items = await app.model.dtCanBoNgoaiTruong.getData(app.utils.stringify(req.query.filter));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/can-bo/item/:shcc', app.permission.orCheck('dtCanBoNgoaiTruong:manage', 'sdhTuyenSinhLichThi:manage'), async (req, res) => {
        try {
            let item = await app.model.dtCanBoNgoaiTruong.get({ shcc: req.params.shcc });
            if (!item) {
                item = await app.model.tchcCanBo.get({ shcc: req.params.shcc }, 'ho,ten,shcc');
            }
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/can-bo/all', app.permission.orCheck('dtCanBoNgoaiTruong:manage', 'sdhTuyenSinhLichThi:manage'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const cbtt = await app.model.tchcCanBo.getAll({
                statement: '(lower(ho) LIKE :searchTerm OR LOWER(ten) LIKE :searchTerm OR LOWER(shcc) LIKE :searchTerm)',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                }
            }, 'ho,ten,shcc');
            const cbnt = await app.model.dtCanBoNgoaiTruong.getAll({
                statement: '(lower(ho) LIKE :searchTerm OR LOWER(ten) LIKE :searchTerm OR LOWER(shcc) LIKE :searchTerm)',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                }
            }, 'ho,ten,shcc');
            res.send({ items: cbtt.concat(cbnt) });
            // res.send({ items: cbnt });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/dt/can-bo-ngoai-truong', app.permission.check('dtCanBoNgoaiTruong:write'), async (req, res) => {
        try {
            let { shcc, changes } = req.body;
            if (!Number(changes.isHasEmail) && changes.email) {
                const existEmail = await app.model.fwUser.get({ email: changes.email });
                if (existEmail) throw { message: 'Email người dùng đã tồn tại trong hệ thống!' };
                app.model.fwUser.create({
                    email: changes.email,
                    active: 1,
                    isStaff: 1,
                    firstName: changes.ho,
                    lastName: changes.ten,
                    shcc: changes.shcc
                });
            }
            const item = await app.model.dtCanBoNgoaiTruong.update({ shcc: shcc }, changes);
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/dt/can-bo-ngoai-truong', app.permission.check('dtCanBoNgoaiTruong:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const existNT = await app.model.dtCanBoNgoaiTruong.get({ shcc: data.shcc });
            if (existNT) throw { message: 'Số hiệu cán bộ đã tồn tại trong danh sách cán bộ ngoài trường!' };
            const existTT = await app.model.tchcCanBo.get({ shcc: data.shcc });
            if (existTT) throw { message: 'Số hiệu cán bộ đã tồn tại trong danh sách cán bộ trong trường!' };

            if (data.email) {
                const existEmail = await app.model.fwUser.get({ email: data.email });
                if (existEmail) throw { message: 'Email người dùng đã tồn tại trong hệ thống!' };
                app.model.fwUser.create({
                    email: data.email,
                    active: 1,
                    isStaff: 1,
                    firstName: data.ho,
                    lastName: data.ten,
                    shcc: data.shcc
                });
            }
            const item = await app.model.dtCanBoNgoaiTruong.create(data);
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/can-bo-ngoai-truong', app.permission.check('dtCanBoNgoaiTruong:delete'), async (req, res) => {
        try {
            let [isNhapDiem, isGiangDay] = await Promise.all([
                app.model.dtAssignRoleNhapDiem.get({ shcc: req.body.shcc }),
                app.model.dtThoiKhoaBieuGiangVien.get({ giangVien: req.body.shcc }),
            ]);

            if (isNhapDiem || isGiangDay) throw { message: 'Cán bộ đang được gán nhập điểm và giảng dạy!' };

            let item = await app.model.dtCanBoNgoaiTruong.delete({ shcc: req.body.shcc });
            app.model.fwUser.delete({ shcc: req.body.shcc });
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/dt/can-bo-ngoai-truong/export-can-bo', app.permission.check('dtCanBoNgoaiTruong:export'), async (req, res) => {
        try {
            const data = await app.model.dtCanBoNgoaiTruong.canBoSearchPage(1, 5000, app.utils.stringify({}), '');
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Sheet');

            const defaultColumns = [
                { header: 'Số hiệu cán bộ', key: 'shcc', width: 20 },
                { header: 'Họ và tên', key: 'hoTen', width: 20 },
                { header: 'Ngạch', key: 'tenChucDanhNgheNghiep', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'SDT', key: 'phone', width: 25 },
                { header: 'Trình độ', key: 'trinhDo', width: 25 },
                { header: 'Chức danh', key: 'hocHam', width: 25 },
                { header: 'Đơn vị', key: 'tenDonVi', width: 25 }
            ];
            ws.columns = defaultColumns;
            data.rows.forEach((item, index) => {
                let rowData = { ...item };
                ws.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'CanBoTrongTruong.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/can-bo-ngoai-truong/export', app.permission.check('dtCanBoNgoaiTruong:export'), async (req, res) => {
        try {
            const data = await app.model.dtCanBoNgoaiTruong.getData(app.utils.stringify({}));
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Sheet');

            const defaultColumns = [
                { header: 'Số hiệu cán bộ', key: 'shcc', width: 20 },
                { header: 'Họ và tên', key: 'hoTen', width: 20 },
                { header: 'Ngạch', key: 'tenChucDanhNgheNghiep', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'SDT', key: 'phone', width: 25 },
                { header: 'Trình độ', key: 'hocVi', width: 25 },
                { header: 'Chức danh', key: 'hocHam', width: 25 },
                { header: 'Đơn vị', key: 'tenDonVi', width: 25 }
            ];
            ws.columns = defaultColumns;
            data.rows.forEach((item, index) => {
                let rowData = { ...item };
                ws.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'CanBoNgoaiTruong.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};