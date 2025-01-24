module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6114: { title: 'Danh mục trường đại học', icon: 'fa-university', link: '/user/ctsv/dm-dai-hoc', groupIndex: 3, parentKey: 6150 }
        }
    };

    app.permission.add(
        { name: 'ctsvDaiHoc:manage', menu: menuCtsv },
        'ctsvDaiHoc:write',
        'ctsvDaiHoc:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvDaiHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvDaiHoc:manage', 'ctsvDaiHoc:write', 'ctsvDaiHoc:delete');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/dm-dai-hoc', app.permission.check('ctsvDaiHoc:manage'), app.templates.admin);

    // API ========================================================================================


    app.get('/api/ctsv/dm-dai-hoc/active/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const { searchTerm = '' } = req.query,
                condition = {
                    statement: 'kichHoat = 1 AND (lower(TEN_TRUONG) LIKE :searchTerm)',
                    parameter: {
                        searchTerm: `%${searchTerm.toLowerCase().trim()}%`
                    }
                },
                items = await app.model.dmDaiHoc.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-dai-hoc/all', app.permission.check('ctsvDaiHoc:manage'), async (req, res) => {
        try {
            const items = await app.model.dmDaiHoc.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-dai-hoc/page', app.permission.check('ctsvDaiHoc:manage'), async (req, res) => {
        try {
            const { pageNumber, pageSize, pageCondition } = req.query;
            const page = await app.model.dmDaiHoc.getPage(parseInt(pageNumber), parseInt(pageSize), pageCondition);
            res.send({ page });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-dai-hoc/item', app.permission.check('user:login'), async (req, res) => {
        try {
            const { ma } = req.query,
                item = await app.model.dmDaiHoc.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/ctsv/dm-dai-hoc/export-excel', app.permission.check('user:login'), async (req, res) => {
        try {
            const list = await app.model.dmDaiHoc.getAll();
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Danh mục Đại Học');
            
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'TÊN TRƯỜNG', key: 'tenTruong', width: 100 },
                
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(1).font = { name: 'Times New Roman' };
                let iTruong = 1;
            list.forEach((item) => {
                const row = {
                    tenTruong: item.tenTruong,
                };
                ws.addRow({stt: iTruong++, ...row});
            });
            const fileName = 'DM_DAI_HOC.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-dai-hoc', app.permission.check('ctsvDaiHoc:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.dmDaiHoc.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-dai-hoc', app.permission.check('ctsvDaiHoc:manage'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.dmDaiHoc.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-dai-hoc', app.permission.check('ctsvDaiHoc:manage'), async (req, res) => {
        try {
            const { ma } = req.body;
            await app.model.dmDaiHoc.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};