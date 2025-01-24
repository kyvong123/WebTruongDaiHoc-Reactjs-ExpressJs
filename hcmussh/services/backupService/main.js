module.exports = (app, serviceConfig) => {
    const { getBackupFileUrl } = require('./variables')(app, serviceConfig);
    const backupPath = app.path.join(app.assetPath, 'backup');
    app.fs.createFolder(backupPath);

    // Các chức năng của service
    app.service[serviceConfig.name] = {
        backup: async (databaseName, tableName) => {
            if (tableName) {
                return await app.model.fwBackup.backupTable(databaseName, tableName);
            } else {
                app.messageQueue.send(`${serviceConfig.name}:backup`, { databaseName });
                return {};
            }
        },
    };

    app.messageQueue.consume(`${serviceConfig.name}:backupResult`, async (message) => {
        const { databaseName, resultFile, error } = JSON.parse(message);
        if (!error && resultFile) {
            const url = app.service.url(getBackupFileUrl, serviceConfig);
            const response = await app.service.get(url, { resultFile });
            if (!response.error) {
                app.fs.writeFileSync(app.path.join(backupPath, app.path.basename(resultFile)), response, { encoding: 'base64' });
                app.io.to('backup').emit('backup-changed', { databaseName, error });
            }
        }
    });
};