const archiver = require('archiver');

module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);
    const { getBackupFileUrl } = require('./variables')(app, serviceConfig);
    const backupPath = app.path.join(app.assetPath, 'backup');
    const SPLIT_INDEX = 250000;

    app.fs.createFolder(backupPath);

    const archiveFilesProcess = (files, archivePath, archiveFileName, backupPath) => new Promise((resolve) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const resultFile = app.path.join(archivePath, archiveFileName);
        const output = app.fs.createWriteStream(resultFile);

        output.on('close', () => setTimeout(() => {
            resolve();
        }, 1000));

        files.forEach(file => {
            archive.file(app.path.join(backupPath, file), { name: file });
        });
        archive.on('error', error => {
            console.error(`${serviceConfig.name}:backup`, 'Sub archive:', files.toString(), error);
        });
        archive.pipe(output);
        archive.finalize();
    });

    const backupDatabase = async (databaseName) => {
        try {
            const database = serviceConfig.db[databaseName];
            if (database) {
                const yyyymmddDDMM = app.date.dateTimeFormat(new Date(), 'yyyymmdd-MMDD');
                const currentBackupPath = app.path.join(backupPath, databaseName + '-' + yyyymmddDDMM);
                const currentArchivePath = app.path.join(backupPath, databaseName + '-Archives_' + yyyymmddDDMM);
                
                app.fs.createFolder(currentBackupPath);
                app.fs.createFolder(currentArchivePath);

                // Make JSON data
                const tableNames = await app.model.fwBackup.getAllTables(databaseName, database);
                for (let i = 0; i < tableNames.length; i++) {
                    let splitIndex = SPLIT_INDEX;
                    const tableName = tableNames[i];
                    const count = parseInt(await app.model.fwBackup.count(databaseName, tableName));

                    if (tableName == 'TC_BANK_REQUEST') {
                        splitIndex = 10000;
                    }

                    console.log(i, 'tableName:', tableName);
                    if (count <= splitIndex) {
                        const rows = await app.model.fwBackup.backupTable(databaseName, tableName);
                        app.fs.writeFileSync(app.path.join(currentBackupPath, `${tableName}.json`), JSON.stringify(rows));
                    } else {
                        const column = await app.model.fwBackup.getColumn(database, databaseName, tableName);
                        const pageTotal = Math.ceil(count / splitIndex);

                        for (let pageNumber = 1; pageNumber <= pageTotal; pageNumber++) {
                            const leftIndex = (pageNumber - 1) * splitIndex;
                            const rows = await app.model.fwBackup.backupTablePage(databaseName, tableName, column, leftIndex + 1, leftIndex + splitIndex);

                            app.fs.writeFileSync(app.path.join(currentBackupPath, `${tableName}_${pageNumber}.json`), JSON.stringify(rows));
                        }
                    }
                }

                // Archive
                const allFiles = app.fs.readdirSync(currentBackupPath);
                let index = 1;

                while (allFiles.length) {
                    const splitFiles = allFiles.splice(0, 100);
                    
                    await archiveFilesProcess(splitFiles, currentArchivePath, 'archive_' + index + '.zip', currentBackupPath);
                    index++;
                }

                const resultFinalFile = app.path.join(backupPath, databaseName + '-' + yyyymmddDDMM + '.zip');
                const finalOutput = app.fs.createWriteStream(resultFinalFile);
                const archive = archiver('zip', { zlib: { level: 9 } });

                archive.directory(currentArchivePath, 'archives');
                archive.on('error', error => {
                    console.error(`${serviceConfig.name}:backup`, 'Archive:', databaseName, error);
                    app.messageQueue.send(`${serviceConfig.name}:backupResult`, { databaseName, error: 'Error when archive!' });
                });
                archive.pipe(finalOutput);
                archive.finalize();

                finalOutput.on('close', () => setTimeout(() => {
                    app.fs.deleteFolder(currentBackupPath);
                    app.fs.deleteFolder(currentArchivePath);
                    app.messageQueue.send(`${serviceConfig.name}:backupResult`, { databaseName, resultFinalFile });
                    console.log(yyyymmddDDMM, '- Backup done:', resultFinalFile);
                }, 1000));
            } else {
                console.error(`${serviceConfig.name}:backup`, 'Invalid database name:', databaseName);
                app.messageQueue.send(`${serviceConfig.name}:backupResult`, { databaseName, error: 'Invalid database name!' });
            }
        } catch (error) {
            console.error(`${serviceConfig.name}:backup`, error);
            app.messageQueue.send(`${serviceConfig.name}:backupResult`, { databaseName, error });
        }
    };

    // Nhận lệnh backup database
    app.messageQueue.consume(`${serviceConfig.name}:backup`, async (message) => await backupDatabase(JSON.parse(message).databaseName));


    // Tải về main service tập tin backup
    app.get(getBackupFileUrl, app.permission.isLocalIp, (req, res) => {
        const { resultFile } = req.query;
        if (resultFile && app.fs.existsSync(resultFile)) {
            try {
                // Tạo stream gửi file Zip về Main service
                const stream = app.fs.createReadStream(resultFile, { encoding: 'base64' });
                stream.on('end', () => setTimeout(() => app.fs.unlinkSync(resultFile), 1000));
                stream.pipe(res);
            } catch (error) {
                res.send({ error: 'Read file error!' });
                console.error(resultFile, error);
            }
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });

    app.get('/test', async (req, res) => {
        const databaseNames = Object.keys(serviceConfig.db);
        for (let i = 0; i < databaseNames.length; i++) {
            await backupDatabase(databaseNames[i]);
        }
        res.end();
    });

    // Backup database mỗi đêm
    const schedule = require('node-schedule');
    app.primaryWorker && schedule.scheduleJob('0 1 * * *', async () => {
        const databaseNames = Object.keys(serviceConfig.db);
        for (let i = 0; i < databaseNames.length; i++) {
            await backupDatabase(databaseNames[i]);
        }
    });
};