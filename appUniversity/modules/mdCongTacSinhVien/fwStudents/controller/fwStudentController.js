module.exports = app => {

    const menuStudents = {
        parentMenu: app.parentMenu.students,
        menus: {
            6101: { title: 'Danh sách sinh viên', link: '/user/ctsv/list', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'student:manage', menu: menuStudents },
        { name: 'student:write' },
        { name: 'student:delete' },
        'student:export'
    );

    app.permissionHooks.add('staff', 'addRoleStudent', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'student:manage', 'student:write', 'student:export', 'student:dashboard');
            resolve();
        } else resolve();
    }));


    app.get('/user/ctsv/list', app.permission.check('student:manage'), app.templates.admin);
    app.get('/user/ctsv/import', app.permission.check('developer:login'), app.templates.admin);
    app.get('/user/ctsv/profile/:mssv', app.permission.check('student:manage'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------

    app.get('/api/ctsv/student/page/:pageNumber/:pageSize', app.permission.orCheck('student:manage', 'tcHocPhi:manage', 'staff:form-teacher', 'developer:switched', 'tccbLop:manage', 'dtQuanLyQuyetDinh:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            let sortTerm = 'ten_ASC';
            const searchTerm = typeof condition === 'string' ? condition : '';
            if (filter?.sortTerm) sortTerm = filter?.sortTerm;
            let page = await app.model.fwStudent.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/item/:mssv', app.permission.orCheck('student:manage', 'staff:form-teacher', 'tcHocPhi:read', 'tccbLop:manage', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let dataSinhVien = await app.model.fwStudent.get({ mssv }, '*');
            const dataLop = await app.model.dtLop.get({ maLop: dataSinhVien.lop }, '*'),
                dataCtdt = await app.model.dtKhungDaoTao.get({ maCtdt: dataSinhVien.maCtdt }),
                dataTamTru = dataSinhVien.maTamTru ? await app.model.svThongTinTamTru.get({ id: dataSinhVien.maTamTru }) : {},
                dataNoiTru = dataSinhVien.maNoiTru ? await app.model.svThongTinNoiTru.get({ id: dataSinhVien.maNoiTru }) : {};
            dataSinhVien = app.clone({}, dataSinhVien, dataLop || {}, { dataTamTru }, { dataNoiTru });
            dataSinhVien.dataCtdt = dataCtdt || {};
            const dataTotNghiep = await app.model.svThongTinTotNghiep.getAll({ mssv });
            dataSinhVien.dataTotNghiep = dataTotNghiep ? dataTotNghiep.groupBy('trinhDo') : {};
            dataSinhVien.ghiChu = await app.model.fwStudentGhiChu.getAll({ mssv });
            res.send({ items: dataSinhVien });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/ttsv/:mssv', app.permission.check('student:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let dataSinhVien = await app.model.fwStudent.get({ mssv }, '*');
            let khoa = await app.model.dmDonVi.get({ ma: dataSinhVien.khoa });
            dataSinhVien.tenKhoa = khoa.ten;

            res.send({ items: dataSinhVien });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/item', app.permission.check('student:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            data.bacDaoTao = 'DH';
            if (await app.model.fwStudent.get({ mssv: data.mssv })) throw `Đã tồn tại MSSV ${data.mssv}`;
            ({ khoa: data.khoa } = await app.model.dtNganhDaoTao.get({ maNganh: data.maNganh }, 'khoa'));
            const item = await app.model.fwStudent.create(data);
            await Promise.all([
                app.model.fwStudent.initCtdtRedis(data.mssv),
                app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(data.mssv)
            ]);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/item/create-multi', app.permission.check('student:manage'), async (req, res) => {
        try {
            const { dssv } = req.body;
            for (let i = 0; i < dssv.length; i++) {
                const studentInfo = { ...dssv[i] };
                const checkStudent = await app.model.fwStudent.get({ mssv: studentInfo.mssv }, 'mssv, ten');
                if (!checkStudent) {
                    const item = await app.model.fwStudent.create({ ...studentInfo });
                    if (item) {
                        await Promise.all([
                            app.model.fwStudent.initCtdtRedis(studentInfo.mssv),
                            app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(studentInfo.mssv)
                        ]);
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/item/:mssv', app.permission.check('student:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const mssv = req.params.mssv;
            const changes = req.body.changes;
            if (changes.gioiTinh) {
                changes.gioiTinh = parseInt(changes.gioiTinh);
            }
            let dataTruoc = {}, dataSau = {};
            let dataSinhVien = await app.model.fwStudent.get({ mssv }, '*');
            dataSinhVien.noiTru = !!dataSinhVien.maTamTru || !!dataSinhVien.maNoiTru;
            const dataTamTru = dataSinhVien.maTamTru ? await app.model.svThongTinTamTru.get({ id: dataSinhVien.maTamTru }, 'tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha', 'DATE_MODIFIED DESC')
                : { tamTruMaTinh: '', tamTruMaHuyen: '', tamTruMaXa: '', tamTruSoNha: '' };
            const dataNoiTru = dataSinhVien.maNoiTru ? await app.model.svThongTinNoiTru.get({ id: dataSinhVien.maNoiTru }, 'ktxTen, ktxToaNha, ktxSoPhong', 'DATE_MODIFIED DESC')
                : { ktxTen: '', ktxToaNha: '', ktxSoPhong: '' };
            dataSinhVien = app.clone(dataSinhVien, dataNoiTru || {}, dataTamTru || {});
            for (let key in changes) {
                if (key == 'canEdit') {
                    continue;
                }
                if ((changes[key] || dataSinhVien[key]) && changes[key] != dataSinhVien[key]) {
                    dataTruoc[key] = dataSinhVien[key];
                    dataSau[key] = changes[key];
                }
            }
            if (changes.canEdit) {
                let items = await app.model.fwStudent.update({ mssv }, changes);
                res.send({ items });
            } else if (dataSau && Object.keys(dataSau).length === 0) {
                res.send({ error: { message: 'Cập nhật thất bại do không có sự thay đổi' } });
            } else {
                Object.assign(changes, { maNoiTru: '', maTamTru: '' }); // Reset thong tin noi/tam tru
                const [table, ma, cols] = Number(changes.noiTru) == 1 ?
                    ['svThongTinNoiTru', 'maNoiTru', 'ktxTen,ktxToaNha,ktxSoPhong'] :
                    ['svThongTinTamTru', 'maTamTru', 'tamTruMaTinh,tamTruMaHuyen,tamTruMaXa,tamTruSoNha']
                    ;
                const isDiff = cols.split(',').some(key => Object.keys(dataSau).includes(key));
                ({ id: changes[ma] } = isDiff ? await app.model[table].create({ ...changes, dateModified: Date.now(), mssv }) : { id: dataSinhVien[ma] });
                let { item: items } = await app.model.fwStudent.updateWithLog(req.session.user, { mssv }, { ...changes });
                await app.model.fwStudent.initCtdtRedis(mssv);
                // await app.model.fwStudentUpdateLog.create({
                //     mssv,
                //     dataTruoc: JSON.stringify(dataTruoc),
                //     dataSau: JSON.stringify(dataSau),
                //     staffHandle: user.email,
                //     handleTime: Date.now()
                // });
                ('ghiChu' in changes) && await app.model.fwStudentGhiChu.updateGhiChu(mssv, changes.ghiChu, user.email);
                await app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(mssv);
                res.send({ items });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/mass-update-sinh-vien', app.permission.check('student:write'), async (req, res) => {
        try {
            const { dsMssv, changes } = req.body,
                condition = {
                    statement: 'MSSV in (:dsMssv)',
                    parameter: { dsMssv }
                };
            await app.model.fwStudent.update(condition, changes);
            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    // app.delete('/api/ctsv/:mssv', app.permission.check('student:delete'), (req, res) => {
    //     app.model.fwStudent.delete({ mssv: req.params.mssv }, (error) => res.send({ error }));
    // });

    const password = 'ctsvussh@2022';
    app.post('/api/ctsv/login-test', app.permission.orCheck('student:write', 'tcSetting:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const validEmails = ['ctsv05@hcmussh.edu.vn'];
            if (!validEmails.includes(data.email)) throw 'Email sinh viên không hợp lệ';
            if (data.pass != password) throw 'Sai mật khẩu!';
            const sinhVien = await app.model.fwStudent.get({ emailTruong: data.email });
            if (sinhVien) {
                const user = { email: sinhVien.emailTruong, lastName: sinhVien.ho, firstName: sinhVien.ten, active: 1, isStudent: 1, studentId: sinhVien.mssv };
                app.updateSessionUser(req, user, () => {
                    !app.isDebug && req.session.save();
                    res.send({ user });
                });
            } else {
                throw 'Sinh viên test không tồn tại!';
            }
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/ctsv/image-card/:mssv', app.permission.check('student:write'), async (req, res) => {
        try {
            let mssv = req.params.mssv;
            let stud = await app.model.fwStudent.get({ mssv }, 'anhThe,namTuyenSinh');
            const path = app.path.join(app.assetPath, 'image-card', stud.namTuyenSinh.toString(), stud.anhThe);

            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.send({ error: 'No valid file' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('FwSinhVienImport', (req, fields, files, params, done) =>
        app.permission.has(req, () => sinhVienImportHandler(fields, files, done), done, 'developer:login'));


    const sinhVienImportHandler = async (fields, files, done) => {
        const khuVucMapper = {
            '1': 'KV1',
            '2': 'KV2',
            '2NT': 'KV2-NT',
            '3': 'KV3',
        };
        const maPhuongThuc = [];
        const validateRow = async (row) => {
            const sinhVien = await app.model.fwStudent.get({ mssv: row.mssv });
            if (sinhVien) throw `Sinh viên ${row.mssv} đã tồn tại`;

            const nganh = await app.model.dtNganhDaoTao.get({ maNganh: row.maNganh });
            if (!nganh) throw `Sinh viên ${row.mssv}-${row.cmnd} có mã ngành không hợp lệ (${row.maNganh})`;

            row.nganh = nganh;
            row.khuVuc = khuVucMapper[row.khuVuc];

            if (row.doiTuong == 0 || !row.doiTuong) row.doiTuong = '00';
            if (!maPhuongThuc.includes(row.maPhuongThuc)) {
                maPhuongThuc.push(row.maPhuongThuc);
                if (!await app.model.dmPhuongThucTuyenSinh.get({ ma: row.maPhuongThuc })) {
                    await app.model.dmPhuongThucTuyenSinh.create({ ma: row.maPhuongThuc, kichHoat: 1, ten: row.phuongThuc });
                }
            }
        };
        let worksheet = null, lastModified = new Date().getTime();
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'FwSinhVienImport' && files.FwSinhVienImport && files.FwSinhVienImport.length) {
            const srcPath = files.FwSinhVienImport[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const errors = [];
                    let sum = 0;
                    let index = 2;
                    try {
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                break;
                            } else {
                                const
                                    mssv = `${worksheet.getCell('A' + index).value}`.trim(),
                                    cmnd = `${worksheet.getCell('B' + index).value}`.trim(),
                                    ho = worksheet.getCell('C' + index).value,
                                    ten = worksheet.getCell('D' + index).value,
                                    maNganh = worksheet.getCell('F' + index).value,
                                    toHop = worksheet.getCell('H' + index).value,
                                    maPhuongThuc = worksheet.getCell('I' + index).value,
                                    phuongThuc = worksheet.getCell('J' + index).value,
                                    diemXetTuyen = worksheet.getCell('K' + index).value,
                                    diemThi = worksheet.getCell('O' + index).value,
                                    gioiTinh = worksheet.getCell('M' + index).value,
                                    ngaySinh = worksheet.getCell('N' + index).value,
                                    khuVuc = worksheet.getCell('P' + index).value,
                                    doiTuong = worksheet.getCell('Q' + index).value,
                                    emailTruong = worksheet.getCell('R' + index).value;
                                const row = { mssv, phuongThuc, diemThi, cmnd, ho, ten, maNganh, toHop, maPhuongThuc, diemXetTuyen, gioiTinh, ngaySinh, khuVuc, doiTuong, emailTruong, nganh: {} };
                                await validateRow(row);
                                index++;
                                items.push(row);
                            }
                        }
                    } catch (error) {
                        return done({ error });
                    }
                    await Promise.all(items.map(async row => {
                        try {
                            const ngaySinhData = row.ngaySinh.split('/');
                            const ngaySinh = new Date(`${ngaySinhData[1]}-${ngaySinhData[0]}-${ngaySinhData[2]}`);
                            const isCLC = row.maNganh.toLowerCase().includes('clc');
                            const res = await app.model.fwStudent.create({
                                ho: row.ho, ten: row.ten, ngaySinh: ngaySinh.getTime(),
                                gioiTinh: row.gioiTinh.toLowerCase() == 'nam' ? 1 : 2, loaiSinhVien: 'L1', maNganh: row.maNganh,
                                tinhTrang: 3, emailTruong: row.emailTruong, khoa: row.nganh.khoa, phuongThucTuyenSinh: row.maPhuongThuc,
                                maKhoa: isCLC ? 'CLC2022' : 'DHCQ2022', loaiHinhDaoTao: isCLC ? 'CLC' : 'CQ',
                                cmnd: row.cmnd, namTuyenSinh: Date.now().getFullYear(), mssv: row.mssv, bacDaoTao: 'DH', doiTuongTuyenSinh: row.doiTuong,
                                khuVucTuyenSinh: row.khuVuc, lastModified, canEdit: 1, diemThi: row.diemThi
                            });
                            sum += 1;
                            return res;
                        } catch (error) {
                            console.error(error);
                            row.error = error;
                            errors.push(row);
                        }
                    }));
                    done({ errors, sum });

                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    app.get('/api/ctsv/get-syll', app.permission.check('student:write'), async (req, res) => {
        try {
            let { mssv, namTuyenSinh } = req.query;
            if (parseInt(namTuyenSinh) < new Date().getFullYear()) return res.send({ error: 'Không thuộc đối tượng nhập học!' });
            const filePath = app.path.join(app.assetPath, 'so-yeu-ly-lich', namTuyenSinh?.toString() || new Date().getFullYear().toString(), mssv.toString() + '.pdf');
            if (app.fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.send({ error: 'No valid file!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/nam-tuyen-sinh', app.permission.orCheck('student:write', 'tcHocPhi:write'), async (req, res) => {
        try {
            const data = await app.model.fwStudent.getNamTuyenSinhList();
            res.send({ items: data.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/download-excel', app.permission.check('student:export'), async (req, res) => {
        if (req.query.usePsc == 1) {
            await downloadExcelPsc(req, res);
        } else {
            await downloadExcel(req, res);
        }
    });

    const downloadExcel = async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            const data = await app.model.fwStudent.downloadExcel(searchTerm || '', filter.replaceAll(' ', '+')),
                list = data.rows;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');
            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(list[0] || {}).map(key => ({ header: key.toString(), key, width: 20 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'STUDENT_DATA.xlsx');
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    };

    const downloadExcelPsc = async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            const data = await app.model.fwStudent.downloadExcel(searchTerm || '', filter.replaceAll(' ', '+')),
                list = data.rows;
            const headerData = app.utils.parse(app.fs.readFileSync(app.path.join(__dirname, '..', 'resource', 'sinhVienHeader.json')));
            const dataMapper = app.utils.parse(app.fs.readFileSync(app.path.join(__dirname, '..', 'resource', 'DataMapper.json')));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('SinhVien');
            ws.columns = headerData;
            list.forEach((item, index) => {
                Object.keys(item).forEach((key) => {
                    if (dataMapper[key] && item[key]) {
                        const dbId = item[key];

                        if (key == 'maTruongTotNghiepDaiHoc' || (key == 'maTruongTotNghiepCaoDang' && item.maTruongTotNghiepDaiHoc == null)) {
                            item.maTruong = dataMapper[key][dbId]?.id || '';
                        } else {
                            item[key] = dataMapper[key][dbId]?.id || '';
                        }
                    }
                });
                ws.addRow(item, index === 0 ? 'n' : 'i');
            });
            const listNganh = await app.model.dtNganhDaoTao.getAll({ kichHoat: 1 });
            const listChuyenNganh = await app.model.dtChuyenNganh.getAll({ kichHoat: 1 });
            const listLop = await app.model.dtLop.getAll({ kichHoat: 1 });
            const wsNganh = workBook.addWorksheet('NGANH');
            wsNganh.columns = [
                { header: 'Mã', key: 'maNganh', width: 15 },
                { header: 'Tên', key: 'tenNganh', width: 30 },
                { header: 'Mã lớp', key: 'maLop', width: 30 },
            ];
            const wsChuyenNganh = workBook.addWorksheet('CHUYEN_NGANH');
            wsChuyenNganh.columns = [
                { header: 'Mã', key: 'ma', width: 15 },
                { header: 'Tên', key: 'ten', width: 30 },
                { header: 'Mã lớp', key: 'maLop', width: 30 }
            ];
            const wsLop = workBook.addWorksheet('LOP');
            wsLop.columns = [
                { header: 'Mã lớp', key: 'maLop', width: 15 },
                { header: 'Tên lớp', key: 'tenLop', width: 20 },
                { header: 'Mã ngành', key: 'maNganh', width: 20 },
                { header: 'Mã chuyên ngành', key: 'maChuyenNganh', width: 20 },
                { header: 'Niên khóa', key: 'nienKhoa', width: 20 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 20 },
            ];
            listNganh.map(item => wsNganh.addRow(item, 'n'));
            listChuyenNganh.map(item => wsChuyenNganh.addRow(item, 'n'));
            listLop.map(item => wsLop.addRow(item, 'n'));

            app.excel.attachment(workBook, res, 'STUDENT_DATA_PSC.xlsx');
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    };

    // Lich su chung nhan

    app.get('/api/ctsv/chung-nhan/:pageNumber/:pageSize', app.permission.check('manageForm:ctsv'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = req.query.pageCondition ? req.query.pageCondition : '';
            const page = await app.model.svManageForm.searchPage(_pageNumber, _pageSize, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/ctdt-bang-diem', app.permission.check('student:manage'), async (req, res) => {
        try {
            const mssvFilter = req.query.mssv;
            const items = await app.model.dtDangKyHocPhan.getListCtdt(JSON.stringify({ mssvFilter }));
            const diemRotMon = await app.model.dtCauHinhDiem.getValue('rotMon');
            res.send({ items: items.rows, diemRotMon });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/drl-info', app.permission.check('student:manage'), async (req, res) => {
        try {
            const mssvFilter = req.query.mssv;
            const items = await app.model.svDrlDanhGia.getData(mssvFilter.toString());
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/upload-dssv/template', app.permission.check('student:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Upload dssv');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên lót', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 10 },
                { header: 'Mã giới tính', key: 'gioiTinh', width: 10 },
                { header: 'Ngày sinh (DD/MM/YYYY)', key: 'ngaySinh', width: 15 },
                { header: 'Số cccd (cmnd)', key: 'cmnd', width: 15 },
                { header: 'Nơi sinh mã tỉnh', key: 'noiSinhMaTinh', width: 15 },
                { header: 'Thường trú mã tỉnh', key: 'thuongTruMaTinh', width: 15 },
                { header: 'Thường trú mã huyện', key: 'thuongTruMaHuyen', width: 15 },
                { header: 'Thường trú mã xã', key: 'thuongTruMaXa', width: 15 },
                { header: 'Số nhà, đường', key: 'thuongTruSoNha', width: 30 },
                { header: 'Năm tuyển sinh', key: 'namTuyenSinh', width: 8 },
                { header: 'Mã hệ đào tạo', key: 'loaiHinhDaoTao', width: 15 },
                { header: 'Mã ngành', key: 'maNganh', width: 15 },
                { header: 'Mã lớp', key: 'lop', width: 15 },
                { header: 'Mã tình trạng', key: 'tinhTrang', width: 15 },
                { header: 'Ngày nhập học (DD/MM/YYYY)', key: 'ngayNhapHoc', width: 15 },
                { header: 'Email', key: 'emailCaNhan', width: 15 },
                { header: 'SDT cá nhân', key: 'dienThoaiCaNhan', width: 15 },
                { header: 'Tên cha', key: 'tenCha', width: 15 },
                { header: 'SĐT cha', key: 'ngheNghiepCha', width: 15 },
                { header: 'Tên mẹ', key: 'tenMe', width: 15 },
                { header: 'SĐT mẹ', key: 'ngheNghiepMe', width: 15 },
                { header: 'Tên người liên lạc', key: 'tenNguoiLienLac', width: 20 },
                { header: 'SĐT người liên lạc', key: 'sdtNguoiLienLac', width: 15 },
            ];
            ws.addRow({
                mssv: '12345',
                ho: 'student',
                ten: 'test',
                gioiTinh: '01',
                ngaySinh: '01/02/2023',
                cmnd: '070701011660',
                noiSinhMaTinh: '89',
                thuongTruMaTinh: '89',
                thuongTruMaHuyen: '893',
                thuongTruMaXa: '30649',
                thuongTruSoNha: '123/45 abc',
                namTuyenSinh: '2022',
                loaiHinhDaoTao: 'CQ',
                maNganh: '7320101',
                lop: '22603',
                tinhTrang: '1',
                ngayNhapHoc: '15/08/2022',
                emailCaNhan: 'test@gmail.com',
                dienThoaiCaNhan: '0909772886'
            });

            //Dm gioi tinh
            const wsDmGioiTinh = workBook.addWorksheet('Dm giới tính');
            wsDmGioiTinh.columns = [
                { header: 'Mã', key: 'ma', width: 5 },
                { header: 'Tên', key: 'ten', width: 30 },
            ];
            const dsGioiTinh = await app.model.dmGioiTinh.getAll({ kichHoat: 1 });
            dsGioiTinh.map(item => ({ ...item, ten: JSON.parse(item.ten).vi })).forEach(item => wsDmGioiTinh.addRow(item));
            //Dm tình trạng
            const wsDmTinhTrang = workBook.addWorksheet('Dm tình trạng');
            wsDmTinhTrang.columns = [
                { header: 'Mã', key: 'ma', width: 5 },
                { header: 'Tên', key: 'ten', width: 30 },
            ];
            const dsTinhTrang = await app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 });
            dsTinhTrang.forEach(item => wsDmTinhTrang.addRow(item));
            // Dm ngành
            const wsDmNganh = workBook.addWorksheet('Dm ngành');
            wsDmNganh.columns = [
                { header: 'Mã ngành', key: 'maNganh', width: 10 },
                { header: 'Tên ngành', key: 'tenNganh', width: 30 },
            ];
            const dsNganh = await app.model.dtNganhDaoTao.getAll({ kichHoat: 1 }, 'tenNganh, maNganh');
            dsNganh.forEach(item => wsDmNganh.addRow(item));
            //Dm hệ đào tạo
            const wsDmHeDaoTao = workBook.addWorksheet('Dm hệ đào tạo');
            wsDmHeDaoTao.columns = [
                { header: 'Mã', key: 'ma', width: 10 },
                { header: 'Hệ đào tạo', key: 'ten', width: 30 },
            ];
            const dsHeDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
            dsHeDaoTao.forEach(item => wsDmHeDaoTao.addRow(item));
            //Dm lớp
            const wsDmLop = workBook.addWorksheet('Dm lớp');
            wsDmLop.columns = [
                { header: 'Mã lớp', key: 'maLop', width: 10 },
                { header: 'Tên lớp', key: 'tenLop', width: 10 },
                { header: 'Mã ngành', key: 'maNganh', width: 10 },
                { header: 'Khóa sinh viên', key: 'khoaSinhVien', width: 10 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 10 },
            ];
            const dsLop = await app.model.dtLop.getAll({ kichHoat: 1, loaiLop: 'N' }, 'maLop, tenLop, maNganh, khoaSinhVien, heDaoTao', 'khoaSinhVien DESC');
            dsLop.forEach(item => wsDmLop.addRow(item));
            //Dm tinh thanh
            const wsDmTinhThanh = workBook.addWorksheet('Dm tỉnh thành');
            wsDmTinhThanh.columns = [
                { header: 'Mã', key: 'ma', width: 5 },
                { header: 'Tên', key: 'ten', width: 30 },
            ];
            const dsTinhThanh = await app.model.dmTinhThanhPho.getAll({ kichHoat: 1 });
            dsTinhThanh.forEach(item => wsDmTinhThanh.addRow(item));
            //Dm quan huyen
            const wsDmQuanHuyen = workBook.addWorksheet('Dm quận huyện');
            wsDmQuanHuyen.columns = [
                { header: 'Mã', key: 'maQuanHuyen', width: 5 },
                { header: 'Tên quận huyện', key: 'tenQuanHuyen', width: 30 },
                { header: 'Mã tỉnh thành phố', key: 'maTinhThanhPho', width: 30 },
            ];
            const dsQuanHuyen = await app.model.dmQuanHuyen.getAll({ kichHoat: 1 });
            dsQuanHuyen.forEach(item => wsDmQuanHuyen.addRow(item));
            //Dm phuong xa
            const wsDmPhuongXa = workBook.addWorksheet('Dm phường xã');
            wsDmPhuongXa.columns = [
                { header: 'Mã', key: 'maPhuongXa', width: 5 },
                { header: 'Tên phường xã', key: 'tenPhuongXa', width: 30 },
                { header: 'Mã quận huyện', key: 'maQuanHuyen', width: 30 },
            ];
            const dsPhuongXa = await app.model.dmPhuongXa.getAll({ kichHoat: 1 });
            dsPhuongXa.forEach(item => wsDmPhuongXa.addRow(item));
            app.excel.attachment(workBook, res, 'DSSV_UPLOAD_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.uploadHooks.add('DssvImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dssvImportData(fields, files, params, done), done, 'student:manage')
    );

    const changeArrayToObject = (arr, key) => {
        const resultObject = {};
        arr.forEach(item => {
            resultObject[item[key]] = {
                ...item
            };
        });
        return resultObject;
    };

    const changeDateTextToNumber = (value) => {
        if (value) {
            // const [d, m, y] = value.toString().split(/[,.\s\/\-_]/);
            const [d, m, y] = value.toString().split('/');
            const mil = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
            return isNaN(mil) ? '' : mil;
        } else {
            return '';
        }
    };

    const dssvImportData = async (fields, files, params, done) => {
        try {
            let worksheet = null;
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DssvImportData' && files.DssvImportData) {
                const srcPath = files.DssvImportData[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (workbook) {

                    app.fs.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    if (worksheet) {
                        const items = [];
                        const failed = [];
                        let dsGioiTinh = await app.model.dmGioiTinh.getAll({ kichHoat: 1 });
                        dsGioiTinh = changeArrayToObject(dsGioiTinh, 'ma');
                        let dsTinhThanh = await app.model.dmTinhThanhPho.getAll({ kichHoat: 1 });
                        dsTinhThanh = changeArrayToObject(dsTinhThanh, 'ma');
                        let dsQuanHuyen = await app.model.dmQuanHuyen.getAll({ kichHoat: 1 });
                        dsQuanHuyen = changeArrayToObject(dsQuanHuyen, 'maQuanHuyen');
                        let dsPhuongXa = await app.model.dmPhuongXa.getAll({ kichHoat: 1 });
                        dsPhuongXa = changeArrayToObject(dsPhuongXa, 'maPhuongXa');
                        let dsHeDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
                        dsHeDaoTao = changeArrayToObject(dsHeDaoTao, 'ma');
                        let dsNganh = await app.model.dtNganhDaoTao.getAll({ kichHoat: 1 }, 'tenNganh, maNganh, khoa');
                        dsNganh = changeArrayToObject(dsNganh, 'maNganh');
                        let dsTinhTrang = await app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 });
                        dsTinhTrang = changeArrayToObject(dsTinhTrang, 'ma');

                        let index = 2;
                        const mssvNew = {};
                        try {
                            while (true) {
                                if (!worksheet.getCell('A' + index).value) {
                                    break;
                                } else {
                                    try {
                                        const mssv = worksheet.getCell('A' + index).value?.toString().trim() || '',
                                            student = await app.model.fwStudent.get({ mssv });
                                        if (mssv && !student && !mssvNew[mssv]) {
                                            //check MSSV
                                            // let student = await app.model.fwStudent.get({ mssv });
                                            const ho = worksheet.getCell('B' + index).value?.toString().trim() || '',
                                                ten = worksheet.getCell('C' + index).value?.toString().trim() || '',
                                                gioiTinh = worksheet.getCell('D' + index).value?.toString().trim() || '',
                                                gioiTinhText = dsGioiTinh[gioiTinh] ? JSON.parse(dsGioiTinh[gioiTinh].ten).vi : '',
                                                ngaySinhText = worksheet.getCell('E' + index).value?.toString().trim() || '',
                                                ngaySinh = changeDateTextToNumber(ngaySinhText),
                                                cmnd = worksheet.getCell('F' + index).value?.toString().trim() || '',
                                                noiSinhMaTinh = worksheet.getCell('G' + index).value?.toString().trim() || '',
                                                noiSinhMaTinhText = dsTinhThanh[noiSinhMaTinh] ? dsTinhThanh[noiSinhMaTinh].ten : '',
                                                thuongTruMaTinh = worksheet.getCell('H' + index).value?.toString().trim() || '',
                                                thuongTruMaTinhText = dsTinhThanh[thuongTruMaTinh] ? dsTinhThanh[thuongTruMaTinh].ten : '',
                                                thuongTruMaHuyen = worksheet.getCell('I' + index).value?.toString().trim() || '',
                                                thuongTruMaHuyenText = dsQuanHuyen[thuongTruMaHuyen] ? dsQuanHuyen[thuongTruMaHuyen].tenQuanHuyen : '',
                                                thuongTruMaXa = worksheet.getCell('J' + index).value?.toString().trim() || '',
                                                thuongTruMaXaText = dsPhuongXa[thuongTruMaXa] ? dsPhuongXa[thuongTruMaXa].tenPhuongXa : '',
                                                thuongTruSoNha = worksheet.getCell('K' + index).value?.toString().trim() || '',
                                                namTuyenSinh = worksheet.getCell('L' + index).value?.toString().trim() || '',
                                                loaiHinhDaoTao = worksheet.getCell('M' + index).value?.toString().trim() || '',
                                                loaiHinhDaoTaoText = dsHeDaoTao[loaiHinhDaoTao] ? dsHeDaoTao[loaiHinhDaoTao].ten : '',
                                                bacDaoTao = 'DH',
                                                maNganh = worksheet.getCell('N' + index).value?.toString().trim() || '',
                                                maNganhText = dsNganh[maNganh] ? dsNganh[maNganh].ma + ': ' + dsNganh[maNganh].tenNganh : '',
                                                khoa = dsNganh[maNganh] ? dsNganh[maNganh].khoa : '',
                                                lop = worksheet.getCell('O' + index).value?.toString().trim() || '',
                                                tinhTrang = worksheet.getCell('P' + index).value?.toString().trim() || '',
                                                tinhTrangText = dsTinhTrang[tinhTrang] ? dsTinhTrang[tinhTrang].ten : '',
                                                ngayNhapHocText = worksheet.getCell('Q' + index).value?.toString().trim() || '',
                                                ngayNhapHoc = changeDateTextToNumber(ngayNhapHocText),
                                                emailCaNhan = worksheet.getCell('R' + index).value?.toString().trim() || '',
                                                emailTruong = mssv.toString().toLowerCase() + '@hcmussh.edu.vn',
                                                dienThoaiCaNhan = worksheet.getCell('S' + index).value?.toString().trim() || '',
                                                tenCha = worksheet.getCell('T' + index).value?.toString().trim() || '',
                                                sdtCha = worksheet.getCell('U' + index).value?.toString().trim() || '',
                                                tenMe = worksheet.getCell('V' + index).value?.toString().trim() || '',
                                                sdtMe = worksheet.getCell('W' + index).value?.toString().trim() || '',
                                                hoTenNguoiLienLac = worksheet.getCell('X' + index).value?.toString().trim() || '',
                                                sdtNguoiLienLac = worksheet.getCell('Y' + index).value?.toString().trim() || '';
                                            const tmpRow = {
                                                mssv, ho, ten, gioiTinh, gioiTinhText, ngaySinh, ngaySinhText, cmnd, noiSinhMaTinh, noiSinhMaTinhText, thuongTruMaTinh, thuongTruMaTinhText, thuongTruMaHuyen, thuongTruMaHuyenText, thuongTruMaXa, thuongTruMaXaText, thuongTruSoNha, namTuyenSinh, loaiHinhDaoTao, loaiHinhDaoTaoText, bacDaoTao, maNganh, maNganhText, khoa, lop, tinhTrang, tinhTrangText, ngayNhapHoc, ngayNhapHocText, emailCaNhan, emailTruong, dienThoaiCaNhan, tenCha, sdtCha, tenMe, sdtMe, hoTenNguoiLienLac, sdtNguoiLienLac,
                                            };
                                            items.push(tmpRow);
                                            mssvNew[mssv] = index;
                                        } else {
                                            const failedRow = { mssv, rowIndex: index };
                                            if (student) {
                                                failedRow.message = `Đã tồn tại sinh viên có mssv ${mssv} trong hệ thống`;
                                            } else if (mssvNew[mssv]) {
                                                failedRow.message = `Bị trùng mssv với dòng ${mssvNew[mssv]}`;
                                            } else {
                                                failedRow.message = 'Mssv không được trống';
                                            }
                                            failed.push(failedRow);
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        failed.push(error);
                                    }
                                    index++;
                                }
                            }
                            done && done({ items, failed });
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

    app.uploadHooks.add('DssvUploadSearch', (req, fields, files, params, done) =>
        app.permission.has(req, () => dssvUploadSearch(fields, files, params, done), done, 'student:manage')
    );

    app.uploadHooks.add('DssvDownloadImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => dssvDownloadImage(fields, files, params, done), done, 'student:manage')
    );

    app.get('/api/ctsv/upload-dssv/search/template', app.permission.check('student:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Upload dssv');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên lót', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 10 },
            ];
            app.excel.attachment(workBook, res, 'DSSV_UPLOAD_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dssv-upload/search', app.permission.check('student:manage'), (req, res) => {
        try {
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');
            app.getUploadForm().parse(req, (error, fields, files) => {
                if (error) {
                    res.send({ error });
                } else {
                    let hasResponsed = false;
                    app.uploadHooks.run(req, fields, files, req.query, async data => {
                        const { columnSelect } = JSON.parse(fields.data[0] || '[]');
                        if (hasResponsed == false) {
                            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(data.items[0] || {}).filter(key => columnSelect.includes(key.toString())).map(key => ({ header: key.toString(), key, width: 20 }))];
                            data.items.forEach((item, index) => {
                                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
                            });
                            const buffer = await workBook.xlsx.writeBuffer();
                            res.send({ content: buffer, fileName: 'Upload_DSSV.xlsx' });
                        }
                        hasResponsed = true;
                    });
                }
            });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/image-card', app.permission.check('student:manage'), async (req, res) => {
        try {
            let mssv = req.query.mssv;
            let item = await app.model.fwStudent.get({ mssv }, 'anhThe, namTuyenSinh');
            const path = app.path.join(app.assetPath, 'image-card', item.namTuyenSinh.toString(), item.anhThe);

            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.send({ error: 'No valid file' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/image-card/download', app.permission.check('student:manage'), async (req, res) => {
        try {
            let listMssv = [];
            const { changes } = req.body;
            const { khoaSinhVien, heDaoTao, tinhTrang, nhapHocStart, nhapHocEnd } = changes || {};
            if (khoaSinhVien === undefined) {
                app.getUploadForm().parse(req, (error, fields, files) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        let hasResponsed = false;
                        app.uploadHooks.run(req, fields, files, req.query, async data => {
                            if (hasResponsed == false) {
                                listMssv = [...data.items];
                                const tempPathFolder = app.path.join(app.assetPath, 'image-card', 'image-temp');
                                app.fs.createFolder(tempPathFolder);
                                let listPromise = listMssv.map(sv => {
                                    if (sv.exist) {
                                        const srcPath = app.path.join(app.assetPath, 'image-card', sv.namTuyenSinh?.toString() || '-1', sv.anhThe || '-1');
                                        if (app.fs.existsSync(srcPath)) {
                                            return app.fs.copyFile(srcPath, app.path.join(tempPathFolder, sv.anhThe), error => {
                                                if (error) {
                                                    res.send({ error });
                                                }
                                            });
                                        } else return;
                                    }
                                });
                                await Promise.all([...listPromise]);
                                const outDir = app.path.join(app.assetPath, 'image-card', 'DsUploadImage.zip');
                                app.fs.deleteFile(outDir);
                                await app.fs.zipDirectory(tempPathFolder, outDir);
                                await app.fs.deleteFolder(tempPathFolder);
                                res.send({ fileName: 'DsUploadImage.zip' });
                            }
                            hasResponsed = true;
                        });
                    }
                });
            } else {
                listMssv = await app.model.fwStudent.getAll(
                    nhapHocStart != null ? {
                        statement: 'khoaSinhVien = :khoaSinhVien and loaiHinhDaoTao in (:heDaoTao) AND tinhTrang IN (:tinhTrang) AND ANH_THE IS NOT NULL AND ngayNhapHoc between :nhapHocStart and :nhapHocEnd',
                        parameter: {
                            khoaSinhVien, heDaoTao, tinhTrang, nhapHocStart, nhapHocEnd
                        }
                    } : {
                        statement: 'khoaSinhVien = :khoaSinhVien and loaiHinhDaoTao in (:heDaoTao) AND tinhTrang IN (:tinhTrang) AND ANH_THE IS NOT NULL',
                        parameter: {
                            khoaSinhVien, heDaoTao, tinhTrang
                        }
                    }
                    , 'mssv, anhThe');
                const tempPathFolder = app.path.join(app.assetPath, 'image-card', `${khoaSinhVien}-temp`);
                app.fs.createFolder(tempPathFolder);
                let listPromise = listMssv.map(sv => {
                    const srcPath = app.path.join(app.assetPath, 'image-card', khoaSinhVien, sv.anhThe);
                    if (app.fs.existsSync(srcPath)) {
                        app.fs.copyFile(srcPath, app.path.join(tempPathFolder, sv.anhThe), error => {
                            if (error) {
                                res.send({ error });
                            }
                        });
                    }
                });
                await Promise.all([...listPromise]);
                const outDir = app.path.join(app.assetPath, 'image-card', `${khoaSinhVien}.zip`);
                app.fs.deleteFile(outDir);
                await app.fs.zipDirectory(tempPathFolder, outDir);
                await app.fs.deleteFolder(tempPathFolder);
                res.send({ fileName: `${khoaSinhVien}.zip` });
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/image-card/tai-anh/check-file', app.permission.check('student:manage'), async (req, res) => {
        try {
            const fileName = req.query.fileName;
            const srcPath = app.path.join(app.assetPath, 'image-card', fileName);
            if (app.fs.existsSync(srcPath)) {
                res.download(srcPath);
            } else res.send({ error: 'Không tồn tại file zip' });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });



    const dssvUploadSearch = async (fields, files, params, done) => {
        try {
            let worksheet = null;
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DssvUploadSearch' && files.DssvUploadSearch) {
                const srcPath = files.DssvUploadSearch[0].path;
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
                                        if (mssv) {
                                            const { rows: [student] } = await app.model.fwStudent.getData(mssv);
                                            if (student) {
                                                const { hoTen, tenKhoa, tenTinhTrang, gioiTinh, noiSinh, ngaySinhText, ngayNhapHocText, tenNganh, maNganh, heDaoTao, lop, nienKhoa, khoaSinhVien, tinhThuongTru, huyenThuongTru, xaThuongTru, soNhaThuongTru, sdt, emailTruong, cmnd, soTkNganHang, chiNhanhNganHang } = student;
                                                const tmpRow = { mssv, hoTen, tenKhoa, tenTinhTrang, gioiTinh, noiSinh, ngaySinhText, ngayNhapHocText, tenNganh, maNganh, heDaoTao, lop, nienKhoa, khoaSinhVien, tinhThuongTru, huyenThuongTru, xaThuongTru, soNhaThuongTru, sdt, emailTruong, cmnd, soTkNganHang, chiNhanhNganHang };
                                                items.push(tmpRow);
                                            } else {
                                                items.push({ mssv: `Không tìm thấy mssv: ${mssv}` });
                                            }
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

    const dssvDownloadImage = async (fields, files, params, done) => {
        try {
            let worksheet = null;
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DssvDownloadImage' && files.DssvDownloadImage) {
                const srcPath = files.DssvDownloadImage[0].path;
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
                                        if (mssv) {
                                            const student = await app.model.fwStudent.get({ mssv }, 'mssv, anhThe, namTuyenSinh');
                                            if (student) {
                                                items.push({ ...student, exist: true });
                                            } else {
                                                items.push({ mssv: `Không tìm thấy mssv: ${mssv}`, exist: false });
                                            }
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


};
