module.exports = app => {
    const maHinhThucCanhCao = app.isDebug ? 61 : 41;

    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6141: { title: 'Quá trình kỷ luật', parentKey: 6140, link: '/user/ctsv/qua-trinh/ky-luat', icon: 'fa-ban', backgroundColor: '#B8492F' },
        },
    };

    app.permission.add(
        { name: 'ctsvKyLuat:read', menu },
        { name: 'ctsvKyLuat:write' },
        { name: 'ctsvKyLuat:delete' },
        { name: 'ctsvKyLuat:export' },
    );
    app.get('/user/ctsv/qua-trinh/ky-luat/:id', app.permission.check('ctsvKyLuat:read'), app.templates.admin);
    app.get('/user/ctsv/qua-trinh/ky-luat', app.permission.check('ctsvKyLuat:read'), app.templates.admin);
    app.get('/user/ctsv/qua-trinh/cau-hinh-ky-luat', app.permission.check('ctsvKyLuat:read'), app.templates.admin);
    app.get('/user/ctsv/qua-trinh/ky-luat/group/:mssv', app.permission.check('ctsvKyLuat:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleCtsvKyLuat', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvKyLuat:read', 'ctsvKyLuat:write', 'ctsvKyLuat:delete', 'ctsvKyLuat:export');
            resolve();
        } else resolve();
    }));

    app.get('/api/ctsv/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter);
            const page = await app.model.svQtKyLuat.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/group/page/:pageNumber/:pageSize', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter);
            const page = await app.model.svQtKyLuat.groupPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/all', app.permission.check('ctsvKyLuat:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.ma) {
            condition = {
                statement: 'ma = :searchText',
                parameter: { searchText: req.query.ma },
            };
        }
        app.model.svQtKyLuat.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/item/:id', app.permission.check('ctsvKyLuat:read'), (req, res) => {
        app.model.svQtKyLuat.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/ctsv/qua-trinh/ky-luat', app.permission.check('ctsvKyLuat:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: data.soQuyetDinh });
            if (dataSoCongVan.suDung == 0) {
                const item = await app.model.svQtKyLuat.create(data);
                if (item) {
                    await Promise.all([
                        ...data.dssv.map(sv => app.model.svDsKyLuat.create({ mssv: sv.mssv, qdId: item.id })),
                        app.model.hcthSoDangKy.update({ id: data.soQuyetDinh }, { suDung: 1 })
                    ]);
                }
            } else res.send({ error: `Đã tồn tại quyết định có số ${dataSoCongVan.soCongVan}` });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/check/:soquyetdinh', app.permission.check('ctsvKyLuat:write'), async (req, res) => {
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
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/qua-trinh/ky-luat/create-multiple', app.permission.check('ctsvKyLuat:write'), async (req, res) => {
        try {
            const user = req.session.user.email;
            const { listMssv, lyDoHinhThuc, namHoc, hocKy, noiDung, soQuyetDinh, ngayKy, model, dataCustom, staffSign, staffSignPosition, formType, ngayBatDau, ngayKetThuc, idCvd, idCauHinh } = req.body.data;
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: soQuyetDinh });
            let qd = null;
            if (dataSoCongVan.suDung == 0) {
                await app.model.hcthSoDangKy.update({ id: soQuyetDinh }, { suDung: 1 });
                const itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh({ soQuyetDinh, handleTime: new Date().getTime(), ngayKy, tenForm: 'Quyết định kỷ luật' }, req.session.user);
                qd = await app.model.svQtKyLuat.create({
                    lyDoHinhThuc, namHoc, hocKy, soQuyetDinh, ngayKy, noiDung, model, dataCustom, staffSign, staffSignPosition, formType, ngayBatDau, ngayKetThuc, idCauHinh,
                    staffHandle: user,
                    ngayXuLy: new Date().getTime(),
                    // tinhTrangSau: chuyenTinhTrang,
                    idCvd: itemCvd.id
                });
            } else {
                qd = await app.model.svQtKyLuat.create({
                    lyDoHinhThuc, namHoc, hocKy, soQuyetDinh, ngayKy, noiDung, model, dataCustom, staffSign, staffSignPosition, formType, ngayBatDau, ngayKetThuc, idCvd, idCauHinh,
                    staffHandle: user,
                    ngayXuLy: new Date().getTime(),
                    // tinhTrangSau: chuyenTinhTrang
                });
            }
            await Promise.all(
                listMssv.length && listMssv.map(sv => Promise.all([
                    app.model.svDsKyLuat.create({
                        mssv: sv.mssv,
                        qdId: qd.id,
                        tinhTrangTruoc: sv.tinhTrangTruoc,
                        hinhThucKyLuat: sv.hinhThucKyLuat,
                    }),
                    (sv.chuyenTinhTrang && app.model.fwStudent.update({ mssv: sv.mssv }, { tinhTrang: sv.chuyenTinhTrang }))
                ])),
                // (listMssv.length) && listMssv.map(sv => app.model.fwStudent.update({ mssv: sv }, { tinhTrang: chuyenTinhTrang }))
            );
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/qua-trinh/ky-luat', app.permission.check('ctsvKyLuat:write'), async (req, res) => {
        try {
            const user = req.session.user.email,
                { changes, id } = req.body;
            const item = await app.model.svQtKyLuat.update({ id }, {
                ...changes,
                staffHandle: user,
                ngayXuLy: new Date().getTime()
            });
            const listSvKyLuat = await app.model.svDsKyLuat.getAll({ qdId: id });
            await Promise.all(listSvKyLuat.map(sv => app.model.fwStudent.update({ mssv: sv.mssv }, { tinhTrang: sv.tinhTrangTruoc })));
            await app.model.svDsKyLuat.delete({ qdId: id });
            const listStudentInfo = await app.model.fwStudent.getAll({
                statement: 'mssv IN (:listMssv)',
                parameter: {
                    listMssv: changes.listMssv.map(item => item.mssv)
                }
            }, 'mssv, tinhTrang');
            await Promise.all([
                ...(listStudentInfo.length ? listStudentInfo.map(sv => app.model.svDsKyLuat.create({
                    mssv: sv.mssv,
                    qdId: id,
                    tinhTrangTruoc: sv.tinhTrang,
                    hinhThucKyLuat: changes.listMssv.find(item => item.mssv == sv.mssv).hinhThucKyLuat
                })) : []),
                ...changes.listMssv?.map(sv => sv.chuyenTinhTrang && app.model.fwStudent.update({ mssv: sv.mssv }, { tinhTrang: sv.chuyenTinhTrang })) ?? [],
                // (changes.chuyenTinhTrang && listStudentInfo.length) && listStudentInfo.map(sv => app.model.fwStudent.update({ mssv: sv }, { tinhTrang: changes.chuyenTinhTrang }))
            ]);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/qua-trinh/ky-luat', app.permission.check('ctsvKyLuat:delete'), async (req, res) => {
        try {
            const item = await app.model.svQtKyLuat.get({ id: req.body.id });
            if (item) {
                const listSvKyLuat = await app.model.svDsKyLuat.getAll({ qdId: req.body.id }); // Hỗ trọ chuyển sinh viên trước về tình trạng cũ
                await Promise.all([
                    ...listSvKyLuat.map(sv => app.model.fwStudent.update({ mssv: sv.mssv }, { tinhTrang: sv.tinhTrangTruoc })),
                    app.model.svQtKyLuat.delete({ id: item.id }),
                    app.model.svDsKyLuat.delete({ qdId: item.id }),
                    app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 0 }),
                    app.model.hcthCongVanDi.delete({ soDangKy: item.soQuyetDinh })
                ]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    const initForm = async (id) => {
        let { rows: [formData] } = await app.model.svQtKyLuat.getData(id);
        const { rows: dssvKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ qdId: id }));
        if (!formData) throw 'Không tồn tại quyết định này!';
        // const source = dssvKyLuat.length == 1 ? app.path.join(app.assetPath, 'form-type', formData.namHoc, formData.tenFile) : app.path.join(__dirname, 'resources', 'QD_KY_LUAT.docx');
        const source = app.path.join(app.assetPath, 'form-type', formData.namHoc, formData.tenFile);
        let data = {};
        if (dssvKyLuat.length == 1) {
            let sinhVienKyLuat = dssvKyLuat[0];
            ({ rows: [data] } = await app.model.fwStudent.getDataForm(sinhVienKyLuat.mssv, id, formData.kieuForm));
            formData['hinhThucKyLuat'] = sinhVienKyLuat.hinhThucKyLuatText;
            formData['mssv'] = sinhVienKyLuat.mssv;
        } else {
            const dmHinhThuc = dssvKyLuat.groupBy('hinhThucKyLuatText');
            formData['dsHinhThucKyLuat'] = Object.entries(dmHinhThuc).map(([hinhThucKyLuatText, danhSach]) => ({ hinhThucKyLuat: hinhThucKyLuatText, soLuongSinhVien: danhSach.length }));
            formData['soLuongSinhVien'] = `${dssvKyLuat.length.toString().padStart(2, '0')} (${app.utils.numberToVnText(dssvKyLuat.length)})`;
        }

        let customParam = formData.dataCustom ? JSON.parse(formData.dataCustom) : {};
        data = app.clone({}, data, customParam, formData);
        Object.keys(data).forEach(key => { if (data[key] == null || data[key] == undefined) data[key] = ''; });
        const buffer = await app.docx.generateFile(source, data);
        return { buffer, hasManyStudent: dssvKyLuat.length == 1 ? false : true };
    };

    app.get('/api/ctsv/qua-trinh/ky-luat/download/:id', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { buffer, hasManyStudent } = await initForm(req.params.id);
            res.send({ data: buffer, hasManyStudent });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/download-excel/dssv/:id', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            let { rows: [formData] } = await app.model.svQtKyLuat.getData(req.params.id);
            if (!formData) throw 'Không tìm thấy quyết định';
            const { rows: dssvKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ qdId: req.params.id }));
            const workBook = app.excel.create();
            const columns = [
                { header: 'STT', key: 'stt', width: 6, height: 30, vertical: 'middle' },
                { header: 'MSSV', key: 'mssv', width: 15, height: 30 },
                { header: 'HỌ TÊN', key: 'hoTen', width: 20, height: 30 },
                { header: 'KHOA', key: 'tenKhoa', width: 15, wrapText: false, height: 30 },
                // { header: 'KHÓA SINH VIÊN', key: 'khoaSinhVien', width: 20, wrapText: false },
            ];
            const sheetOption = {
                properties: { defaultRowHeight: 30 },
                alignment: { vertical: 'middle', wrapText: false },
            };
            const sheetMapper = {};
            const workSheetCtsv = workBook.addWorksheet('Danh sách tổng', sheetOption);
            workSheetCtsv.columns = [
                ...columns,
                { header: 'HÌNH THỨC KỶ LUẬT', key: 'hinhThucKyLuatText', width: 20, wrapText: false },
            ];
            workSheetCtsv.getRow(1).alignment = sheetOption.alignment;
            dssvKyLuat.forEach(({ mssv, hoTen, tenKhoa, hinhThucKyLuatText, }, index) => {
                workSheetCtsv.addRow({ stt: index + 1, mssv, hoTen, tenKhoa, hinhThucKyLuatText, }, 'i');

                if (!sheetMapper[hinhThucKyLuatText]) {
                    sheetMapper[hinhThucKyLuatText] = workBook.addWorksheet(hinhThucKyLuatText, sheetOption);
                    sheetMapper[hinhThucKyLuatText].columns = columns;
                    sheetMapper[hinhThucKyLuatText].getRow(1).alignment = sheetOption.alignment;
                }
                let wsTypeKyLuat = sheetMapper[hinhThucKyLuatText];
                wsTypeKyLuat.addRow({ stt: wsTypeKyLuat.rowCount, mssv, hoTen, tenKhoa });
            });
            const fileName = `${formData.soQuyetDinh.replace('/', '-')}_DS_KY_LUAT.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/check-mssv', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const mssv = req.query.mssv?.split(/\,\s*/);
            const listTinhTrang = await app.model.dmTinhTrangSinhVien.getAll(),
                mapTenTinhTrang = Object.assign({}, ...listTinhTrang.map(item => ({ [item.ma]: item.ten })));

            const items = mssv && mssv.length ?
                await app.model.fwStudent.getAll({ statement: 'mssv in (:listMssv)', parameter: { listMssv: mssv } }, 'mssv, ho, ten, tinhTrang') : [];
            items.forEach(item => {
                item.tenTinhTrangTruoc = mapTenTinhTrang[item.tinhTrang];
            });
            res.send({ items, notFound: mssv.filter(ms => !items.some(item => item.mssv == ms)) });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/get-dssv', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const qdId = req.query.qdId;
            const { rows: items } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ qdId }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('DsKyLuatData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dsKyLuatImportData(fields, files, params, done), done, 'ctsvKyLuat:write')
    );

    const dsKyLuatImportData = async (fields, files, params, done) => {
        if (files.DsKyLuatData && files.DsKyLuatData.length && files.DsKyLuatData[0].path) {
            const srcPath = files.DsKyLuatData[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                // Lay du lieu he thong
                const mapTenTinhTrang = await app.model.dmTinhTrangSinhVien.getAll().then(list => list.reduce((cur, item) => (cur[item.ma] = item.ten, cur), {}));
                const worksheet = workbook.worksheets[0];
                if (worksheet) {
                    let listMssv = worksheet.getColumn('A').values.slice(2);
                    const listHinhThuc = worksheet.getColumn('B').values.slice(2);
                    listMssv = listMssv.map((item, index) => ({
                        mssv: item,
                        hinhThucKyLuat: listHinhThuc[index]
                    }));
                    let mapMssv = listMssv.reduce((cur, item, index) => {
                        cur[item.mssv] = { ...item, index: index + 2 };
                        return cur;
                    }, {});
                    if (listMssv.length) {
                        const items = [];
                        const listSv = await app.model.fwStudent.getAll({ statement: 'mssv in (:listMssv)', parameter: { listMssv: listMssv.map(item => item.mssv.toString()) } });
                        const errors = listMssv.filter(item => listSv.every(sv => sv.mssv != item.mssv)).map(sv => ({ index: mapMssv[sv.mssv]?.index, error: `Sinh viên không tồn tại (${sv.mssv})` }));
                        let svDmHinhThuc = await app.model.svDmHinhThucKyLuat.getAll({ kichHoat: 1 });
                        svDmHinhThuc = svDmHinhThuc.mapArrayToObject('id');
                        listSv.forEach(sv => {
                            let item = mapMssv[sv.mssv];
                            let hinhThucKyLuat = svDmHinhThuc[item.hinhThucKyLuat];
                            try {
                                if (!hinhThucKyLuat) throw `Mã hình thức không hợp lệ (${item.hinhThucKyLuat})`;
                                items.push({
                                    mssv: sv.mssv,
                                    hoTen: sv.ho + ' ' + sv.ten,
                                    tinhTrangTruoc: sv.tinhTrang,
                                    tenTinhTrangTruoc: mapTenTinhTrang[sv.tinhTrang],
                                    hinhThucKyLuat: item.hinhThucKyLuat,
                                    hinhThucKyLuatText: hinhThucKyLuat.ten,
                                    chuyenTinhTrang: hinhThucKyLuat.chuyenTinhTrang,
                                });
                            } catch (error) {
                                errors.push({ index: item.index, error });
                            }
                        });
                        done({ items, errors: errors.sort((a, b) => a.index - b.index) });
                    } else {
                        done({ error: 'Không tìm thấy dữ liệu!' });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    app.get('/api/ctsv/qua-trinh/ky-luat/template', app.permission.check('manageMienGiam:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DSSV');

            ws.columns = [
                { header: 'MSSV', key: 'stt', width: 10 },
                { header: 'Mã hình thức kỷ luật', key: 'maHinhThucKyLuat', width: 30 },
            ];

            const wsHinhThuc = workBook.addWorksheet('Hình thức kỷ luật');
            wsHinhThuc.columns = [
                { header: 'Mã', key: 'id', width: 10 },
                { header: 'Tên hình thức', key: 'ten', width: 10 },
            ];
            const dsHinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({ kichHoat: 1 });
            dsHinhThucKyLuat.forEach(item => wsHinhThuc.addRow(item));

            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = { name: 'Times New Roman' };

            const fileName = 'TEMPLATE_KY_LUAT.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            console.error(error);
        }
    });

    const buildDieuKien = (dsDieuKien) => {
        const res = {};
        dsDieuKien.forEach(({ ghiChu, expression, value }) => {
            // res[ghiChu] = res[ghiChu] ?? { max: Math.max(), min: Math.min() };
            res[ghiChu] = res[ghiChu] ?? { max: null, min: null };
            if (['<=', '<', '=='].includes(expression))
                res[ghiChu].max = Math.max(res[ghiChu].max ?? Math.max(), value);
            if (['>=', '>', '=='].includes(expression))
                res[ghiChu].min = Math.min(res[ghiChu].min ?? Math.min(), value);
        });
        return res;
    };

    app.post('/api/ctsv/qua-trinh/ky-luat/dssv-cau-hinh', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { cauHinh } = req.body;
            let { namHoc, hocKy, heDaoTao = '', khoaSinhVien = '', khoa = '' } = cauHinh;
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: cauHinh.dmCauHinhKyLuat }, '*', 'id ASC');
            const filter = {
                listKhoaSinhVien: khoaSinhVien.toString(),
                listHeDaoTao: heDaoTao.toString(),
                listFaculty: khoa.toString(),
                ...buildDieuKien(dsDieuKien)
            };
            console.log({ namHoc, hocKy, filter: app.utils.stringify(filter) });
            const { rows: listSinhVien } = await app.model.svQtKyLuatCauHinhXet.getDssvFilter(namHoc, hocKy, app.utils.stringify(filter));
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll();
            // const lichSuKyLuat = await app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu(listSinhVien.length ? listSinhVien.map(item => item.mssv) : ['-1']);
            let { rows: lichSuKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ hinhThucKyLuat: maHinhThucCanhCao }));
            lichSuKyLuat = lichSuKyLuat.groupBy('mssv');
            res.send({ items: listSinhVien.map(sv => ({ ...sv, ...app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat(sv, dsDieuKien, hinhThucKyLuat, lichSuKyLuat[sv.mssv] || [], namHoc, hocKy) })) });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/qua-trinh/ky-luat/cau-hinh-tao-moi', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { cauHinh } = req.body;
            const { namHoc, hocKy, khoaSinhVien, heDaoTao, khoa, dmCauHinhId, dssvFilter } = cauHinh;
            const cauHinhCreate = await app.model.svQtKyLuatCauHinhXet.create({ namHoc, hocKy, khoaSinhVien: khoaSinhVien.join(', '), heDaoTao: heDaoTao.join(', '), khoa: khoa.join(', '), dmCauHinhId });
            await Promise.all(
                dssvFilter?.length ? dssvFilter.map(sv => (
                    app.model.svQtKyLuatDssvDuKien.create({
                        ...sv,
                        cauHinhId: cauHinhCreate.id
                    })
                )) : []);
            res.send({ item: cauHinhCreate });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/qua-trinh/ky-luat/cau-hinh-update', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id, cauHinh } = req.body;
            const { namHoc, hocKy, khoaSinhVien, heDaoTao, khoa, dmCauHinhId, dssvThem, dssvXoa, dssvCuuXet, dssvKhongTinhBoSung } = cauHinh;
            const cauHinhCreate = await app.model.svQtKyLuatCauHinhXet.update({ id }, { namHoc, hocKy, khoaSinhVien: khoaSinhVien.join(', '), heDaoTao: heDaoTao.join(', '), khoa: khoa.join(', '), dmCauHinhId });
            await Promise.all([
                // Thêm và xóa sinh viên
                (dssvXoa?.length) && app.model.svQtKyLuatDssvDuKien.delete({
                    statement: 'mssv in (:dsXoa) AND cauHinhId = :cauHinhId',
                    parameter: {
                        dsXoa: dssvXoa.map(sv => sv.mssv),
                        cauHinhId: id
                    }
                }),
                ...((dssvThem?.length) ? dssvThem.map(sv => {
                    app.model.svQtKyLuatDssvDuKien.create({
                        ...sv,
                        cauHinhId: cauHinhCreate.id
                    });
                }) : []),
                // Cập nhật danh sách cứu xét
                ...(dssvCuuXet?.length ? [
                    app.model.svQtKyLuatDssvDuKien.update({
                        statement: 'mssv in (:dsCuuXet) AND cauHinhId = :cauHinhId',
                        parameter: {
                            dsCuuXet: dssvCuuXet.length ? dssvCuuXet.map(sv => sv.mssv) : ['-1'],
                            cauHinhId: id
                        }
                    }, { isCuuXet: 1 }),
                    app.model.svQtKyLuatDssvDuKien.update({
                        statement: 'mssv not in (:dsCuuXet) AND cauHinhId = :cauHinhId',
                        parameter: {
                            dsCuuXet: dssvCuuXet.length ? dssvCuuXet.map(sv => sv.mssv) : ['-1'],
                            cauHinhId: id
                        }
                    }, { isCuuXet: 0 })
                ] : []),
                (dssvCuuXet == '') && app.model.svQtKyLuatDssvDuKien.update({
                    statement: 'cauHinhId = :cauHinhId',
                    parameter: {
                        cauHinhId: id
                    }
                }, { isCuuXet: 0 }),
                // Cập nhật tính kỷ luật bổ sung
                ...(dssvKhongTinhBoSung?.length ? [
                    app.model.svQtKyLuatDssvDuKien.update({
                        statement: 'mssv in (:dssvKhongTinhBoSung) AND cauHinhId = :cauHinhId',
                        parameter: {
                            dssvKhongTinhBoSung: dssvKhongTinhBoSung.length ? dssvKhongTinhBoSung.map(sv => sv.mssv) : ['-1'],
                            cauHinhId: id
                        }
                    }, { tinhBoSung: 0 }),
                    app.model.svQtKyLuatDssvDuKien.update({
                        statement: 'mssv not in (:dssvKhongTinhBoSung) AND cauHinhId = :cauHinhId',
                        parameter: {
                            dssvKhongTinhBoSung: dssvKhongTinhBoSung.length ? dssvKhongTinhBoSung.map(sv => sv.mssv) : ['-1'],
                            cauHinhId: id
                        }
                    }, { tinhBoSung: 1 })
                ] : []),
                (dssvKhongTinhBoSung == '') && app.model.svQtKyLuatDssvDuKien.update({
                    statement: 'cauHinhId = :cauHinhId',
                    parameter: { cauHinhId: id }
                }, { tinhBoSung: 1 }),
            ]);
            res.send({ item: cauHinhCreate });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/qua-trinh/ky-luat/cong-bo-khoa', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id, cauHinh } = req.body;
            const cauHinhCreate = await app.model.svQtKyLuatCauHinhXet.update({ id }, { ...cauHinh });
            res.send({ item: cauHinhCreate });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/cau-hinh/page/:pageNumber/:pageSize', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter);
            const page = await app.model.svQtKyLuatCauHinhXet.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/cau-hinh/dssv', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id } = req.query;
            const cauHinh = await app.model.svQtKyLuatCauHinhXet.get({ id }, '*');
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: cauHinh.dmCauHinhId }, '*', 'ID ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });

            cauHinh.dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            const { rows: listSinhVien } = await app.model.svQtKyLuatCauHinhXet.getDssvDuKien(id, '');
            const { namHoc, hocKy } = cauHinh;
            // const lichSuKyLuat = await app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu(listSinhVien.length ? listSinhVien.map(item => item.mssv) : ['-1']);
            let { rows: lichSuKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ hinhThucKyLuat: maHinhThucCanhCao }));
            lichSuKyLuat = lichSuKyLuat.groupBy('mssv');
            cauHinh.dssvDuKien = listSinhVien.map(sv => ({
                ...sv,
                ...app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat(sv, dsDieuKien, hinhThucKyLuat, lichSuKyLuat[sv.mssv] || [], namHoc, hocKy)
            }));
            res.send({ item: cauHinh });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/qua-trinh/ky-luat/cau-hinh/item', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id } = req.query;
            const cauHinh = await app.model.svQtKyLuatCauHinhXet.get({ id }, '*');
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: id }, '*', 'ID ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });
            cauHinh.dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            res.send({ item: cauHinh });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/qua-trinh/ky-luat/cau-hinh/delete', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id } = req.body;
            await Promise.all([
                app.model.svQtKyLuatDieuKien.delete({ cauHinhId: id }),
                app.model.svQtKyLuatCauHinhXet.delete({ id }),
                app.model.svQtKyLuatDssvDuKien.delete({ cauHinhId: id })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    const addNewWorkSheet = (workBook, workSheetName, dssv) => {
        const columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'MSSV', key: 'mssv', width: 15 },
            { header: 'HỌ TÊN', key: 'hoTenSinhVien', width: 20 },
            { header: 'TINH TRẠNG', key: 'tinhTrang', width: 20 },
            { header: 'KHOA', key: 'khoa', width: 15, wrapText: false },
            { header: 'KHÓA SINH VIÊN', key: 'khoaSinhVien', width: 20, wrapText: false },
            { header: 'ĐIỂM TRUNG BÌNH', key: 'diemTrungBinh', width: 20, wrapText: false },
            { header: 'ĐIỂM TRUNG BÌNH TÍCH LŨY', key: 'diemTrungBinhTichLuy', width: 20, wrapText: false },
            { header: 'HÌNH THỨC KỶ LUẬT', key: 'hinhThucKyLuat', width: 20, wrapText: false },
            { header: 'HÌNH THỨC KỶ LUẬT BỔ SUNG', key: 'hinhThucKyLuatBoSung', width: 25, wrapText: false },
            { header: 'GHI CHÚ KHOA', key: 'ghiChuKhoa', width: 50, wrapText: false },
            { header: 'GHI CHÚ CTSV', key: 'ghiChuCtsv', width: 50, wrapText: false },
        ];
        const workSheetCtsv = workBook.addWorksheet(workSheetName);
        workSheetCtsv.columns = columns;
        workSheetCtsv.getRow(1).alignment = { ...workSheetCtsv.getRow(1).alignment, vertical: 'middle', wrapText: false };
        workSheetCtsv.getRow(1).font = { name: 'Times New Roman' };
        dssv.forEach((item, index) => {
            workSheetCtsv.addRow({
                stt: index + 1,
                mssv: item.mssv,
                hoTenSinhVien: item.hoTen,
                khoa: item.tenKhoa,
                tinhTrang: item.tenTinhTrangTruoc,
                khoaSinhVien: item.khoaSinhVien,
                diemTrungBinh: item.diemTrungBinh,
                diemTrungBinhTichLuy: item.diemTrungBinhTichLuy,
                hinhThucKyLuat: item.hinhThucKyLuatText,
                hinhThucKyLuatBoSung: item.hinhThucKyLuatBoSungText,
                ghiChuKhoa: item.ghiChuKhoa,
                ghiChuCtsv: item.ghiChuCtsv

            }, 'i');
        });
    };

    app.get('/api/ctsv/qua-trinh/ky-luat/cau-hinh-dssv/download-excel', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {

            const { id } = req.query;
            const cauHinh = await app.model.svQtKyLuatCauHinhXet.get({ id }, '*');
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: cauHinh.dmCauHinhId }, '*', 'ID ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });
            cauHinh.dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            let { rows: listSinhVien } = await app.model.svQtKyLuatCauHinhXet.getDssvDuKien(id, '');
            const { namHoc, hocKy } = cauHinh;
            // const lichSuKyLuat = await app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu(listSinhVien.length ? listSinhVien.map(item => item.mssv) : ['-1']);
            let { rows: lichSuKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ hinhThucKyLuat: maHinhThucCanhCao }));
            lichSuKyLuat = lichSuKyLuat.groupBy('mssv');
            cauHinh.dssvDuKien = listSinhVien.map(sv => ({
                ...sv,
                ...app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat(sv, dsDieuKien, hinhThucKyLuat, lichSuKyLuat[sv.mssv] || [], namHoc, hocKy)
            }));
            const khoa = cauHinh.dssvDuKien.reduce((acc, sv) => {
                const { tenKhoa } = sv;
                if (!acc[tenKhoa]) {
                    acc[tenKhoa] = [];
                }
                acc[tenKhoa].push(sv);
                return acc;
            }, {});
            const dsKhoa = Object.keys(khoa);
            const workBook = app.excel.create();
            addNewWorkSheet(workBook, 'Danh sách tổng', cauHinh.dssvDuKien);
            dsKhoa.forEach(khoa => {
                addNewWorkSheet(workBook, khoa, cauHinh.dssvDuKien.filter(sv => sv.tenKhoa == khoa));
            });
            const fileName = 'DS_SV_KY_LUAT.xlsx';
            app.excel.attachment(workBook, res, fileName);
            // new Promise(resolve => {
            //     resolve(workBook);
            // }).then(workBook => {

            // });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/qua-trinh/ky-luat/them-ghi-chu-ctsv', app.permission.check('ctsvKyLuat:read'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const svKyLuatUpdate = await app.model.svQtKyLuatDssvDuKien.update({ id }, { ...changes });
            res.send({ item: svKyLuatUpdate });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

};
