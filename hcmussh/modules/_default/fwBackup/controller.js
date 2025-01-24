module.exports = (app, appConfig) => {
    const backupPath = app.path.join(app.assetPath, 'backup');
    app.fs.createFolder(backupPath);

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            1007: { title: 'Backup', link: '/user/backup', icon: 'fa-database', backgroundColor: '#ba68c8' }
        }
    };
    app.permission.add({ name: 'backup:manage', menu }, 'backup:write', 'backup:delete');

    app.get('/user/backup', app.permission.check('backup:manage'), app.templates.admin);

    // Backup APIs ---------------------------------------------------------------------------------------------------------------------------------
    const getBackupData = () => {
        const files = [];
        app.fs.readdirSync(backupPath).forEach(fileName => {
            const state = app.fs.statSync(backupPath + '/' + fileName);
            state.isFile() && fileName.endsWith('.zip') && files.push({ name: fileName, createdDate: state.birthtime });
        });
        return { databases: Object.keys(appConfig.db), files };
    };

    app.get('/api/backup/all', app.permission.check('backup:manage'), async (req, res) => res.send(getBackupData()));

    app.get('/api/backup/tables', app.permission.check('backup:manage'), async (req, res) => {
        const { databaseName } = req.query,
            database = appConfig.db[databaseName];
        database ? res.send({ tables: await app.model.fwBackup.getAllTables(databaseName, database) }) : res.send({ error: 'Invalid parameter!' });
    });

    app.get('/api/backup/download/:fileName', app.permission.check('backup:manage'), async (req, res) => {
        const filePath = app.path.join(backupPath, req.params.fileName);
        if (app.fs.existsSync(filePath) && filePath.startsWith(backupPath) && filePath.endsWith('.zip')) {
            res.download(filePath);
        } else {
            res.send({ error: 'Invalid file name!' });
        }
    });

    app.post('/api/backup', app.permission.check('backup:write'), async (req, res) => {
        const { databaseName, tableName } = req.body;
        res.send(await app.service.backupService.backup(databaseName, tableName));
    });

    app.delete('/api/backup', app.permission.check('backup:delete'), async (req, res) => {
        const filePath = app.path.join(backupPath, req.body.fileName);
        if (app.fs.existsSync(filePath) && filePath.startsWith(backupPath) && filePath.endsWith('.zip')) {
            app.fs.deleteFile(filePath);
            res.send(getBackupData());
        } else {
            res.send({ error: 'Invalid file name!' });
        }
    });

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('addSocketListener:Backup', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('backup', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('backup:manage') && socket.join('backup');
        }),
    });
};