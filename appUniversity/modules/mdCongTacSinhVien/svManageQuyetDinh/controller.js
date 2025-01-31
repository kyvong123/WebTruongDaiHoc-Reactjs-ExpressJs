module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6171: {
                title: 'Quản lý quyết định', icon: 'fa-file-text-o', link: '/user/ctsv/quan-ly-quyet-dinh', groupIndex: 2, backgroundColor: '#FF7B54', parentKey: '6111'
            }
        }
    };


    app.permission.add(
        { name: 'manageQuyetDinh:ctsv', menu: menuCtsv },
        'manageQuyetDinh:write',
        'manageQuyetDinh:delete',
        'manageQuyetDinh:edit',
        'manageQuyetDinh:cancel'
    );

    const quyetDinhKhac = 3;
    const quyetDinhVao = 2;
    const quyetDinhRa = 1;

    app.readyHooks.add('addSocketListener:ListenQuyetDinhChange', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('svManageQuyetDinh', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('manageQuyetDinh:write') && socket.join('svManageQuyetDinh');
        })
    });


    const socketIoEmit = (event, data, error) => !error && app.io.to('svManageQuyetDinh').emit(event, data);

    app.get('/user/ctsv/quan-ly-quyet-dinh', app.permission.check('manageQuyetDinh:ctsv'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleManageQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'manageQuyetDinh:ctsv', 'manageQuyetDinh:write', 'manageQuyetDinh:cancel', 'manageQuyetDinh:edit');
            // app.io.addSocketListener('svManageQuyetDinh', socket => socket.join('svManageQuyetDinh'));
            resolve();
        } else resolve();
    }));

    // API ------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/quyet-dinh/all', app.permission.check('manageQuyetDinh:ctsv'), async (req, res) => {
        let condition = req.query.condition ? req.query.condition : {};
        app.model.svManageQuyetDinh.getAll(condition, '*', 'handleTime DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/quyet-dinh/page/:pageNumber/:pageSize', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.svManageQuyetDinh.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    async function updateSinhVienInfo(user, email, kieuQuyetDinh, data) {
        const lop = await app.model.dtLop.get({ maLop: data.lopMoi });
        const dataSinhVien = await app.model.fwStudent.get({ emailTruong: email }, '*');
        let stData = { tinhTrang: kieuQuyetDinh == quyetDinhVao ? data.chuyenTinhTrang : data.chuyenTrangThai };
        if (kieuQuyetDinh == quyetDinhVao) {
            stData.maNganh = lop.maNganh ?? '';
            stData.lop = data.lopMoi ?? '';
            stData.maKhoa = data.lhdtMoi + data.khoaDtMoi ?? '';
            stData.khoaSinhVien = data.khoaDtMoi ?? '';
            stData.loaiHinhDaoTao = data.lhdtMoi ?? '';
            stData.khoa = data.khoaMoi ?? '';
        }
        await app.model.fwStudentQuyetDinhLog.createLog({ sinhVienObj: dataSinhVien, handleTime: data?.ngayBatDau });
        const { updateLog } = await app.model.fwStudent.updateWithLog(user, { emailTruong: email }, stData);
        if (updateLog?.length) {
            let dataSau = updateLog[0].dataSau;
            if (dataSau && Object.keys(app.utils.parse(dataSau)).length !== 0) {
                await app.model.fwStudent.initCtdtRedis(dataSinhVien.mssv);
                await app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(dataSinhVien.mssv);
            }
        }
    }

    app.post('/api/ctsv/quyet-dinh', app.permission.check('manageQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { soQuyetDinh } = req.body.svManageQuyetDinh;
            let data = await app.model.svManageQuyetDinh.get({ soQuyetDinh, isDeleted: 0 }, '*', '');
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: soQuyetDinh });
            if (data) {
                res.send({ error: `Đã tồn tại quyết định có số ${dataSoCongVan.soCongVan}` });
            } else {
                const dataQuyetDinh = req.body.svManageQuyetDinh,
                    staffHandle = user.email,
                    now = Date.now();
                dataQuyetDinh.handleTime = now;
                dataQuyetDinh.handleTimeUpdate = now;
                dataQuyetDinh.staffHandle = staffHandle;
                dataQuyetDinh.staffHandleUpdate = staffHandle;
                let item = null;
                if (dataSoCongVan.suDung == 0) {
                    let itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh(dataQuyetDinh, user);
                    item = await app.model.svManageQuyetDinh.create({ ...dataQuyetDinh, isDeleted: 0, idCvd: itemCvd.id });
                    await app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 1 });
                } else {
                    item = await app.model.svManageQuyetDinh.create({ ...dataQuyetDinh, isDeleted: 0 });
                }
                let sv = await app.model.fwStudent.get({ emailTruong: item.student });
                if (item.kieuQuyetDinh == quyetDinhRa) {
                    await Promise.all([
                        app.model.svManageQuyetDinhRa.create({ ...dataQuyetDinh.data, qdId: item.id }),
                        updateSinhVienInfo(user, item.student, item.kieuQuyetDinh, dataQuyetDinh.data),
                        app.model.svDsMienGiamHoan.hoanMienGiam(sv.mssv, `${dataQuyetDinh.tenForm} (${dataSoCongVan.soCongVan})`, user.email),
                    ]);
                } else if (item.kieuQuyetDinh == quyetDinhVao) {
                    await Promise.all([
                        app.model.svManageQuyetDinhVao.create({ ...dataQuyetDinh.data, qdId: item.id }),
                        updateSinhVienInfo(user, item.student, item.kieuQuyetDinh, dataQuyetDinh.data),
                        app.model.svDsMienGiamHoan.kichHoatMienGiam(sv.mssv, user.email, dataQuyetDinh.data.lopMoi)
                    ]);
                }
                if (dataSoCongVan.suDung == 0) {
                    const files = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: item.idCvd });
                    if (!files.length) {
                        const { buffer: data } = await app.model.svManageQuyetDinh.initForm(item.id);
                        await app.model.hcthCongVanDi.createFile(user, data,
                            item.formType + '_' + item.soQuyetDinh + '_' + Date.now() + '.docx', item.idCvd);
                    }
                }
                socketIoEmit('created-quyetdinh', { firstName: user.firstName, lastName: user.lastName, email: user.email, isNew: 1, soQuyetDinh: item.soQuyetDinh });
                res.send({ item });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/quyet-dinh', app.permission.check('manageQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let { changes, id } = req.body;
            //'U' là update khi nào update thì mới chỉnh staff
            if (changes.action == 'U') {
                changes.staffHandleUpdate = user.email;
                changes.handleTimeUpdate = Date.now();
            }
            const item = await app.model.svManageQuyetDinh.update({ id }, changes);
            if (changes.action == 'U' && changes.kieuQuyetDinh != quyetDinhKhac) {
                await Promise.all[
                    app.model.svManageQuyetDinhRa.delete({ qdId: id }),
                    app.model.svManageQuyetDinhVao.delete({ qdId: id })
                ];
                if (item.kieuQuyetDinh == quyetDinhRa) {
                    await app.model.svManageQuyetDinhRa.create({ ...changes.data, qdId: id });
                }
                else if (item.kieuQuyetDinh == quyetDinhVao) {
                    await app.model.svManageQuyetDinhVao.create({ ...changes.data, qdId: id });
                }

                await updateSinhVienInfo(user, item.student, item.kieuQuyetDinh, req.body.changes.data);
                const { buffer: data } = await app.model.svManageQuyetDinh.initForm(item.id);
                await app.model.hcthCongVanDi.createFile(user, data,
                    item.formType + '_' + item.soQuyetDinh + '_' + Date.now() + '.docx', item.idCvd);
            }
            socketIoEmit('updated-quyetdinh', { firstName: user.firstName, lastName: user.lastName, email: user.email, action: changes.action, maDangKy: id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/quyet-dinh/huy', app.permission.check('manageQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let { changes, id } = req.body;
            //'U' là update khi nào update thì mới chỉnh staff
            if (changes.action == 'U') {
                changes.staffHandle = user.email;
                changes.handleTime = Date.now();
            }
            const item = await app.model.svManageQuyetDinh.update({ id }, changes);
            await Promise.all([
                app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 0 }),
                app.model.hcthCongVanDi.delete({ soDangKy: item.soQuyetDinh })
            ]);
            if (changes.chuyenTinhTrangTruoc == 1 && changes.kieuQuyetDinh != quyetDinhKhac) {
                await app.model.fwStudentQuyetDinhLog.createLog({ mssv: changes.mssv });
                await app.model.fwStudent.update({ mssv: changes.mssv }, { tinhTrang: changes.tinhTrangTruoc });
            }
            socketIoEmit('updated-quyetdinh', { firstName: user.firstName, lastName: user.lastName, email: user.email, action: changes.action, maDangKy: id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/quyet-dinh', app.permission.check('manageQuyetDinh:delete'), async (req, res) => {
        try {
            await Promise.all[
                app.model.svManageQuyetDinh.delete({ id: req.body.id }),
                app.model.svManageQuyetDinhRa.delete({ qdId: req.body.id }),
                app.model.svManageQuyetDinhVao.delete({ qdId: req.body.id }),
                app.model.hcthSoDangKy.update({ id: req.body.soQuyetDinh }, { suDung: 0 }),
                app.model.hcthCongVanDi.delete({ soDangKy: req.body.soQuyetDinh })
            ];
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/quyet-dinh/check/:soquyetdinh', app.permission.check('manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            let data = await app.model.svManageMienGiam.get({ soQuyetDinh: req.params.soquyetdinh, isDeleted: 0 }, '*', '');
            let dataQd = await app.model.svManageQuyetDinh.get({ soQuyetDinh: req.params.soquyetdinh, isDeleted: 0 }, '*', '');
            let dataKl = await app.model.svQtKyLuat.get({ soQuyetDinh: req.params.soquyetdinh }, '*', '');
            let dataKt = await app.model.svKhenThuong.get({ soQd: req.params.soquyetdinh }, '*', '');
            if (data || dataQd || dataKl || dataKt) {
                let soQd = await app.model.hcthSoDangKy.get({ id: req.params.soquyetdinh }, 'id, soCongVan');
                res.send({ error: `Đã tồn tại quyết định có số ${soQd.soCongVan}` });
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/chuong-trinh-dao-tao', app.permission.orCheck('manageQuyetDinh:ctsv', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const { maCtdt } = req.query,
                item = await app.model.dtKhungDaoTao.get({ maCtdt });
            res.send({ item: item || {} });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/quyet-dinh/download/:id', app.permission.check('manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            const { buffer: data } = await app.model.svManageQuyetDinh.initForm(req.params.id);
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/quyet-dinh/so-quyet-dinh-ra', app.permission.check('manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            let { condition } = req.query;
            const qd = await app.model.svManageQuyetDinh.getAll({ ...condition, kieuQuyetDinh: quyetDinhRa, isDeleted: 0 }, 'soQuyetDinh', 'handleTime DESC');
            if (qd.length) {
                const item = await app.model.hcthSoDangKy.get({ id: qd[0].soQuyetDinh }, 'id,soCongVan');
                res.send({ item });
            } else {
                res.send({ item: null });
            }

        } catch (error) {

            res.send({ error });
        }
    });

    app.get('/api/ctsv/quyet-dinh/export', app.permission.check('manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            const { filter } = req.query;
            const now = new Date();
            // let formData = await app.model.svManageMienGiam.getData(req.params.id);
            let { rows: list } = await app.model.svManageQuyetDinh.searchPage(1, 9999, '', filter);
            list = list.filter(item => item.isDeleted == 0).groupBy('kieuQuyetDinh');

            const workBook = app.excel.create();
            const wsQdVao = workBook.addWorksheet('Quyết định vào');
            const wsQdRa = workBook.addWorksheet('Quyết định ra');
            const wsQdKhac = workBook.addWorksheet('Quyết định khác');



            wsQdVao.columns = [
                { header: 'Số quyết định', key: 'soQd', width: 15 },
                { header: 'Loại quyết định', key: 'loaiQd', width: 15 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Tình trạng sinh viên', key: 'tinhTrangSinhVien', width: 20 },
                { header: 'Chuyển tình trạng', key: 'chuyenTinhTrang', width: 20 },
                { header: 'Số quyết định ra trước', key: 'soQdRaTruoc', width: 30 },
                { header: 'Lớp mới', key: 'lopMoi', width: 20 },
                { header: 'Hệ đào tạo mới', key: 'heDaoTaoMoi', width: 20 },
                { header: 'Ngành  mới', key: 'nganhMoi', width: 20 },
                { header: 'Chuyên ngành mới', key: 'chuyenNganhMoi', width: 20 },
                { header: 'CTDT mới', key: 'ctdtMoi', width: 20 },
                { header: 'Người ký', key: 'nguoiKy', width: 15 },
                { header: 'Ngày ký', key: 'ngayKy', width: 15 },
                { header: 'Người xử lý', key: 'nguoiXuLy', width: 15 },
                { header: 'Ngày xử lý', key: 'ngayXuLy', width: 15 },
            ];
            wsQdRa.columns = [
                { header: 'Số quyết định', key: 'soQd', width: 15 },
                { header: 'Loại quyết định', key: 'loaiQd', width: 15 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Tình trạng sinh viên', key: 'tinhTrangSinhVien', width: 20 },
                { header: 'Chuyển tình trạng', key: 'chuyenTinhTrang', width: 20 },
                { header: 'Ngày bắt đầu', key: 'ngayBatDau', width: 20 },
                { header: 'Ngày kết thúc', key: 'ngayKetThuc', width: 20 },
                { header: 'Tính vào thời gian đào tạo', key: 'tinhVaoThoiGianDaoTao', width: 20 },
                { header: 'Tên trường chuyển đi', key: 'tenTruongChuyenDi', width: 20 },
                { header: 'Tên chương trình', key: 'tenChuongTrinh', width: 20 },
                { header: 'Tên nhà tài trợ', key: 'tenNhaTaiTro', width: 20 },
                { header: 'Nơi đến', key: 'noiDen', width: 20 },
                { header: 'Số công văn quyết định du học', key: 'soQdDuHoc', width: 30 },
                { header: 'Ngày ký công văn', key: 'ngayKyDuHoc', width: 20 },
                { header: 'Người ký', key: 'nguoiKy', width: 15 },
                { header: 'Ngày ký', key: 'ngayKy', width: 15 },
                { header: 'Người xử lý', key: 'nguoiXuLy', width: 15 },
                { header: 'Ngày xử lý', key: 'ngayXuLy', width: 15 },
            ];
            wsQdKhac.columns = [
                { header: 'Số quyết định', key: 'soQd', width: 15 },
                { header: 'Loại quyết định', key: 'loaiQd', width: 15 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Người ký', key: 'nguoiKy', width: 15 },
                { header: 'Ngày ký', key: 'ngayKy', width: 15 },
                { header: 'Người xử lý', key: 'nguoiXuLy', width: 15 },
                { header: 'Ngày xử lý', key: 'ngayXuLy', width: 15 },
            ];

            wsQdVao.getRow(1).alignment = { ...wsQdVao.getRow(1).alignment, vertical: 'middle', wrapText: false };
            wsQdVao.getRow(1).font = { name: 'Times New Roman' };
            wsQdRa.getRow(1).alignment = { ...wsQdRa.getRow(1).alignment, vertical: 'middle', wrapText: false };
            wsQdRa.getRow(1).font = { name: 'Times New Roman' };
            wsQdKhac.getRow(1).alignment = { ...wsQdKhac.getRow(1).alignment, vertical: 'middle', wrapText: false };
            wsQdKhac.getRow(1).font = { name: 'Times New Roman' };

            list[quyetDinhVao]?.forEach((item) => {
                wsQdVao.addRow({
                    soQd: item.soQuyetDinh,
                    loaiQd: item.tenFormDangKy,
                    mssv: item.mssvDangKy,
                    chuyenTinhTrang: item.tenTinhTrangTruocVao,
                    tinhTrangSinhVien: item.tenChuyenTrangThaiVao,
                    soQdRaTruoc: item.soQuyetDinhRaTruoc,
                    lopMoi: item.lopMoi,
                    heDaoTaoMoi: item.lhdtMoi,
                    nganhMoi: item.nganhMoi,
                    chuyenNganhMoi: item.chuyenNganhMoi,
                    ctdtMoi: item.ctdtMoi,
                    nguoiKy: item.chucVuNguoiKy,
                    ngayKy: item.ngayKy ? app.date.dateTimeFormat(new Date(parseInt(item.ngayKy)), 'dd/mm/yyyy') : '',
                    nguoiXuLy: `${item.hoNguoiXuLy || ''} ${item.tenNguoiXuLy || ''}`,
                    ngayXuLy: item.thoiGianXuLy ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianXuLy)), 'HH:MM:ss dd/mm/yyyy') : '',
                }, 'i');
            });

            list[quyetDinhRa]?.forEach((item) => {
                const dataCustom = app.utils.parse(item.dataCustom);
                wsQdRa.addRow({
                    soQd: item.soQuyetDinh,
                    loaiQd: item.tenFormDangKy,
                    mssv: item.mssvDangKy,
                    chuyenTinhTrang: item.tenTinhTrangTruocRa,
                    tinhTrangSinhVien: item.tenChuyenTrangThaiRa,
                    ngayBatDau: item.ngayBatDau ? app.date.dateTimeFormat(new Date(parseInt(item.ngayBatDau)), 'dd/mm/yyyy') : '',
                    ngayKetThuc: item.ngayHetHan ? app.date.dateTimeFormat(new Date(parseInt(item.ngayHetHan)), 'dd/mm/yyyy') : '',
                    tinhVaoThoiGianDaoTao: item.tinhVaoThoiGianDaoTao,
                    tenTruongChuyenDi: dataCustom['<>'],
                    tenChuongTrinh: dataCustom['<tenChuongTrinh>'],
                    tenNhaTaiTro: dataCustom['<tenNhaTaiTro>'],
                    noiDen: dataCustom['<tenNoiDen>'],
                    soQdDuHoc: dataCustom['<soCongVan>'],
                    ngayKyDuHoc: dataCustom['<ngayCongVan>'],
                    nguoiKy: item.chucVuNguoiKy,
                    ngayKy: item.ngayKy ? app.date.dateTimeFormat(new Date(parseInt(item.ngayKy)), 'dd/mm/yyyy') : '',
                    nguoiXuLy: `${item.hoNguoiXuLy || ''} ${item.tenNguoiXuLy || ''}`,
                    ngayXuLy: item.thoiGianXuLy ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianXuLy)), 'HH:MM:ss dd/mm/yyyy') : '',
                }, 'i');
            });

            list[quyetDinhKhac]?.forEach((item) => {
                wsQdKhac.addRow({
                    soQd: item.soQuyetDinh,
                    loaiQd: item.tenFormDangKy,
                    mssv: item.mssvDangKy,
                    nguoiKy: item.chucVuNguoiKy,
                    ngayKy: item.ngayKy ? app.date.dateTimeFormat(new Date(parseInt(item.ngayKy)), 'dd/mm/yyyy') : '',
                    nguoiXuLy: `${item.hoNguoiXuLy || ''} ${item.tenNguoiXuLy || ''}`,
                    ngayXuLy: item.thoiGianXuLy ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianXuLy)), 'HH:MM:ss dd/mm/yyyy') : '',
                }, 'i');
            });

            const fileName = `DS_Quyết định_${now.yyyymmdd()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};