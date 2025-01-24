module.exports = app => {
    // Upload Hook -----------------------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'tmdtSpUploadFile'));

    const { tmdtAdminSanPhamManageWrite } = require('../../permission.js')();

    app.uploadHooks.add('tmdtSpUploadFile', (req, fields, files, params, done) =>
        app.permission.has(req, async () => {
            await tmdtSpUploadImageHandler(req, fields, files, params, done);
        }, done, tmdtAdminSanPhamManageWrite)
    );
    const { getSanPhamUploadUrl } = require('./util')(app);

    const tmdtSpUploadImageHandler = async (req, fields, files, params, done) => {
        try {
            if (params.category == 'tmdtSpUploadFile' && files.tmdtSpUploadFile && files.tmdtSpUploadFile.length > 0) {
                let imageSpMax = await app.model.tmdtSetting.getValue('imageSpMax');
                const user = req.session.user;
                // Lấy đường dẫn của thư mục tạm
                const urlFolderPath = getSanPhamUploadUrl(user.email);
                // Tạo đường dẫn đến thư mục tạm
                const userUploadFolderPath = app.path.join(app.publicPath, urlFolderPath);
                !app.fs.existsSync(userUploadFolderPath) && app.fs.mkdirSync(userUploadFolderPath, { recursive: true });

                const imageFiles = app.fs.existsSync(userUploadFolderPath) && app.fs.readdirSync(userUploadFolderPath);
                if (imageFiles.length + files.tmdtSpUploadFile.length > imageSpMax['imageSpMax']) {
                    throw 'Một sản phẩm chỉ có thể upload ' + imageSpMax['imageSpMax'] + ' hình!';
                }

                let imageFilenameList = [];
                let urlList = [];
                let errImg = [];
                for (let file of files.tmdtSpUploadFile) {
                    const srcPath = file.path;
                    const image = await app.jimp.read(srcPath);
                    app.fs.unlinkSync(srcPath);
                    if (image) {
                        if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                        const filePath = app.path.join(userUploadFolderPath, app.path.basename(srcPath));
                        const urlFilePath = app.path.join(urlFolderPath, app.path.basename(srcPath));
                        image.write(filePath);
                        imageFilenameList.push(app.path.basename(srcPath));
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
};