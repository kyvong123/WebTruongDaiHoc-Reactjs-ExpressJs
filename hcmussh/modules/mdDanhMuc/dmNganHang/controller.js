module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            5178: { title: 'Ngân hàng sinh viên', link: '/user/category/ngan-hang-sinh-vien' },
        },
    };
    app.permission.add(
        { name: 'dmNganHang:read', menu },
        { name: 'dmNganHang:write' },
        { name: 'dmNganHang:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDmNganHang', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'dmNganHang:read', 'dmNganHang:write', 'dmNganHang:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/category/ngan-hang-sinh-vien', app.permission.check('dmNganHang:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngan-hang-sinh-vien/page/:pageNumber/:pageSize', app.permission.orCheck('dmNganHang:read', 'student:login', 'student:pending'), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            let page = await app.model.dmNganHang.getPage(pageNumber, pageSize, condition, '*', 'ma');
            res.send({ page });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/ngan-hang-sinh-vien/all', app.permission.check('dmNganHang:read'), async (req, res) => {
        try {
            const item = await app.model.dmNganHang.getAll();
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/ngan-hang-sinh-vien/item/:ma', app.permission.orCheck('dmNganHang:read', 'student:login', 'student:pending', 'staff:login'), async (req, res) => {
        try {
            const item = await app.model.dmNganHang.get({ ma: req.params.ma });
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/ngan-hang-sinh-vien', app.permission.check('dmNganHang:write'), async (req, res) => {

        try {
            const checkTontai = await app.model.dmNganHang.get({ ma: req.body.item.ma });
            if (checkTontai) {
                throw ('Đã tồn tại ngân hàng trong danh mục!');
            }
            const item = await app.model.dmNganHang.create(req.body.item);
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/ngan-hang-sinh-vien', app.permission.check('dmNganHang:write'), async (req, res) => {
        try {
            let item = await app.model.dmNganHang.get({ ma: req.body.ma });

            if (!item) {
                throw ('Không tồn tại thông tin ngân hàng cần cập nhật!');
            }
            item = await app.model.dmNganHang.update({ ma: req.body.ma }, req.body.changes);
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/ngan-hang-sinh-vien', app.permission.check('dmNganHang:delete'), async (req, res) => {
        try {
            await app.model.dmNganHang.delete({ ma: req.body.ma });
            res.end();
        }
        catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/ngan-hang-sinh-vien/multiple', app.permission.check('dmNganHang:write'), async (req, res) => {
        try {
            if (!req.body || !req.body.listSuccess) throw ('Dữ liệu thông tin nhập vào không đây đủ!');
            const listSuccess = req.body.listSuccess;
            let items = [];
            await Promise.all(listSuccess.map(async temp => {
                let item = await app.model.dmNganHang.get({ ma: temp.ma });
                if (!item) {
                    item = await app.model.dmNganHang.create({ ma: temp.ma, ten: temp.ten, kichHoat: 1 });
                }
                else {
                    item = await app.model.dmNganHang.update({ ma: temp.ma }, { ten: temp.ten });
                }
                items.push(item);

            }));
            res.send({ item: items });

        } catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('DmNganHangData', (req, fields, files, params, done) =>
        app.permission.has(req, () => DmNganHangSinhVienImportData(files, done), done, 'dmNganHang:write')
    );

    const DmNganHangSinhVienImportData = async (files, done) => {
        if (files.DmNganHangData && files.DmNganHangData.length) {
            const srcPath = files.DmNganHangData[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                try {
                    app.fs.deleteFile(srcPath);
                    const worksheet = workbook.getWorksheet(1);
                    let index = 1;
                    const listSuccess = [];
                    while (true) {
                        index++;
                        const ma = worksheet.getCell('A' + index).value;
                        const ten = worksheet.getCell('B' + index).value;
                        if (!ma) break;
                        else if (!ten) continue;
                        else listSuccess.push({ ma, ten });
                    }
                    done({ listSuccess });
                } catch (error) {
                    app.consoleError(error);
                    done({ error });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    app.get('/api/danh-muc/ngan-hang-sinh-vien/download-template', app.permission.check('dmNganHang:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const wsNganHang = workBook.addWorksheet('Ngan_Hang_Template');
            wsNganHang.columns = [
                { header: 'Mã', key: 'ma', width: 15 },
                { header: 'Tên', key: 'ten', width: 30 },
            ];
            app.excel.attachment(workBook, res, 'Ngan_Hang_template.xlsx');
        } catch (error) {
            app.consoleError(req.url, req.method, error);
            res.send({ error });
        }
    });
};