module.exports = app => {

    const MA_CTSV = '32';

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6142: { title: 'Quản lý khen thưởng', icon: 'fa-gift', link: '/user/ctsv/khen-thuong', groupIndex: 2, backgroundColor: '#36A8CA' }
        }
    };

    app.permission.add(
        { name: 'ctsvKhenThuong:read', menu: menuCtsv },
        'ctsvKhenThuong:write',
        'ctsvKhenThuong:export',
        'ctsvKhenThuong:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvKhenThuong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_CTSV) {
            app.permissionHooks.pushUserPermission(user, 'ctsvKhenThuong:read', 'ctsvKhenThuong:write', 'ctsvKhenThuong:export');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/khen-thuong', app.permission.check('ctsvKhenThuong:read'), app.templates.admin);
    app.get('/user/ctsv/khen-thuong/group/:loaiDoiTuong/:maDoiTuong', app.permission.check('ctsvKhenThuong:read'), app.templates.admin);

    // API ====================================================================================================
    app.get('/api/ctsv/khen-thuong/all', app.permission.check('ctsvKhenThuong:read'), async (req, res) => {
        try {
            const items = await app.model.svKhenThuong.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/khen-thuong/page/:pageNumber/:pageSize', app.permission.check('ctsvKhenThuong:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            const { pageCondition, filter } = req.query;
            const _page = await app.model.svKhenThuong.searchPage(_pageNumber, _pageSize, pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/khen-thuong/group/page/:pageNumber/:pageSize', app.permission.check('ctsvKhenThuong:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            const pageCondition = req.query.pageCondition || '';
            const _page = await app.model.svKhenThuong.groupPage(_pageNumber, _pageSize, pageCondition);
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/khen-thuong/item', app.permission.check('ctsvKhenThuong:read'), async (req, res) => {
        try {
            const { id } = req.query;
            const [item, { rows: danhSach }] = await Promise.all([
                await app.model.svKhenThuong.get({ id }),
                app.model.svKhenThuongDanhSach.getList(id),
            ]);
            res.send({ item, danhSach });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/khen-thuong/', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { data } = req.body;
            const { soQd } = data;
            const [dataKhenThuong, dataSoCongVan] = await Promise.all([
                app.model.svKhenThuong.get({ soQd }),
                app.model.hcthSoDangKy.get({ id: soQd })
            ]);
            if (dataKhenThuong) throw `Đã tồn tại quyết định có số ${dataSoCongVan.soCongVan}`;
            data.staffHandle = req.session.user.email;
            data.timeHandle = Date.now();
            let itemCvd;
            if (dataSoCongVan?.suDung == 0) {
                const { soQd: soQuyetDinh, timeHandle: handleTime, ngayKy } = data;
                itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh({
                    soQuyetDinh, handleTime, ngayKy, tenForm: 'QD_Khen_Thuong'
                }, user);
            }
            const [item] = await Promise.all([
                app.model.svKhenThuong.create({ ...data, idCvd: itemCvd?.id }),
                app.model.hcthSoDangKy.update({ id: data.soQd }, { suDung: 1 })
            ]);

            if ('danhSach' in data) {
                app.model.svKhenThuongDanhSach.updateDanhSach(item.id, data.danhSach);
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/khen-thuong/', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            changes.staffHandle = req.session.user.email;
            changes.timeHandle = Date.now();
            const item = await app.model.svKhenThuong.update({ id }, changes);
            if ('danhSach' in changes) {
                app.model.svKhenThuongDanhSach.updateDanhSach(item.id, changes.danhSach);
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/khen-thuong/', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const { id } = req.body;
            const { soQd } = await app.model.svKhenThuong.get({ id });
            await Promise.all([
                app.model.hcthSoDangKy.update({ id: soQd }, { suDung: 0 }),
                app.model.svKhenThuong.delete({ id })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/khen-thuong/import/template', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const workBook = app.excel.create(),
                dmThanhTich = await app.model.svKhenThuongThanhTich.getAll();

            const ws = workBook.addWorksheet('SV_KHEN_THUONG_Template');
            ws.columns = [
                { header: 'MSSV', width: 15 },
                { header: 'MÃ THÀNH TÍCH', width: 15 },
                { header: 'NĂM ĐẠT ĐƯỢC', width: 15 },
            ];

            const wsThanhTich = workBook.addWorksheet('DM_THANH_TICH');
            wsThanhTich.columns = [
                { header: 'ID', key: 'id', width: 15 },
                { header: 'TÊN', key: 'ten', width: 15 }
            ];
            dmThanhTich.forEach(thanhTich => wsThanhTich.addRow(thanhTich));

            app.excel.attachment(workBook, res, 'SV_KHEN_THUONG_Template.xlsx');
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('ctsvUploadKhenThuong', (req, fields, files, params, done) =>
        app.permission.has(req, () => ctsvKhenThuongImport(req, fields, files, params, done), done, 'ctsvKhenThuong:write'));

    const ctsvKhenThuongImport = async (req, fields, files, params, done) => {
        if (files.ctsvUploadKhenThuong && files.ctsvUploadKhenThuong.length && files.ctsvUploadKhenThuong[0].path) {
            const srcPath = files.ctsvUploadKhenThuong[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                const worksheet = workbook.worksheets[0];
                if (worksheet) {
                    // Khai bao bien
                    const preItems = [];
                    const items = [];
                    const failed = [];
                    let listSv = [];
                    let listLop = [];

                    // Lấy dữ liệu hệ thống
                    const dmThanhTich = await app.model.svKhenThuongThanhTich.getAll();

                    worksheet.eachRow((row, rowNumber) => {
                        try {
                            if (rowNumber == 1) return; //Skip header row
                            const [, loaiDoiTuong, mssv, maLop, maThanhTich, namHoc, ghiChu] = row.values;
                            if (!dmThanhTich.some(thanhTich => thanhTich.id == maThanhTich)) throw { rowNumber, color: 'danger', message: `Không tìm thấy mã thành tích ${maThanhTich}` };
                            if (loaiDoiTuong == 'CN' && mssv) listSv.push(mssv.toString());
                            if (loaiDoiTuong == 'TT' && maLop) listSv.push(maLop.toString());
                            const item = { loaiDoiTuong, mssv, maLop, maThanhTich, namHoc, ghiChu, rowNumber };
                            preItems.push(item);
                        } catch (error) {
                            error.rowNumber || console.error(error);
                            failed.push(error);
                        }
                    });
                    // Kiểm tra sự tồn tại của sinh viên và lớp
                    listSv = listSv.length ? await app.model.fwStudent.getAll({
                        statement: 'mssv in (:listSv)',
                        parameter: { listSv }
                    }) : [];
                    listSv = listSv.groupBy('mssv');

                    listLop = listLop.length ? await app.model.dtLop.getAll({
                        statement: 'mssv in (:listLop)',
                        parameter: { listLop }
                    }) : [];
                    listLop = listLop.groupBy('maLop');

                    preItems.forEach(item => {
                        if (item.loaiDoiTuong == 'CN' && listSv[item.mssv] == null) failed.push({ rowNumber: item.rowNumber, color: 'danger', message: `Không tìm thấy MSSV ${item.mssv || ''}!` });
                        else if (item.loaiDoiTuong == 'TT' && listLop[item.maLop] == null) failed.push({ rowNumber: item.rowNumber, color: 'danger', message: `Không tìm thấy mã lớp ${item.maLop || ''}!` });
                        else items.push(item);
                    });

                    const now = Date.now();
                    const user = req.session.user?.email;
                    await Promise.all(items.map(item => app.model.svKhenThuong.create({ ...item, staffHandle: user, timeHandle: now })));
                    done({ success: items.length, failed: failed.sort((a, b) => parseInt(a.rowNumber) - parseInt(b.rowNumber)) });
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    app.uploadHooks.add('ctsvUploadDsSinhVien', (req, fields, files, params, done) =>
        app.permission.has(req, () => ctsvKhenThuongUpDsSinhVien(req, fields, files, params, done), done, 'ctsvKhenThuong:write'));

    const ctsvKhenThuongUpDsSinhVien = async (req, fields, files, params, done) => {
        try {
            if (files.ctsvUploadDsSinhVien?.length) {
                const srcPath = files.ctsvUploadDsSinhVien[0].path;
                const workbook = await app.excel.readFile(srcPath);
                if (!workbook) throw 'No workbook!';
                app.fs.deleteFile(srcPath);
                const worksheet = workbook.worksheets[0];
                if (!worksheet) throw 'No worksheet!';
                // const items = [], failed = [];
                // for (let rowNumber = 2; rowNumber <= worksheet.rowCount; ++rowNumber) {
                //     const mssv = worksheet.getCell(`A${rowNumber}`).text?.trim();
                //     const checkSv = await app.model.fwStudent.get({ mssv });
                //     if (!checkSv) failed.push({ rowNumber, message: `Không tìm thấy sinh viên ${mssv}!` });
                //     else {
                //         const { mssv, ho, ten, lop } = checkSv;
                //         items.push({ mssv, hoTen: `${ho} ${ten}`, maLop: lop });
                //     }
                // }
                // console.log('===============items================');
                // console.log(items);

                const preItems = [];
                const items = [];
                const failed = [];
                let listSv = [];

                // Lấy dữ liệu hệ thống
                const dmThanhTich = await app.model.svKhenThuongThanhTich.getAll();

                worksheet.eachRow((row, rowNumber) => {
                    try {
                        if (rowNumber == 1) return; //Skip header row
                        const [, mssv, maThanhTich, namHoc] = row.values;
                        if (!dmThanhTich.some(thanhTich => thanhTich.id == maThanhTich)) throw { rowNumber, color: 'danger', message: `Không tìm thấy mã thành tích ${maThanhTich}` };
                        if (mssv) {
                            listSv.push(mssv.toString());
                        }
                        const item = { mssv, maThanhTich, namHoc, rowNumber };
                        preItems.push(item);
                    } catch (error) {
                        error.rowNumber || console.error(error);
                        failed.push(error);
                    }
                });
                // Kiểm tra sự tồn tại của sinh viên
                listSv = listSv.length ? await app.model.fwStudent.getAll({
                    statement: 'mssv in (:listSv)',
                    parameter: { listSv }
                }, 'ho,ten,mssv') : [];
                listSv = listSv.groupBy('mssv');

                const mapperThanhTich = Object.assign({}, ...dmThanhTich.map(item => ({ [item.id]: item.ten })));

                preItems.forEach(item => {
                    if (listSv[item.mssv] == null) failed.push({ rowNumber: item.rowNumber, color: 'danger', message: `Không tìm thấy MSSV ${item.mssv || ''}!` });
                    else items.push({ ...item, hoTen: listSv[item.mssv][0].ho + ' ' + listSv[item.mssv][0].ten, tenThanhTich: mapperThanhTich[item.maThanhTich] });
                });

                done({ items, failed });
            }
        } catch (error) {
            app.consoleError(req, error);
            done({ error });
        }
    };

    app.get('/api/ctsv/danh-sach-khen-thuong/page/:pageNumber/:pageSize', app.permission.orCheck('ctsvKhenThuong:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.svKhenThuongDanhSach.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/khen-thuong/danh-sach/download', async (req, res) => {
        try {
            const danhSach = JSON.parse(req.query.danhSach),
                loaiDoiTuong = req.query.loaiDoiTuong;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DANH_SACH_KHEN_THUONG');
            ws.columns = loaiDoiTuong == 'CN' ? [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ VÀ TÊN', key: 'hoTen', width: 30 },
                { header: 'TÊN THÀNH TÍCH', key: 'tenThanhTich', width: 20 },
                { header: 'NĂM ĐẠT ĐƯỢC', key: 'namHoc', width: 15 },
            ] : [
                { header: 'MÃ LỚP', key: 'maLop', width: 30 },
                { header: 'TÊN THÀNH TÍCH', key: 'tenThanhTich', width: 20 },
                { header: 'NĂM ĐẠT ĐƯỢC', key: 'namHoc', width: 15 },
            ];
            danhSach.forEach(item => ws.addRow(item));

            app.excel.attachment(workBook, res, 'DANH_SACH_KHEN_THUONG.xlsx');
        } catch (error) {
            res.send({ error });
        }
    });
};