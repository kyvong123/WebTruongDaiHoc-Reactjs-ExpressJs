module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2070: { title: 'ExecuteTask', link: '/user/execute-task', icon: 'fa-history', backgroundColor: '#5F556A' }
        },
    };
    app.permission.add(
        { name: 'developer:login', menu },
    );

    app.fs.createFolder(app.path.join(app.assetPath, 'executeTool'));

    app.get('/user/execute-task', app.permission.check('developer:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/execute-task/page/:pageNumber/:pageSize', app.permission.check('developer:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = req.query.condition;

            const page = await app.model.fwExecuteTask.getPage(pageNumber, pageSize, condition, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/execute-task/download-export', app.permission.check('developer:login'), async (req, res) => {
        try {
            let { folder, id } = req.query;
            const path = app.path.join(app.assetPath, 'executeTask', folder, `${id}.json`);
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.send({ msg: 'No such file' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/execute-task/latest', app.permission.check('user:login'), async (req, res) => {
        try {
            let condition = {};
            if (!req.session.user.permissions.includes('developer:login')) {
                condition.requester = req.session.user.email;
            }
            let data = await app.model.fwExecuteTask.getPage(1, 10, condition, '*', 'id DESC');
            res.send({ items: data.list });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/execute-task/item', app.permission.check('user:login'), async (req, res) => {
        try {
            let condition = { id: req.query.id };
            if (!req.session.user.permissions.includes('developer:login')) {
                condition.requester = req.session.user.email;
            }
            let item = await app.model.fwExecuteTask.get(condition);
            if (item) {
                let data = require(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${item.id}.json`));
                res.send({ ...data });
            } else {
                res.send({ error: 'Invalid task id' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/execute-task/export/item/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            let id = req.params.id, condition = { id };
            if (!req.session.user.permissions.includes('developer:login')) {
                condition.requester = req.session.user.email;
            }
            let item = await app.model.fwExecuteTask.get(condition);
            if (item) {
                let { defaultColumns, rows, filename } = require(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${item.id}.json`));
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Sheet');
                worksheet.columns = defaultColumns;
                rows.forEach((row, index) => worksheet.addRow(row, index === 0 ? 'n' : 'i'));
                app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${id}.json`));
                app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'dataTask', `${id}.json`));
                app.model.fwExecuteTask.update({ id }, { status: 2 });
                app.excel.attachment(workbook, res, filename);
            } else {
                res.send({ error: 'Invalid task id' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/execute-task/tool', app.permission.check('user:login'), async (req, res) => {
        try {
            const fileNames = app.fs.readdirSync(app.path.join(app.assetPath, 'executeTool'));
            res.send({ fileNames });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/execute-task/tool', app.permission.check('user:login'), async (req, res) => {
        try {
            const { toolName } = req.body,
                { originalEmail, email } = req.session.user;

            await app.model.fwTrackingLog.create({
                reqMethod: req.method,
                originalUserEmail: originalEmail,
                userEmail: email,
                url: req.url,
                reqBody: app.utils.stringify(req.body),
                reqAt: Date.now()
            });

            await app.service.executeService.run({
                email,
                param: { toolName },
                path: '/user/execute-task',
                task: 'executeTool',
                taskName: 'Chạy tool',
                customUrlParam: {}
            });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};