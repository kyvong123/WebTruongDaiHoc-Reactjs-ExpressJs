const archiver = require('archiver');

module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5023: { title: 'Quản lý đăng ký MST', link: '/user/finance/tncn', icon: 'fa fa-tasks', color: '#000', groupIndex: 3, backgroundColor: '#FFA07A' } },
    };

    app.permission.add(
        { name: 'tcTncn:read', menu },
        { name: 'tcTncn:write' },
        { name: 'tcTncn:delete' },
        { name: 'tcTncn:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcTncn', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcTncn:read', 'tcTncn:write', 'tcTncn:delete', 'tcTncn:export');
        }
    });

    app.get('/user/finance/tncn', app.permission.check('tcTncn:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/tncn/page/:pageNumber/:pageSize', app.permission.check('tcTncn:read'), async (req, res) => {
        try {

            let pageCondition = `%${req.query.searchTerm || ''}%`;

            const page = await app.model.tcThueDangKy.getPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), { statement: null }, '*', 'ngayTao DESC');
            const { totalItem, pageSize, pageTotal, pageNumber, list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }
            });

        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/khtc/tncn', app.permission.check('tcTncn:write'), async (req, res) => {
        try {
            const { keys, changes } = req.body;
            if (!(keys && changes)) {
                throw 'Thông tin không đúng';
            }

            const item = await app.model.tcThueDangKy.get(keys);
            if (!item) {
                throw 'Thông tin không đúng';
            }

            const nguoiUpdate = req.session?.user?.email || '';
            const ngayUpdate = Date.now();

            const newItem = await app.model.tcThueDangKy.update(keys, { ...changes, nguoiUpdate, ngayUpdate });
            res.send({ newItem });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/tncn/tiep-nhan', app.permission.check('tcTncn:write'), async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                throw 'Thông tin không đúng';
            }

            const item = await app.model.tcThueDangKy.get({ id });
            if (!item) throw 'Không tồn tại yêu cầu đăng ký MST';

            if (item.trangThai != 'CHO_XAC_NHAN') throw 'Trạng thái yêu cầu đăng ký MST không hợp lệ';
            const nguoiUpdate = req.session?.user?.email || '';
            const ngayUpdate = Date.now();

            await app.model.tcThueDangKy.update({ id }, { trangThai: 'TIEP_NHAN', nguoiUpdate, ngayUpdate });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/tncn/xac-nhan', app.permission.check('tcTncn:write'), async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                throw 'Thông tin không đúng';
            }

            const item = await app.model.tcThueDangKy.get({ id });
            if (!item) throw 'Không tồn tại yêu cầu đăng ký MST';

            if (item.trangThai != 'TIEP_NHAN') throw 'Trạng thái yêu cầu đăng ký MST không hợp lệ';
            if (!item.maSoThue) throw 'Yêu cầu cập nhật MST trước khi xác thực hoàn tất!';
            const nguoiUpdate = req.session?.user?.email || '';
            const ngayUpdate = Date.now();

            await app.model.tcThueDangKy.update({ id }, { trangThai: 'HOAN_TAT', nguoiUpdate, ngayUpdate });
            await app.model.tchcCanBo.update({ shcc: item.shcc }, { maSoThue: item.maSoThue });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/tncn/delete', app.permission.check('tcTncn:delete'), async (req, res) => {
        try {
            const id = req.body.id || '';
            if (!id) {
                throw 'Thông tin không đúng';
            }

            const item = await app.model.tcThueDangKy.get({ id });
            if (!item) {
                throw 'Không tồn tại yêu cầu đăng ký MST';
            }

            const nguoiUpdate = req.session?.user?.email || '';
            const ngayUpdate = Date.now();
            await app.model.tcThueDangKy.update({ id }, { trangThai: 'HUY', ngayUpdate, nguoiUpdate });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/tncn/tai-minh-chung/:id', app.permission.check('tcTncn:read'), async (req, res) => {
        try {
            const id = req.params.id;
            const item = await app.model.tcThueDangKy.get({ id });
            const directoryPath = app.path.join(app.assetPath, item.pathFolder);
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=minhChungDangKy_${item.shcc}.zip`);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });
            archive.pipe(res);
            const files = app.fs.readdirSync(directoryPath, { withFileTypes: true });
            files.forEach((file, index) => {
                if (index == 1) throw 'Error Pending';
                const filePath = app.path.join(directoryPath, file.name);
                if (file.isFile()) {
                    const input = app.fs.createReadStream(filePath);
                    archive.append(input, { name: file.name });
                } else if (file.isDirectory()) {
                    archive.directory(filePath, file.name);
                }
            });
            archive.finalize();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};