module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6112: {
                title: 'Quản lý miễn giảm', icon: 'fa-address-book', link: '/user/ctsv/quan-ly-mien-giam', groupIndex: 2, backgroundColor: '#531c8d'
            }
        }
    };


    app.permission.add(
        { name: 'manageMienGiam:ctsv', menu: menuCtsv },
        'manageMienGiam:write',
        'manageMienGiam:delete',
        'manageMienGiam:cancel',
        'manageMienGiam:edit'
    );

    app.readyHooks.add('addSocketListener:ListenMienGiamUpdate', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('svManageMienGiam', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('manageMienGiam:write') && socket.join('svManageMienGiam');
        })
    });

    const socketIoEmit = (event, data, error) => !error && app.io.to('svManageMienGiam').emit(event, data);

    app.get('/user/ctsv/quan-ly-mien-giam', app.permission.check('manageMienGiam:ctsv'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleManageMienGiam', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'manageMienGiam:ctsv', 'manageMienGiam:write', 'manageMienGiam:cancel', 'manageMienGiam:edit');
            resolve();
        } else resolve();
    }));

    // API ------------------------------------------------------------------------------------------------------------

    app.get('/api/ctsv/mien-giam/all', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        let condition = req.query.condition ? req.query.condition : {};
        app.model.svManageMienGiam.getAll(condition, '*', 'handleTime DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/mien-giam/page/:pageNumber/:pageSize', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, dssinhvien: dsSinhVien } = await app.model.svManageMienGiam.searchPage(_pageNumber, _pageSize, searchTerm);
            const result = list.map(mienGiam => {
                return {
                    ...mienGiam,
                    dsSinhVien: dsSinhVien.filter(sinhVien => sinhVien.qdId == mienGiam.id)
                };
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: result, dsSinhVien } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/mien-giam/check/:soquyetdinh', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            let data = await app.model.svManageMienGiam.get({ soQuyetDinh: req.params.soquyetdinh, isDeleted: 0 }, '*', '');
            let dataQd = await app.model.svManageQuyetDinh.get({ soQuyetDinh: req.params.soquyetdinh, isDeleted: 0 }, '*', '');
            let dataKl = await app.model.svQtKyLuat.get({ soQuyetDinh: req.params.soquyetdinh }, '*', '');
            if (data || dataQd || dataKl) {
                let soQd = await app.model.hcthSoDangKy.get({ id: req.params.soquyetdinh }, 'id, soCongVan');
                res.send({ error: `Đã tồn tại quyết định có số ${soQd.soCongVan}` });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/mien-giam', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const { firstName, lastName, email } = req.session.user;
            const newItem = req.body.svManageMienGiam;
            newItem.staffHandle = email;
            newItem.handleTime = Date.now();
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: newItem.soQuyetDinh });
            let item = null;
            if (dataSoCongVan.suDung == 0) {
                const itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh(newItem, req.session.user);
                item = await app.model.svManageMienGiam.create({ ...newItem, idCvd: itemCvd.id });
                await app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 1 });
            } else {
                item = await app.model.svManageMienGiam.create({ ...newItem });
            }
            await Promise.all([
                ...newItem.listStudent.map(sinhVien => {
                    // app.model.svDsMienGiam.create({ mssv: sinhVien.mssv, qdId: item.id, timeStart: sinhVien.timeStart, timeEnd: sinhVien.timeEnd, loaiMienGiam: sinhVien.loaiMienGiam })
                    if (sinhVien.id == null) {
                        return app.model.svDsMienGiam.create({ mssv: sinhVien.mssv, qdId: item.id, namHoc: newItem.namHoc, hocKy: newItem.hocKy, timeStart: sinhVien.timeStart, timeEnd: sinhVien.timeEnd, loaiMienGiam: sinhVien.loaiMienGiam });
                    } else if (sinhVien.isDeleted == 1) { //Xóa vĩnh viễn 
                        return app.model.svDsMienGiam.delete({ id: sinhVien.id });
                    } else {
                        return null;
                    }
                })
            ]);
            socketIoEmit('created-miengiam', { firstName, lastName, email, isNew: 1, soQuyetDinh: item.soQuyetDinh });
            res.send(item);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/mien-giam', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const { firstName, lastName, email } = req.session.user;
            let { changes, id } = req.body;
            if (changes.isSubmit == 1) {
                changes.staffHandle = email;
                await app.model.svDsMienGiam.delete({ qdId: id });
                await Promise.all([
                    ...(changes.listStudent || []).map(sinhVien => app.model.svDsMienGiam.create({ mssv: sinhVien.mssv, qdId: id, namHoc: changes.namHoc, hocKy: changes.hocKy, timeStart: sinhVien.timeStart, timeEnd: sinhVien.timeEnd, loaiMienGiam: sinhVien.loaiMienGiam }))
                ]);
            }
            const item = await app.model.svManageMienGiam.update({ id }, changes);
            socketIoEmit('updated-miengiam', { firstName, lastName, email, isSubmit: changes.isSubmit, id });
            res.send({ item, isSubmit: changes.isSubmit });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/mien-giam/huy', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const { firstName, lastName, email } = req.session.user;
            let { changes, id } = req.body;
            const [listSv, item] = await Promise.all([
                app.model.svDsMienGiam.getAll({ qdId: id }),
                app.model.svManageMienGiam.update({ id }, changes),
            ]);
            await Promise.all([
                app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 0 }),
                app.model.svDsMienGiam.delete({ qdId: id }),
                app.model.hcthCongVanDi.delete({ soDangKy: item.soQuyetDinh }),
                listSv.length > 0 && app.model.svDsMienGiamHoan.delete({ statement: 'mssv in (:listSv)', parameter: { listSv: listSv.map(sv => sv.mssv) } })
            ]);

            socketIoEmit('updated-miengiam', { firstName, lastName, email, action: changes.action, maDangKy: id });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/mien-giam/download/:id', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const data = await app.model.svManageMienGiam.initForm(req.params.id);
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/mien-giam/download-template', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Mien_giam_Template');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Mã đối tượng', key: 'ho', width: 30 },
            ];
            const wsLoaiMienGiam = workBook.addWorksheet('Danh sách đối tượng');
            wsLoaiMienGiam.columns = [
                { header: 'Mã', key: 'ma', width: 5 },
                { header: 'Tên', key: 'ten', width: 30 },
                { header: 'Định mức (%)', key: 'dinhMuc', width: 15 },
                { header: 'Thời gian', key: 'thoiGian', width: 15 },
            ];
            const dsLoaiMienGiam = await app.model.dmSvDoiTuongMienGiam.getAll({ active: 1 });
            dsLoaiMienGiam.forEach(item => wsLoaiMienGiam.addRow(item));
            app.excel.attachment(workBook, res, 'DS_SV_Mien_Giam_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }

    });


    app.get('/api/ctsv/mien-giam/download-ds-mien-giam/:id', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            let formData = await app.model.svManageMienGiam.getData(req.params.id);
            const list = formData.dssinhvien;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SV_MIEN_GIAM');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ', key: 'hoSinhVien', width: 20 },
                { header: 'TÊN', key: 'tenSinhVien', width: 10 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 15 },
                { header: 'KHOA/BỘ MÔN', key: 'khoa', width: 25 },
                { header: 'TÌNH TRẠNG', key: 'tinhTrang', width: 20 },
                { header: 'ĐỐI TƯỢNG', key: 'doiTuong', width: 40 },
                { header: 'MỨC HƯỞNG', key: 'mucHuong', width: 15 },
                { header: 'DÂN TỘC', key: 'danToc', width: 15 },
                { header: 'MÃ LỚP', key: 'maLop', width: 15 },
                { header: 'KHÓA HỌC', key: 'khoaHoc', width: 20 },
                { header: 'SỐ QUYẾT ĐỊNH', key: 'soQuyetDinh', width: 20 },
                { header: 'TẠM NGƯNG', key: 'tamNgung', width: 20 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = { name: 'Times New Roman' };

            list.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    ...item
                }, 'i');
            });
            const fileName = 'DS_SV_MIEN_GIAM.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
        }
    });

    app.get('/api/ctsv/mien-giam/export-excel', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query;
            const { items: list } = await app.model.svDsMienGiam.getAllDsmg(namHoc, hocKy);
            const workBook = app.excel.create();
            const wsMien = workBook.addWorksheet(`MIEN_${namHoc}_HK${hocKy}`),
                wsGiam = workBook.addWorksheet(`GIAM_${namHoc}_HK${hocKy}`);

            [wsMien, wsGiam].forEach(ws => {
                ws.columns = [
                    { header: 'STT', key: 'stt', width: 10 },
                    { header: 'MSSV', key: 'mssv', width: 15 },
                    { header: 'HỌ VÀ TÊN', key: 'hoTen', width: 20 },
                    { header: 'NGÀY SINH', key: 'ngaySinh', width: 15 },
                    { header: 'KHOA/BỘ MÔN', key: 'khoa', width: 25 },
                    { header: 'TÌNH TRẠNG', key: 'tinhTrang', width: 20 },
                    { header: 'ĐỐITƯỢNG', key: 'doiTuong', width: 40 },
                    { header: 'MỨC HƯỞNG', key: 'mucHuong', width: 15 },
                    { header: 'MÃ LỚP', key: 'maLop', width: 15 },
                    { header: 'KHÓA HỌC', key: 'khoaHoc', width: 20 },
                    { header: 'NĂM HỌC BẮT ĐẦU', key: 'namHoc', width: 15 },
                    { header: 'HỌC KỲ BẮT ĐẦU', key: 'hocKy', width: 10 },
                    { header: 'SỐ QUYẾT ĐỊNH', key: 'soQuyetDinh', width: 20 },
                    { header: 'TÌNH TRẠNG MIỄN GIẢM', key: 'status', width: 20 },
                ];
                ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(1).font = { name: 'Times New Roman' };
            });
            let imien = 1, igiam = 1;
            list.forEach((item) => {
                const row = {
                    mssv: item.mssv,
                    hoTen: item.hoTen,
                    ngaySinh: item.ngaySinh,
                    khoa: item.tenKhoa,
                    tinhTrang: item.tinhTrang,
                    doiTuong: item.doiTuong,
                    mucHuong: item.mucHuong + '%',
                    maLop: item.lop,
                    khoaHoc: item.khoaHoc,
                    namHoc: item.namHoc,
                    hocKy: `HK${item.hocKy}`,
                    soQuyetDinh: item.soQuyetDinh,
                    status: item.isHoan == 1 ? 'Tạm ngưng' : 'Áp dụng'
                };
                if (item.mucHuong == 100) {
                    wsMien.addRow({ stt: imien++, ...row }, 'i');
                } else {
                    wsGiam.addRow({ stt: igiam++, ...row }, 'i');
                }
            });
            const fileName = 'DS_SV_MIEN_GIAM.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
        }
    });

    app.uploadHooks.add('DsMienGiamData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dsMienGiamImportData(fields, files, params, done), done, 'manageMienGiam:write')
    );

    const dsMienGiamImportData = async (fields, files, params, done) => {
        try {
            let worksheet = null;
            let { namHoc, hocKy } = params;
            const semester = await app.model.dtSemester.get({ namHoc, hocKy });
            let dmTinhTrang = await app.model.dmTinhTrangSinhVien.getAll({}, 'ma, ten');
            let { items: dsmg } = await app.model.svDsMienGiam.getAllDsmg(namHoc, hocKy);
            let loaiMg = (await app.model.dmSvDoiTuongMienGiam.getAll({ active: 1 })).groupBy('ma');

            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DsMienGiamData' && files.DsMienGiamData) {
                const srcPath = files.DsMienGiamData[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (workbook) {
                    app.fs.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    if (worksheet) {
                        const items = [];
                        const failed = [];
                        let index = 2;
                        try {
                            while (true) {
                                if (!worksheet.getCell('A' + index).value) {
                                    done && done({ items, failed });
                                    break;
                                } else {
                                    try {
                                        const mssv = worksheet.getCell('A' + index).value?.toString().trim() || '';
                                        const loaiMienGiam = worksheet.getCell('B' + index).value?.toString().trim() || '';
                                        const row = { mssv };
                                        if (mssv) {
                                            //check MSSV
                                            const otherMienGiam = dsmg.find(mg => mg.mssv == mssv && mg.loaiMienGiam == loaiMienGiam);
                                            if (items.some(sinhVien => sinhVien.mssv == mssv)) {
                                                throw { rowNumber: index, color: 'warning', message: `Sinh viên ${mssv} bị trùng trong danh sách` };
                                            } if (loaiMg[loaiMienGiam] == null) {
                                                throw { rowNumber: index, color: 'warning', message: `Không tìm thấy đối tượng miễn giảm ${loaiMienGiam}!` };
                                            } if (otherMienGiam) {
                                                throw { rowNumber: index, color: 'warning', message: `Sinh viên ${mssv} đã được áp dụng loại đối tượng này! (QĐ ${otherMienGiam.qdId})` };
                                            }
                                            let student = (await app.model.fwStudent.getData(mssv)).rows[0];
                                            if (!student) {
                                                throw { rowNumber: index, color: 'danger', message: `Không tìm thấy sinh viên ${mssv}` };
                                            }
                                            if (!student.ngayNhapHoc || parseInt(student.ngayNhapHoc) < 10)
                                                throw { rowNumber: index, color: 'warning', message: `Sinh viên ${mssv} chưa nhập học!` };
                                            let namKetThuc = student.nienKhoa?.split('-').map(nam => parseInt(nam))[1] || student.namTuyenSinh + 4;
                                            let _tinhTrang = dmTinhTrang.find(item => item.ma == student.tinhTrang);
                                            let hoTen = `${student.ho} ${student.ten}`,
                                                loaiHinhDaoTao = `${student.loaiHinhDaoTao}`,
                                                tinhTrang = _tinhTrang.ten,
                                                doiTuong = loaiMg[loaiMienGiam][0].ten,
                                                timeStart = semester.beginTime,
                                                dateNhapHoc = student.ngayNhapHoc > 10 ? new Date(student.ngayNhapHoc) : new Date(student.namTuyenSinh, 7, 31),
                                                endOfYear = new Date(new Date(semester.beginTime).getFullYear(), 11, 31).getTime(),
                                                endOfCourse = new Date(namKetThuc, dateNhapHoc.getMonth(), dateNhapHoc.getDate()).getTime(),
                                                timeEnd = Math.min(endOfCourse, loaiMg[loaiMienGiam][0].thoiGian == 'TK' ? endOfCourse : endOfYear),
                                                tmpRow = { ...row, hoTen, loaiHinhDaoTao, tinhTrang, loaiMienGiam, doiTuong, timeStart, timeEnd, maTinhTrang: _tinhTrang.ma, isNew: true };
                                            items.push(tmpRow);
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        failed.push(error);
                                    }
                                    index++;
                                }
                            }
                        } catch (error) {
                            console.error(error);
                            done && done({ error });
                        }
                    } else {
                        done({ error: 'No worksheet!' });
                    }
                } else done({ error: 'No workbook!' });
            }
        } catch (error) {
            console.error({ error });
        }
    };

    app.delete('/api/ctsv/mien-giam', app.permission.check('manageMienGiam:delete'), async (req, res) => {
        try {
            await Promise.all([
                app.model.svManageMienGiam.delete({ id: req.body.id }),
                app.model.svDsMienGiam.delete({ qdId: req.body.id }),
                app.model.hcthSoDangKy.update({ id: req.body.soQuyetDinh }, { suDung: 0 }),
                app.model.hcthCongVanDi.delete({ soDangKy: req.body.soQuyetDinh }),
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/mien-giam/ds-mien-giam/check-mssv', app.permission.check('manageMienGiam:ctsv'), async (req, res) => {
        try {
            const { mssv, loaiMienGiam } = req.query;
            const now = Date.now();
            const item = await app.model.svDsMienGiam.get({
                statement: 'mssv = :mssv AND loaiMienGiam = :loaiMienGiam AND timeEnd > :now',
                parameter: { mssv, loaiMienGiam, now }
            });
            if (item) throw `Sinh viên ${mssv} đã được áp dụng loại đối tượng này!`;
            else res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};
