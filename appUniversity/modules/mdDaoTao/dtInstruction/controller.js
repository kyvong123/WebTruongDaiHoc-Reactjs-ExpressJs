module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7102: { title: 'Hướng dẫn sử dụng', link: '/user/dao-tao/instruction', icon: 'fa-list', backgroundColor: '#7FB77E', pin: true },
        },
    };

    app.permission.add({ name: 'dtInstruction:manage', menu });

    app.get('/user/dao-tao/instruction', app.permission.orCheck('dtInstruction:manage', 'developer:login'), app.templates.admin);
    app.get('/user/dao-tao/instruction/:id', app.permission.orCheck('dtInstruction:manage', 'developer:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/instruction/page/:pageNumber/:pageSize', app.permission.orCheck('dtInstruction:manage', 'developer:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);

            const page = await app.model.gvInstruction.getPage(pageNumber, pageSize, { isGv: 0 });
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/instruction/:id', app.permission.orCheck('dtInstruction:manage', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const instruction = await app.model.gvInstruction.get({ id });
            if (!instruction) throw { message: 'Hướng dẫn sử dụng không tồn tại' };
            res.send({ item: instruction });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/instruction', app.permission.orCheck('developer:login', 'dtInstruction:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body,
                { noiDung, tieuDe } = changes;

            app.model.gvInstruction.update({ id }, { noiDung, tieuDe });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/instruction', app.permission.orCheck('dtInstruction:manage', 'developer:login'), async (req, res) => {
        try {
            const data = req.body.data,
                { tieuDe, noiDung } = data;
            await app.model.gvInstruction.create({ tieuDe, noiDung, isGv: 0 });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });
    //Upload Hook-------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'dtInstruction'));

    app.uploadHooks.add('uploadDaoTaoInstructionCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('dtInstruction', fields, files, params, done), done));

};