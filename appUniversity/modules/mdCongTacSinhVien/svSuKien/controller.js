module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6157: { title: 'Danh sách sự kiện', parentKey: 6156, icon: 'fa-list', link: '/user/ctsv/danh-sach-su-kien', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvSuKien:write', menu: menuCtsv },
        { name: 'ctsvSuKien:duyet', menu: menuCtsv },
        'ctsvSuKien:read',
        // 'ctsvSuKien:duyet',
        'ctsvSuKien:delete',
    );

    app.permissionHooks.add('staff', 'addRolectsvSuKien', (user, staff) => new Promise(resolve => {
        const hasApprovalRoleTruongPhong = staff.listChucVu.some(chucVu => {
            return chucVu.maDonVi == '32' && chucVu.maChucVu == '003';
        });
        const hasApprovalRoleTruongKhoa = staff.listChucVu.some(chucVu => {
            return chucVu.maChucVu == '009';
        });
        app.model.svSuKienQuyenDuyet.get({ email: user.email }).then((quyenDuyet) => {
            const isAssignedQuyenDuyet = quyenDuyet != null;
            if (staff.maDonVi && staff.maDonVi == 32) {
                app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:manage', 'ctsvSuKien:write', 'ctsvSuKien:read', 'ctsvSuKien:delete');
                // if (hasApprovalRoleTruongPhong) {
                //     app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:duyet', 'ctsvSuKien:phanQuyen');
                // }
                // if (isAssignedQuyenDuyet) {
                //     app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:duyet');
                // }
                // resolve();
            }
            if (hasApprovalRoleTruongPhong || hasApprovalRoleTruongKhoa) {
                app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:manage', 'ctsvSuKien:duyet', 'ctsvSuKien:phanQuyen', 'ctsvSuKien:write');
            }
            if (isAssignedQuyenDuyet) {
                app.permissionHooks.pushUserPermission(user, 'ctsvSuKien:manage', 'ctsvSuKien:duyet');
            }
            resolve();
        });

    }));




    app.get('/user/ctsv/danh-sach-su-kien', app.permission.orCheck('ctsvSuKien:manage', 'ctsvSuKien:duyet'), app.templates.admin);
    app.get('/user/ctsv/danh-sach-su-kien/edit/:id', app.permission.orCheck('ctsvSuKien:manage', 'ctsvSuKien:duyet'), app.templates.admin);
    app.get('/user/ctsv/duyet-su-kien', app.permission.check('ctsvSuKien:duyet'), app.templates.admin);
    app.get('/user/ctsv/duyet-su-kien/edit/:id', app.permission.check('ctsvSuKien:duyet'), app.templates.admin);
    app.get('/user/ctsv/su-kien/view/:id/:version', app.permission.orCheck('ctsvSuKien:manage', 'ctsvSuKien:duyet'), app.templates.admin);
    app.get('/user/ctsv/phan-quyen-su-kien', app.permission.check('ctsvSuKien:phanQuyen'), app.templates.admin);
    // API ========================================================================================

    app.get('/api/ctsv/danh-sach-su-kien/all', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            const items = await app.model.svSuKien.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-su-kien/page', app.permission.orCheck('ctsvSuKien:manage', 'student:login'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, pageCondition, filter = {} } = req.query;
            const _page = await app.model.svSuKien.searchPage(parseInt(_pageNumber), parseInt(_pageSize), pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/su-kien-nguoi-tham-du/page', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, pageCondition, filter = {} } = req.query;
            const _page = await app.model.svSuKien.searchPageNguoiThamDu(parseInt(_pageNumber), parseInt(_pageSize), pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/su-kien/item/:id', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            let idSuKien = req.params.id;
            const data = await app.model.svSuKien.getInfoFinal(idSuKien);
            res.send({ data: data.rows[0] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-su-kien/all-item/:id', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            let idSuKien = req.params.id;
            const data = await app.model.svSuKienData.getAll({ idSuKien });
            res.send({ data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/su-kien/view-history/:id/:version', app.permission.orCheck('ctsvSuKien:manage', 'ctsvSuKien:duyet'), async (req, res) => {
        try {
            let idSuKien = req.params.id;
            let versionNumber = Number(req.params.version);
            const data = await app.model.svSuKienData.get({ idSuKien, versionNumber });
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/danh-sach-su-kien', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { data } = req.body;
            data.nguoiTao = req.session.user.email;
            data.maDonVi = req.session.user.maDonVi ? req.session.user.maDonVi : req.session.user.data.khoa;
            data.createTime = Date.now();
            const item = await app.model.svSuKien.createSuKien(data);
            res.send(item);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/danh-sach-su-kien', app.permission.orCheck('ctsvSuKien:write', 'ctsvSuKien:duyet'), async (req, res) => {
        try {
            const { id, changes, isDuyet } = req.body;
            changes.nguoiCapNhat = req.session.user.email;
            const listItems = await app.model.svSuKien.updateSuKien(id, changes);
            const item = listItems.item,
                preEditItem = listItems.preEditItem;
            if (item.trangThai == 'U' && !isDuyet) {
                app.notification.send({
                    toEmail: preEditItem.nguoiXuLy,
                    title: `Sự kiện ${preEditItem.tenSuKien} mà bạn duyêt đã cập nhật thông tin`,
                    subTitle: `${app.date.viTimeFormat(new Date())} ${app.date.viDateFormat(new Date())}`,
                    icon: 'fa-check', iconColor: 'primary',
                    targetLink: `/api/ctsv/su-kien/item/${preEditItem.id}`,
                });
            } else if (isDuyet) {
                app.notification.send({
                    toEmail: preEditItem.nguoiTao,
                    title: `Sự kiện ${preEditItem.tenSuKien} mà bạn tạo đã cập nhật thông tin bởi người duyệt`,
                    subTitle: `${app.date.viTimeFormat(new Date())} ${app.date.viDateFormat(new Date())}`,
                    icon: 'fa-check', iconColor: 'primary',
                    targetLink: `/api/ctsv/su-kien/item/${preEditItem.id}`,
                });
            }
            res.send(item);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/danh-sach-su-kien/qr-code', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { idSuKien, versionNumber, changes } = req.body;
            const item = await app.model.svSuKienData.update({ idSuKien, versionNumber }, changes);
            res.send(item);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/duyet-su-kien/update', app.permission.orCheck('ctsvSuKien:duyet', 'ctsvSuKien:write'), async (req, res) => {
        try {
            const { idSuKien, versionNumber, changes } = req.body;
            changes.nguoiXuLy = req.session.user.email;
            changes.thoiGianXuLy = Date.now();
            const item = await app.model.svSuKienData.update({ idSuKien, versionNumber }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/danh-sach-su-kien', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svSuKien.delete({ id });
            await app.model.svSuKienData.delete({ idSuKien: id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.get('/api/ctsv/su-kien-nguoi-tham-du/import/template', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_NGUOI_THAM_DU_template');
            ws.columns = [
                { header: 'STT', width: 15 },
                { header: 'TÊN', width: 20 },
                { header: 'MSSV', width: 25 },
                { header: 'EMAIL', width: 25 },
                { header: 'MÃ LOẠI THAM DỰ', width: 15 },
                { header: 'LOẠI THAM DỰ', width: 15 },
                { header: 'MÃ TÌNH TRẠNG', width: 15 },
                { header: 'TÌNH TRẠNG', width: 15 },
                { header: 'ĐIỂM CỘNG', width: 30 }
            ];

            const wsLoaiThamDu = workBook.addWorksheet('DM_LOAI_THAM_DU');
            wsLoaiThamDu.columns = [
                { header: 'ID', key: 'id', width: 15 },
                { header: 'LOẠI THAM DỰ', key: 'ten', width: 15 }
            ];
            wsLoaiThamDu.addRow({ id: 1, ten: 'Sinh Viên' });
            wsLoaiThamDu.addRow({ id: 2, ten: 'Khách Mời' });

            const wsTinhTrang = workBook.addWorksheet('DM_TINH_TRANG_THAM_DU');
            wsTinhTrang.columns = [
                { header: 'ID', key: 'id', width: 15 },
                { header: 'TÌNH TRẠNG', key: 'ten', width: 15 }
            ];
            wsTinhTrang.addRow({ id: '', ten: 'Chưa tham dự' });
            wsTinhTrang.addRow({ id: 1, ten: 'Đã tham dự' });
            wsTinhTrang.addRow({ id: -1, ten: 'Vắng' });

            app.excel.attachment(workBook, res, 'DS_NGUOI_THAM_DU_Template.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('ctsvUploadDanhSachNguoiThamDu', (req, fields, files, params, done) =>
        app.permission.has(req, () => danhSachNguoiThamDuImportData(fields, files, params, done), done, 'ctsvSuKien:write')
    );

    const danhSachNguoiThamDuImportData = async (fields, files, params, done) => {
        let dataWS = null;
        if (files.ctsvUploadDanhSachNguoiThamDu?.length && fields.userData && fields.userData[0].startsWith('ctsvUploadDanhSachNguoiThamDu:')) {
            const idSuKien = parseInt(fields.userData[0].replace('ctsvUploadDanhSachNguoiThamDu:', ''));
            const srcPath = files.ctsvUploadDanhSachNguoiThamDu[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                dataWS = workbook.worksheets[0];
                if (dataWS) {
                    const preItems = [];
                    const failed = [];
                    const listPromises = [];
                    const proccessRow = async (row, rowNumber) => {
                        try {
                            if (rowNumber == 1) return;
                            else {
                                const ten = row.getCell('B').text;
                                const mssv = row.getCell('C').text;
                                const email = row.getCell('D').text;
                                const loaiThamDu = row.getCell('E').text;
                                const tinhTrang = row.getCell('G').text;
                                let diemCong;
                                if (loaiThamDu == '1' && tinhTrang == '') {
                                    diemCong = 0;
                                }
                                else {
                                    diemCong = row.getCell('I').text;
                                }

                                const dataRow = [idSuKien, ten, mssv, email, loaiThamDu, tinhTrang, diemCong];
                                const existingRecord = await app.model.svSuKienNguoiThamDu.get({ idSuKien, email });
                                if (existingRecord) {
                                    failed.push({
                                        rowNumber: rowNumber,
                                        color: 'danger',
                                        message: `Người tham dự ở dòng ${rowNumber} đã tồn tại trong danh sách`,
                                    });
                                }
                                else {
                                    preItems.push(dataRow);
                                    const success = await saveDataToDatabase(dataRow, rowNumber);
                                    if (!success) {
                                        failed.push({
                                            rowNumber: rowNumber,
                                            color: 'danger',
                                            message: `Lỗi khi lưu dữ liệu cho dòng ${rowNumber}`,
                                        });
                                    }
                                }

                            }

                        } catch (error) {
                            error.rowNumber || console.error(error);
                            failed.push(error);
                        }
                    };
                    dataWS.eachRow((row, rowNumber) => {
                        rowNumber > 1 && listPromises.push(proccessRow(row, rowNumber));
                    });
                    await Promise.all(listPromises);
                    done({ success: preItems.length, failed: failed });

                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };


    async function saveDataToDatabase(dataRow) {
        try {
            const [idSuKien, ten, mssv, email, loaiThamDu, tinhTrang, diemCong] = dataRow;
            await app.model.svSuKienNguoiThamDu.create({
                idSuKien,
                ten,
                mssv,
                email,
                loaiThamDu,
                tinhTrang,
                diemCong,
            });
            return true;

        } catch (error) {
            console.error('saveData Error', error);
            return false;
        }
    }

    app.post('/api/ctsv/su-kien-nguoi-tham-du/create', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const email = data.email,
                idSuKien = data.idSuKien;
            const NguoiThamDu = await app.model.svSuKienNguoiThamDu.get({ email, idSuKien });
            if (!NguoiThamDu) {
                const item = await app.model.svSuKienNguoiThamDu.create(data);
                res.send({ item });
            } else {
                const exist = true;
                res.send({ exist, nguoiThamDu });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/su-kien-nguoi-tham-du/update', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svSuKienNguoiThamDu.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/su-kien-nguoi-tham-du/delete', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svSuKienNguoiThamDu.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.get('/api/ctsv/su-kien-nguoi-tham-du/download-excel', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const { pageCondition, filter } = req.query;
            const { rows: data } = await app.model.svSuKienNguoiThamDu.downloadExcel(pageCondition, app.utils.stringify(filter));

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_NGUOI_THAM_DU_SU_KIEN');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 6, height: 30, vertical: 'middle' },
                { header: 'TÊN', key: 'ten', width: 20, height: 30 },
                { header: 'EMAIL', key: 'email', width: 20, height: 30 },
                { header: 'MSSV', key: 'mssv', width: 15, wrapText: false, height: 30 },
                // { header: 'MÃ LOẠI THAM DỰ', key: 'loaiThamDu', width: 15, height: 30 },
                { header: 'LOẠI THAM DỰ', key: 'tenLoaiThamDu', width: 15, height: 30 },
                // { header: 'MÃ TÌNH TRẠNG', key: 'tinhTrang', width: 20, height: 30 },
                { header: 'TÌNH TRẠNG', key: 'tenTinhTrang', width: 20, height: 30 },
                { header: 'ĐIỂM CỘNG', key: 'diemCong', width: 20, height: 30 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };
            data.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    ten: item.ten,
                    email: item.email,
                    mssv: item.mssv,
                    // loaiThamDu: item.loaiThamDu,
                    tenLoaiThamDu: (item.loaiThamDu == '1' ? 'Sinh Viên' : 'Khách Mời'),
                    // tinhTrang: item.tinhTrang,
                    tenTinhTrang: (item.tinhTrang == '1' ? 'Đã tham dự' : item.tinhTrang == '-1' ? 'Vắng' : 'Chưa tham dự'),
                    diemCong: item.diemCong
                }, 'i');
            });
            // const wsLoaiThamDu = workBook.addWorksheet('DM_LOAI_THAM_DU');
            // wsLoaiThamDu.columns = [
            //     { header: 'ID', key: 'id', width: 15 },
            //     { header: 'LOẠI THAM DỰ', key: 'ten', width: 15 }
            // ];
            // wsLoaiThamDu.addRow({ id: 1, ten: 'Sinh Viên' });
            // wsLoaiThamDu.addRow({ id: 2, ten: 'Khách Mời' });

            // const wsTinhTrang = workBook.addWorksheet('DM_TINH_TRANG_THAM_DU');
            // wsTinhTrang.columns = [
            //     { header: 'ID', key: 'id', width: 15 },
            //     { header: 'TÌNH TRẠNG', key: 'ten', width: 15 }
            // ];
            // wsTinhTrang.addRow({ id: '', ten: 'Chưa tham dự' });
            // wsTinhTrang.addRow({ id: 1, ten: 'Đã tham dự' });
            // wsTinhTrang.addRow({ id: -1, ten: 'Vắng' });

            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/danh-sach-su-kien/diem-danh', app.permission.check('ctsvSuKien:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            let { mssv, idSuKien } = data;
            // kiểm tra sinh viên có trong danh sách tham dự sự kiện hay không
            const sinhVienThamDu = await app.model.svSuKienNguoiThamDu.get({ mssv, idSuKien });
            if (sinhVienThamDu) {
                const daDiemDanh = sinhVienThamDu.tinhTrang === '1';
                if (daDiemDanh) return res.send({ response: 'Sinh viên đã điểm danh rồi', status: 'success' });
                let item = await app.model.svSuKienNguoiThamDu.update({ id: sinhVienThamDu.id }, { tinhTrang: '1', diemCong: data.diemCong });
                return res.send({ response: 'Điểm danh thành công', status: 'success', item });
            }
            return res.send({ response: 'Sinh viên không nằm trong danh sách người tham dự sự kiện này', status: 'danger' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-su-kien/qr-code', app.permission.orCheck('ctsvSuKien:manage'), async (req, res) => {
        try {
            const { id, versionNumber } = req.query;
            const { qrTimeGenerate, qrValidTime } = await app.model.svSuKien.get({ idSuKien: id, versionNumber });
            if (new Date().getTime() > qrValidTime) {
                await app.model.svSuKienData.update({ idSuKien: id, versionNumber }, { qrTimeGenerate: null, qrValidTime: null });
                res.send({ item: { qrTimeGenerate: null, qrValidTime: null } });
            }
            else res.send({ item: { qrTimeGenerate, qrValidTime } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-su-kien/import/template', app.permission.check('ctsvSuKien:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SU_KIEN_template');
            ws.columns = [
                { header: 'STT', width: 15 },
                { header: 'TÊN SỰ KIỆN', width: 20 },
                { header: 'THỜI GIAN BẮT ĐẦU', width: 25 },
                { header: 'THỜI GIAN KẾT THÚC', width: 25 },
                { header: 'THỜI GIAN BẮT ĐẦU ĐĂNG KÝ', width: 30 },
                { header: 'ĐỊA ĐIỂM', width: 15 },
                { header: 'SỐ LƯỢNG THAM DỰ DỰ KIẾN', width: 25 },
                { header: 'SỐ LƯỢNG THAM DỰ TỐI ĐA', width: 25 },
                { header: 'TRẠNG THÁI', width: 25 },
                { header: 'ĐIỂM CỘNG', width: 15 },
                { header: 'NĂM HỌC', width: 15 },
                { header: 'HỌC KỲ', width: 15 },
                { header: 'MÔ TẢ', width: 40 }

            ];

            const wsTrangThai = workBook.addWorksheet('DM_TRANG_THAI');
            wsTrangThai.columns = [
                { header: 'TEN TRANG THAI', key: 'ten', width: 15 },
                { header: 'KEY', key: 'key', width: 15 }
            ];
            wsTrangThai.addRow({ ten: 'Chờ duyệt', key: '' });
            wsTrangThai.addRow({ ten: 'Đã duyệt', key: 'A' });
            wsTrangThai.addRow({ ten: 'Từ Chối', key: 'R' });
            wsTrangThai.addRow({ ten: 'Được cập nhật', key: 'U' });

            app.excel.attachment(workBook, res, 'DS_SU_KIEN_Template.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('ctsvUploadDanhSachSuKien', (req, fields, files, params, done) =>
        app.permission.has(req, () => danhSachSuKienImportData(req, fields, files, params, done), done, 'ctsvSuKien:write')
    );

    const danhSachSuKienImportData = async (req, fields, files, params, done) => {
        let dataWS = null;
        const nguoiTao = req.session.user.email;
        const maDonVi = req.session.user.maDonVi ? req.session.user.maDonVi : req.session.user.data.khoa;
        if (files.ctsvUploadDanhSachSuKien?.length && fields.userData && fields.userData[0].startsWith('ctsvUploadDanhSachSuKien:')) {
            const srcPath = files.ctsvUploadDanhSachSuKien[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                dataWS = workbook.worksheets[0];
                if (dataWS) {
                    const preItems = [];
                    const failed = [];
                    const listPromises = [];
                    const proccessRow = async (row, rowNumber) => {
                        try {
                            if (rowNumber == 1) return;
                            else {
                                const tenSuKien = row.getCell('B').text;
                                const thoiGianBatDau = new Date(row.getCell('C').text).getTime();
                                const thoiGianKetThuc = new Date(row.getCell('D').text).getTime();
                                const thoiGianBatDauDangKy = new Date(row.getCell('E').text).getTime();
                                const diaDiem = row.getCell('F').text;
                                const soLuongThamGiaDuKien = row.getCell('G').text;
                                const soLuongThamGiaToiDa = row.getCell('H').text;
                                const trangThai = row.getCell('I').text;
                                const diemRenLuyenCong = row.getCell('J').text;
                                const namHoc = row.getCell('K').text;
                                const hocKy = row.getCell('L').text;
                                const moTa = row.getCell('M').text;
                                const dataRow = [tenSuKien, thoiGianBatDau, thoiGianKetThuc, thoiGianBatDauDangKy, diaDiem, soLuongThamGiaDuKien
                                    , soLuongThamGiaToiDa, trangThai, diemRenLuyenCong, namHoc, hocKy, moTa, nguoiTao, maDonVi];
                                preItems.push(dataRow);
                                const success = await saveDataDanhSachSuKienToDatabase(dataRow, rowNumber);
                                if (!success) {
                                    failed.push({
                                        rowNumber: rowNumber,
                                        color: 'danger',
                                        message: `Lỗi khi lưu dữ liệu cho dòng ${rowNumber}`,
                                    });
                                }
                            }
                        } catch (error) {
                            error.rowNumber || console.error(error);
                            failed.push(error);
                        }
                    };
                    dataWS.eachRow((row, rowNumber) => {
                        rowNumber > 1 && listPromises.push(proccessRow(row, rowNumber));
                    });
                    await Promise.all(listPromises);
                    done({ success: preItems.length, failed: failed });

                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };


    async function saveDataDanhSachSuKienToDatabase(dataRow) {
        try {
            const [tenSuKien, thoiGianBatDau, thoiGianKetThuc, thoiGianBatDauDangKy, diaDiem, soLuongThamGiaDuKien, soLuongThamGiaToiDa, trangThai, diemRenLuyenCong, namHoc, hocKy, moTa, nguoiTao, maDonVi] = dataRow;
            const createTime = Date.now();
            const versionNumber = 1;
            const data = {
                tenSuKien,
                thoiGianBatDau,
                thoiGianKetThuc,
                thoiGianBatDauDangKy,
                diaDiem,
                soLuongThamGiaDuKien,
                soLuongThamGiaToiDa,
                trangThai,
                diemRenLuyenCong,
                namHoc,
                hocKy,
                moTa,
                createTime,
                nguoiTao,
                versionNumber,
                maDonVi
            };
            await app.model.svSuKien.createSuKien(data);
            return true;

        } catch (error) {
            console.error('saveData Error', error);
            return false;
        }
    }
};