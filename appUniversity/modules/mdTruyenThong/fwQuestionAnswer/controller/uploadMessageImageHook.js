module.exports = app => {
    // Upload Hook -----------------------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'ttLienHeUploadFile'));

    app.uploadHooks.add('ttLienHeUploadFile', (req, fields, files, params, done) =>
        app.permission.has(req, async () => {
            await lienHeUploadImageHandler(req, fields, files, params, done);
        }, done)
    );

    const { maxImgNum, maxImgBoxNum } = require('./config')();

    const { emitFwQAUploadEvent } = require('./emitSocketEvent')(app);
    const { getUserTtLienUploadFolderUrl, getUserFwQaBoxUploadFolder } = require('./util')(app);

    const lienHeUploadImageHandler = async (req, fields, files, params, done) => {
        try {
            if (params.category == 'ttLienHeUploadFile' && files.ttLienHeUploadFile && files.ttLienHeUploadFile.length > 0) {
                const fwQaId = params.fwQaId;
                const user = req.session.user;
                const urlFolderPath = getUserTtLienUploadFolderUrl(user);
                const folderPath = app.path.join(app.publicPath, urlFolderPath);
                !app.fs.existsSync(folderPath) && app.fs.mkdirSync(folderPath, { recursive: true });

                // Check số hình trong hộp thư trước khi cho phép lưu hình
                const folderImageFwQaBox = getUserFwQaBoxUploadFolder(fwQaId);
                const fwQaMessageIds = app.fs.existsSync(folderImageFwQaBox) && app.fs.readdirSync(folderImageFwQaBox);
                let fwQaBoxImgCount = 0;
                fwQaMessageIds && fwQaMessageIds.length && fwQaMessageIds.forEach((fwQaMessageId) => {
                    const imageFiles = app.fs.existsSync(app.path.join(folderImageFwQaBox, fwQaMessageId)) && app.fs.readdirSync(app.path.join(folderImageFwQaBox, fwQaMessageId));
                    fwQaBoxImgCount += imageFiles.length;
                });
                if (fwQaBoxImgCount >= maxImgBoxNum) {
                    throw 'Hộp thư này đã đạt đến số lượng hình cho phép (20 hình mỗi hộp thư).';
                }

                const imageFiles = app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath);
                if (imageFiles.length + files.ttLienHeUploadFile.length > maxImgNum) throw 'Một tin nhắn chỉ được giới hạn tối đa 4 hình!';

                let imageFilenameList = [];
                let urlList = [];
                let errImg = [];
                for (let file of files.ttLienHeUploadFile) {
                    const srcPath = file.path;
                    const image = await app.jimp.read(srcPath);
                    app.fs.unlinkSync(srcPath);
                    if (image) {
                        if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                        const filePath = app.path.join(folderPath, app.path.basename(srcPath));
                        const urlFilePath = app.path.join(urlFolderPath, app.path.basename(srcPath));
                        image.write(filePath);
                        imageFilenameList.push(app.path.basename(srcPath));
                        urlList.push(urlFilePath);
                    } else {
                        errImg.push(image);
                    }
                }
                emitFwQAUploadEvent({ email: user.email, imageFilenameList });
                done({ images: urlList, errImg });
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    };
};