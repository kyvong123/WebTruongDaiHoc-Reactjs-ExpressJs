module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6143: { title: 'Văn bằng tốt nghiệp', parentKey: 6155, icon: 'fa-graduation-cap', link: '/user/ctsv/van-bang-tot-nghiep', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvVbTotNghiep:manage', menu: menuCtsv },
        'ctsvVbTotNghiep:write',
        'ctsvVbTotNghiep:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvVbTotNghiep', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvVbTotNghiep:manage', 'ctsvVbTotNghiep:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/van-bang-tot-nghiep', app.permission.check('ctsvVbTotNghiep:manage'), app.templates.admin);

    // API ========================================================================================


    app.get('/api/ctsv/van-bang-tot-nghiep/all', app.permission.check('ctsvVbTotNghiep:manage'), async (req, res) => {
        try {
            const items = await app.model.svVanBangTotNghiep.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/van-bang-tot-nghiep/page', app.permission.check('ctsvVbTotNghiep:manage'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize, pageCondition, filter } = req.query;
            const _page = await app.model.svVanBangTotNghiep.searchPage(parseInt(_pageNumber), parseInt(_pageSize), pageCondition, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal, rows: list } = _page;
            res.send({ page: { pageNumber, pageSize, totalItem, pageTotal, list, pageCondition } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/van-bang-tot-nghiep/item', app.permission.check('ctsvVbTotNghiep:manage'), async (req, res) => {
        try {
            const { mssv } = req.query,
                item = await app.model.svVanBangTotNghiep.get({ mssv });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/van-bang-tot-nghiep/import/template', app.permission.check('ctsvVbTotNghiep:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DSTN');
            ws.columns = [
                { header: 'STT', width: 15 },
                { header: 'Ngành', width: 20 },
                { header: 'Chuyên ngành', width: 25 },
                { header: 'Mã số sinh viên/ học viên', width: 15 },
                { header: 'Họ và tên', width: 15 },
                { header: 'Ngày sinh', width: 25 },
                { header: 'Nơi sinh', width: 15 },
                { header: 'Dân tộc', width: 15 },
                { header: 'Giới tính', width: 15 },
                { header: 'Xếp loại TN', width: 25 },
                { header: 'Hệ đào tạo', width: 25 },
                { header: 'Năm TN', width: 25 },
                { header: 'Quyết định công nhận tốt nghiệp', width: 30 },
                { header: 'Khoá học', width: 15 },
                { header: 'Số vào sổ gốc', width: 15 },
                { header: 'Số hiệu văn bằng', width: 20 },
                { header: 'Ngày in văn bằng', width: 20 },
                { header: 'Ghi chú', width: 15 }
            ];
            app.excel.attachment(workBook, res, 'DS_TOT_NGHIEP_Template.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //Hook upload -----------------------------------------------------------------------------------------
    app.uploadHooks.add('ctsvUploadVbTotNghiep', (req, fields, files, params, done) =>
        app.permission.has(req, () => vbTotNghiepImportData(fields, files, params, done), done, 'ctsvVbTotNghiep:manage')
    );

    const splitDate = (text) => {
        try {
            const [d, m, y] = text.split('/');
            return new Date(y, m - 1, d).getTime();
        } catch (error) {
            return '';
        }
    };

    const vbTotNghiepImportData = async (fields, files, params, done) => {
        let dataWS = null;
        if (files.ctsvUploadVbTotNghiep && files.ctsvUploadVbTotNghiep.length) {
            const srcPath = files.ctsvUploadVbTotNghiep[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                dataWS = workbook.worksheets[0];
                if (dataWS) {
                    const preItems = [];
                    const failed = [];
                    const listPromises = [];
                    let listMssv = dataWS.getColumn('D').values.slice(2);
                    const studentData = await app.model.fwStudent.searchAll('', app.utils.stringify({ listMssv: listMssv?.toString() }))
                        .then(({ rows }) => rows.mapArrayToObject('mssv'));
                    const proccessRow = async (row, rowNumber) => {
                        try {
                            if (rowNumber == 1) return;
                            else {
                                const mssv = row.getCell('D').text.trim();
                                const soVaoSoGoc = row.getCell('O').text.trim();
                                const soHieuVanBang = row.getCell('P').text.trim();
                                // const ngayCapBang = new Date(row.getCell('Q').text).getTime();
                                const ngayCapBang = splitDate(row.getCell('Q').text.trim());
                                const namTotNghiep = row.getCell('L').text;

                                if (!soVaoSoGoc) throw { rowNumber, message: 'Số vào sổ bị trống' };
                                if (!soHieuVanBang) throw { rowNumber, message: 'Số hiệu văn bằng bị trống' };
                                if (!ngayCapBang) throw { rowNumber, message: 'Ngày cấp bằng bị trống' };
                                if (!namTotNghiep) throw { rowNumber, message: 'Năm tốt nghiệp bị trống' };
                                if (!studentData[mssv]) throw { rowNumber, message: `Không tìm thấy sinh viên: ${mssv}` };

                                let { hoTen, tinhTrang, tenTinhTrang } = studentData[mssv] ?? {};
                                const dataRow = { mssv, soVaoSoGoc, soHieuVanBang, ngayCapBang, namTotNghiep, rowNumber, hoTen, tinhTrang, tenTinhTrang };
                                preItems.push(dataRow);
                                // const success = await saveDataToDatabase(dataRow);
                                // if (!success) {
                                //     failed.push({
                                //         rowNumber: rowNumber,
                                //         color: 'danger',
                                //         message: `Lỗi khi lưu dữ liệu cho dòng ${rowNumber}`,
                                //     });
                                // }
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
                    done({ success: preItems, failed: failed });

                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    app.post('/api/ctsv/van-bang-tot-nghiep/multiple', app.permission.check('ctsvVbTotNghiep:write'), async (req, res) => {
        try {
            const { listData, updateStudentStatus = 0 } = req.body, failed = [];
            console.log({ listData, updateStudentStatus });
            await Promise.all(listData.map(async ({ mssv, soVaoSoGoc, soHieuVanBang, ngayCapBang, namTotNghiep, rowNumber }) => {
                let success = await saveDataToDatabase({ mssv, soVaoSoGoc, soHieuVanBang, ngayCapBang, namTotNghiep });
                if (updateStudentStatus == 1) {
                    await app.model.fwStudent.update({ mssv }, { tinhTrang: 6 }); //Cap nhat tinh trang thanh tot nghiep
                }
                if (!success) {
                    failed.push({
                        rowNumber: rowNumber,
                        color: 'danger',
                        message: `Lỗi khi lưu dữ liệu cho dòng ${rowNumber}`,
                    });
                }
            }));
            res.send({ failed });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    async function saveDataToDatabase({ mssv, soVaoSoGoc, soHieuVanBang, ngayCapBang, namTotNghiep }) {
        try {
            const existingRecord = await app.model.svVanBangTotNghiep.get({ mssv, soHieuVanBang });
            if (existingRecord) {
                await app.model.svVanBangTotNghiep.update({
                    soVaoSoGoc,
                    ngayCapBang,
                    namTotNghiep,
                }, {
                    mssv,
                    soHieuVanBang,
                });
            } else {
                await app.model.svVanBangTotNghiep.create({
                    mssv,
                    soVaoSoGoc,
                    soHieuVanBang,
                    ngayCapBang,
                    namTotNghiep,
                });
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    app.post('/api/ctsv/van-bang-tot-nghiep', app.permission.check('ctsvVbTotNghiep:write'), async (req, res) => {
        try {
            const { data, updateStudentStatus } = req.body;
            const item = await app.model.svVanBangTotNghiep.create(data);
            if (updateStudentStatus == 1) {
                await app.model.fwStudent.update({ mssv: data.mssv }, { tinhTrang: 6 }); //Cap nhat tinh trang thanh tot nghiep
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/van-bang-tot-nghiep', app.permission.check('ctsvVbTotNghiep:write'), async (req, res) => {
        try {
            const { mssv, changes } = req.body;
            const item = await app.model.svVanBangTotNghiep.update({ mssv }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};

