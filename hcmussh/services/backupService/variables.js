module.exports = (app, serviceConfig) => ({
    getBackupFileUrl: `/api/${serviceConfig.name}/backupFile`,
});