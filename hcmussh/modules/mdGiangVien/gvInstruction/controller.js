module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.giangVien,
        menus: {
            7624: { title: 'Hướng dẫn sử dụng', link: '/user/affair/instruction', icon: 'fa-list', backgroundColor: '#7FB77E', pin: true },
        },
    };

    app.permission.add({ name: 'staff:teacher', menu });

    app.get('/user/affair/instruction', app.permission.orCheck('staff:teacher', 'developer:login'), app.templates.admin);
    app.get('/user/affair/instruction/:id', app.permission.orCheck('staff:teacher', 'developer:login'), app.templates.admin);
    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/dt/gv/instruction/page/:pageNumber/:pageSize', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
    //     try {
    //         const pageNumber = parseInt(req.params.pageNumber),
    //             pageSize = parseInt(req.params.pageSize);

    //         const page = await app.model.gvInstruction.getPage(pageNumber, pageSize, { isGv: 1 });
    //         res.send({ page });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/instruction/:id', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
    //     try {
    //         const id = parseInt(req.params.id);

    //         const instruction = await app.model.gvInstruction.get({ id });
    //         if (!instruction) throw { message: 'Hướng dẫn sử dụng không tồn tại' };
    //         res.send({ item: instruction });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });

    // app.put('/api/dt/gv/instruction', app.permission.orCheck('developer:login', 'staff:teacher'), async (req, res) => {
    //     try {
    //         const { id, changes } = req.body,
    //             { noiDung, tieuDe } = changes;

    //         app.model.gvInstruction.update({ id }, { noiDung, tieuDe });
    //         res.send({ error: null });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });

    // app.post('/api/dt/gv/instruction', app.permission.orCheck('staff:teacher', 'developer:login'), async (req, res) => {
    //     try {
    //         const data = req.body.data,
    //             { tieuDe, noiDung } = data;
    //         await app.model.gvInstruction.create({ tieuDe, noiDung, isGv: 1 });
    //         res.send({ error: null });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });
    // //Upload Hook-------------------------------------------------------------------------------------------------------
    // app.fs.createFolder(app.path.join(app.publicPath, 'img', 'gvInstruction'));

    // app.uploadHooks.add('uploadGiangVienInstructionCkEditor', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => app.uploadCkEditorImage('gvInstruction', fields, files, params, done), done));


};