module.exports = app => {
    const PERMISSION = app.isDebug ? 'student:login' : 'student:login';

    const menu = {
        parentMenu: app.parentMenu.congTacSinhVien,
        menus: {
            7810: { title: 'Chứng nhận trực tuyến', link: '/user/chung-nhan-truc-tuyen' },
        }
    };


    app.permission.add(
        { name: PERMISSION, menu },
        { name: 'student:chungNhan', menu },
    );

    app.get('/user/chung-nhan-truc-tuyen', app.permission.orCheck(PERMISSION, 'student:chungNhan'), app.templates.admin);

    const socketIoEmit = (data, error) => !error && app.io.to('svManageForm').emit('updated-data', data);

    // API ------------------------------------------------------------------------------------------------------------------------
    app.put('/api/sv/manage-form', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            const { firstName, lastName } = req.session.user;
            let { changes, id } = req.body;
            const data = await app.model.svManageForm.get({ id }, '*');
            if (data.action == 'A') {
                changes.action = 'C';
                changes.completeTime = Date.now();
                const item = await app.model.svManageForm.update({ id }, changes);
                socketIoEmit({ firstName, lastName, action: changes.action, maDangKy: id, isStudent: 1 });
                res.send({ item });
            } else {
                res.send({ error: 'Chứng nhận của bạn chưa được chấp nhận' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/manage-form/page/:pageNumber/:pageSize', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = req.session.user.email ? req.session.user.email : '';
            const page = await app.model.svManageForm.searchPage(_pageNumber, _pageSize, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, datasinhvien } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list }, dataSinhVien: datasinhvien[0] });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/sv/manage-form', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            const svManageForm = req.body.svManageForm,
                register = req.session.user?.email || '';
            // let data = await app.model.svManageForm.get({ formType: svManageForm.formType, register }, '*', 'REGISTION_TIME DESC');
            let [dataList, formData] = await Promise.all([
                app.model.svManageForm.getAll({ formType: svManageForm.formType, register }, '*', 'REGISTION_TIME DESC'),
                app.model.svDmFormType.get({ ma: svManageForm.formType }),
            ]);
            let data = dataList[0];
            let countActive = dataList.filter(item => !['C', 'R'].includes(item.action)).length;
            if (data != null && !['C', 'R'].includes(data.action) && formData.multiple == 0) {
                res.send({ error: 'Bạn đã đăng ký loại xác nhận này' });
            } else if (countActive > +formData.multiple) {
                res.send({ error: 'Bạn đã đăng ký vượt số lượng cho phép đối với loại xác nhận này' });
            } else {
                const { id } = await app.model.svManageForm.create({ ...svManageForm, register, registionTime: Date.now() });
                const { allowDownload } = await app.model.svDmFormType.get({ ma: svManageForm.formType });
                socketIoEmit({ isNew: 1 });
                res.send({ id, allowDownload });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/manage-form/download', app.permission.orCheck(PERMISSION, 'student:chungNhan'), async (req, res) => {
        try {
            // return { data: { content: doc, filename: `${formData.maForm}_${formData.mssv}.docx` } };
            const { buffer, filename } = await app.model.svManageForm.initForm(req.query.id);
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            res.send({ data: { content: pdfBuffer, filename: filename + '.pdf' } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};