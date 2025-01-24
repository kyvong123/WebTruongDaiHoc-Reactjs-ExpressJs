module.exports = (app) => {
    const APPROVED_MAPPER = {
        'P': 'Đang xử lý',
        'C': 'Đã nhận',
        'A': 'Chấp nhận',
        null: 'Đăng ký mới',
        'R': 'Từ chối',
    };

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6187: {
                title: 'Chứng nhận trực tuyến', icon: 'fa-snowflake-o', link: '/user/ctsv/quan-ly-forms', groupIndex: 1, backgroundColor: '#25316D', parentKey: 6107
            }
        }
    };
    app.permission.add(
        { name: 'manageForm:ctsv', menu: menuCtsv },
        'manageForm:write',
        'manageForm:delete'
    );

    app.get('/user/ctsv/quan-ly-forms', app.permission.check('manageForm:ctsv'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleFormManage', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'manageForm:ctsv', 'manageForm:write');
            // app.io.addSocketListener('svManageForm', socket => socket.join('svManageForm'));
            resolve();
        } else resolve();
    }));

    app.readyHooks.add('addSocketListener:ListenManageForm', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('svManageForm', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('manageForm:write',) && socket.join('svManageForm');
        })
    });

    const socketIoEmit = (data, error) => !error && app.io.to('svManageForm').emit('updated-data', data);

    app.get('/api/ctsv/form-dang-ky/page/:pageNumber/:pageSize', app.permission.check('manageForm:ctsv'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = req.query.filter;
            const {
                totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list,
                sodangkyquahan: soDangKyQuaHan, sodangkymoi: soDangKyMoi,
            } = await app.model.svManageForm.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list }, soDangKyMoi, soDangKyQuaHan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/form-dang-ky', app.permission.check('manageForm:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { svManageForm } = req.body;
            const { register, formType, soNgayXuLy } = svManageForm;
            let [data, formData] = await Promise.all([
                app.model.svManageForm.get({ formType, register }, '*', 'REGISTION_TIME DESC'),
                app.model.svDmFormType.get({ ma: formType }),
            ]);
            if (data != null && !['C', 'R'].includes(data.action) && formData.multiple == 0) {
                res.send({ error: 'Bạn đã đăng ký loại form này' });
            } else {
                const now = Date.now();
                if (svManageForm.action === 'A') {
                    svManageForm.handleTime = now;
                    svManageForm.staffHandle = user.email;
                    const { ten: tenFormDangKy } = await app.model.svDmFormType.get({ ma: svManageForm.formType });
                    app.notification.send({
                        toEmail: register,
                        title: `Biểu mẫu ${tenFormDangKy} đã được xác nhận`,
                        subTitle: `Vui lòng đến nhận kết quả sau ${soNgayXuLy} ngày làm việc hành chính (không tính T7, CN).`,
                        icon: 'fa-check',
                        iconColor: 'success',
                        link: '/user/chung-nhan-truc-tuyen'
                    });
                }
                const item = await app.model.svManageForm.create({ ...svManageForm, registionTime: now });
                socketIoEmit({ isNew: 1 });
                res.send({ item });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/form-dang-ky', app.permission.check('manageForm:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let { changes, id } = req.body;

            if (['A', 'R'].includes(changes.action)) {
                changes.staffHandle = user.email;
                changes.handleTime = Date.now();
                const { rows: formData } = await app.model.svManageForm.getData(id);
                const { emailDangKy, tenFormDangKy } = formData[0];
                const { soNgayXuLy } = changes;
                const notification = (changes.action == 'A') ? {
                    toEmail: emailDangKy,
                    title: `Biểu mẫu ${tenFormDangKy} đã được xác nhận`,
                    subTitle: `Vui lòng nhận kết quả sau ${soNgayXuLy} ngày làm việc hành chính (không tính T7, CN).`,
                    icon: 'fa-check',
                    iconColor: 'success',
                    link: '/user/chung-nhan-truc-tuyen'
                } : (changes.action == 'R') ? {
                    toEmail: emailDangKy,
                    title: `Biểu mẫu ${tenFormDangKy} đã bị từ chối`,
                    subTitle: 'Vui lòng vào trang Đăng ký để xem lý do',
                    icon: 'fa-times',
                    iconColor: 'danger',
                    link: '/user/chung-nhan-truc-tuyen'
                } : null;
                app.notification.send(notification);
            }
            const item = await app.model.svManageForm.update({ id }, changes).catch(error => {
                app.consoleError(req, `Invalid Id ${id}: ${app.utils.stringify({ email: user.email, changes })}`);
                throw error;
            });
            socketIoEmit({ lastName: user.lastName, firstName: user.firstName, action: changes.action, maDangKy: id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.delete('/api/ctsv/form-dang-ky/delete', app.permission.check('manageForm:delete'), async (req, res) => {
        try {
            await app.model.svManageForm.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/manage-form/download/:id', app.permission.check('manageForm:ctsv'), async (req, res) => {
        try {
            const { buffer, filename } = await app.model.svManageForm.initForm(req.params.id);
            res.send({ data: { content: buffer, filename: filename + '.docx' } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/manage-form/export', app.permission.check('manageForm:ctsv'), async (req, res) => {
        try {
            const now = new Date();
            // let formData = await app.model.svManageMienGiam.getData(req.params.id);
            const { rows: list } = await app.model.svManageForm.searchPage(1, 9999);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS chứng nhận', {
                pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },

            });
            ws.columns = [
                { header: 'Mã', key: 'ma', width: 5 },
                { header: 'MSSV', key: 'mssv', width: 20 },
                { header: 'Sinh viên đăng ký', key: 'svDangKy', width: 30 },
                { header: 'Tình trạng sinh viên', key: 'tinhTrangSv', width: 20 },
                { header: 'Loại chứng nhận', key: 'loaiChungNhan', width: 30 },
                { header: 'Nơi nhận', key: 'noiNhan', width: 20 },
                { header: 'Ngày đăng ký', key: 'ngayDangKy', width: 20 },
                { header: 'Ngày xử lý', key: 'ngayXuLy', width: 20 },
                { header: 'Người xử lý', key: 'nguoiXuLy', width: 20 },
                { header: 'Ngày hoàn thành', key: 'ngayHoanThanh', width: 20 },
                { header: 'Thông tin bổ sung', key: 'ghiChu', width: 20 },
                { header: 'Trạng thái', key: 'trangThai', width: 20 },
                { header: 'Lý do từ chối', key: 'lyDoTuChoi', width: 20 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };

            list.forEach((item) => {
                ws.addRow({
                    ma: item.maDangKy,
                    mssv: item.mssvDangKy,
                    svDangKy: `${item.hoDangKy} ${item.tenDangKy}`,
                    tinhTrangSv: item.tinhTrangSinhVien,
                    loaiChungNhan: item.tenFormDangKy,
                    noiNhan: item.noiNhan,
                    ngayDangKy: item.thoiGianDangKy ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianDangKy)), 'HH:MM:ss dd/mm/yyyy') : '',
                    ngayXuLy: item.thoiGianXuLy ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianXuLy)), 'HH:MM:ss dd/mm/yyyy') : '',
                    nguoiXuLy: `${item.hoNguoiXuLy || ''} ${item.tenNguoiXuLy || ''}`,
                    ngayHoanThanh: item.thoiGianHoanThanh ? app.date.dateTimeFormat(new Date(parseInt(item.thoiGianHoanThanh)), 'HH:MM:ss dd/mm/yyyy') : '',
                    ghiChu: item.ghiChu,
                    trangThai: APPROVED_MAPPER[item.tinhTrang],
                    lyDoTuChoi: item.lyDoTuChoi
                }, 'i');
            });
            const fileName = `DS_Chứng nhận_${now.yyyymmdd()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
        }
    });

    app.get('/api/ctsv/manage-form/check-mssv/:mssv', app.permission.orCheck('manageForm:ctsv', 'student:login'), async (req, res) => {
        try {
            const mssv = req.params.mssv,
                data = await app.model.fwStudent.get({ mssv }, 'mssv, ho, ten');
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

};
