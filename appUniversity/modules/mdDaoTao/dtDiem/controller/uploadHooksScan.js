module.exports = app => {
    const folderGradeScan = app.path.join(app.assetPath, 'grade-scan'),
        jpgUploadedFolder = app.path.join(folderGradeScan, 'jpg-uploaded');

    app.uploadHooks.add('uploadGradeScanFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadGradeScanFile(req, fields, files, params, done), done, 'dtDiemScan:manage'));

    const uploadGradeScanFile = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('GradeScan') && files.GradeScanFile && files.GradeScanFile.length) {
            try {
                let listGradeScanFile = files.GradeScanFile,
                    validFiles = listGradeScanFile.filter(item => item.headers && item.headers['content-type'] == 'image/jpeg'),
                    invalidFiles = listGradeScanFile.filter(item => !(item.headers && item.headers['content-type'] == 'image/jpeg')).map(item => ({ ...item, errorId: 1, errorMsg: 'Invalid filetype: Not a JPEG file' }));
                if (validFiles.length) {
                    const { idSemester, idFolder } = params;
                    app.fs.createFolder(
                        app.path.join(jpgUploadedFolder, idSemester.toString()),
                        app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString())
                    );

                    for (let i = 0; i < listGradeScanFile.length; i++) {
                        let file = listGradeScanFile[i],
                            { originalFilename, path } = file;
                        const imagePath = app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString(), originalFilename);
                        await app.fs.rename(path, imagePath);
                    }
                }
                done && done({ validFiles, invalidFiles });
            } catch (error) {
                done && done(error);
            }
        }
    };
};