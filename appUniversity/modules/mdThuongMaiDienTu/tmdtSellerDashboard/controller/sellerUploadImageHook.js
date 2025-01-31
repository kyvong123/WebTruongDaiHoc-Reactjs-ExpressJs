module.exports = app => {
    // Upload Hook -----------------------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'tmdtDraftUpload'));
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'tmdtCauHinhSpDraftUpload'));

    const { tmdtSellerSanPhamDraftWrite } = require('../../permission.js')();
    const { getSanPhamDraftUploadFolder, getSanPhamDraftUploadUrl, getCauHinhDraftUploadUrl, getCauHinhDraftUploadFolder } = require('./util')(app);

    app.uploadHooks.add('tmdtDraftUpload', (req, fields, files, params, done) =>
        app.permission.has(req, async () => {
            await tmdtDraftUploadHandler(req, fields, files, params, done);
        }, done, tmdtSellerSanPhamDraftWrite)
    );

    const tmdtDraftUploadHandler = async (req, fields, files, params, done) => {
        try {
            if (params.category == 'tmdtDraftUpload' && files.tmdtDraftUpload && files.tmdtDraftUpload.length > 0) {
                const imageSpMax = await app.model.tmdtSetting.getValue('imageSpMax');
                const user = req.session.user;
                const userUploadUrl = getSanPhamDraftUploadUrl(user.email);
                const userUploadFolder = getSanPhamDraftUploadFolder(user.email);
                !app.fs.existsSync(userUploadFolder) && app.fs.mkdirSync(userUploadFolder, { recursive: true });

                const imageFiles = app.fs.existsSync(userUploadFolder) && app.fs.readdirSync(userUploadFolder);
                if (imageFiles.length + files.tmdtDraftUpload.length > imageSpMax['imageSpMax']) {
                    throw 'Một sản phẩm chỉ có thể upload ' + imageSpMax['imageSpMax'] + ' hình!';
                }

                let urlList = [];
                let errImg = [];
                for (let file of files.tmdtDraftUpload) {
                    const srcPath = file.path;
                    const image = await app.jimp.read(srcPath);
                    app.fs.unlinkSync(srcPath);
                    if (image) {
                        if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                        const filePath = app.path.join(userUploadFolder, app.path.basename(srcPath));
                        const urlFilePath = app.path.join(userUploadUrl, app.path.basename(srcPath));
                        image.write(filePath);
                        urlList.push(urlFilePath);
                    } else {
                        errImg.push(image);
                    }
                }
                done({ images: urlList, errImg });
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    };

    app.uploadHooks.add('tmdtCauHinhSpDraftUpload', (req, fields, files, params, done) =>
        app.permission.has(req, async () => {
            await tmdtCauHinhSpDraftUploadHandler(req, fields, files, params, done);
        }, done, tmdtSellerSanPhamDraftWrite)
    )

    const tmdtCauHinhSpDraftUploadHandler = async (req, fields, files, params, done) => {
        try {
            if (params.category == 'tmdtCauHinhSpDraftUpload' && files.tmdtCauHinhSpDraftUpload && files.tmdtCauHinhSpDraftUpload.length > 0) {
                const user = req.session.user;
                const userUploadUrl = getCauHinhDraftUploadUrl(user.email);
                const userUploadFolder = getCauHinhDraftUploadFolder(user.email);
                if (!app.fs.existsSync(userUploadFolder)) {
                    app.fs.mkdirSync(userUploadFolder, { recursive: true });
                } else {
                    app.fs.readdirSync(userUploadFolder).forEach(file => {
                        app.fs.unlinkSync(app.path.join(userUploadFolder, file));
                    });
                }
                const imageFile = files.tmdtCauHinhSpDraftUpload[0];
                const image = await app.jimp.read(imageFile.path);
                app.fs.unlinkSync(imageFile.path);

                if (image) {
                    if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                    const filePath = app.path.join(userUploadFolder, app.path.basename(imageFile.path));
                    const urlFilePath = app.path.join(userUploadUrl, app.path.basename(imageFile.path));
                    image.write(filePath);
                    done({ image: urlFilePath.replaceAll(/[\\]/, '/') });
                } else {
                    done({ error: 'Lỗi upload hình' });
                }
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    }
};