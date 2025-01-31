module.exports = app => {
    // Upload Hook -----------------------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, 'img', 'tmdtCauHinhSpUploadFile'));

    const { tmdtAdminSanPhamManageWrite } = require('../../permission.js')();
    const { getCauHinhUploadUrl, getCauHinhUploadFolder } = require('./util')(app);

    app.uploadHooks.add('tmdtCauHinhSpUploadFile', (req, fields, files, params, done) =>
        app.permission.has(req, async () => {
            await tmdtCauHinhSpUploadImageHandler(req, fields, files, params, done);
        }, done, tmdtAdminSanPhamManageWrite)
    );

    const tmdtCauHinhSpUploadImageHandler = async (req, fields, files, params, done) => {
        try {
            if (params.category == 'tmdtCauHinhSpUploadFile' && files.tmdtCauHinhSpUploadFile && files.tmdtCauHinhSpUploadFile.length > 0) {
                const user = req.session.user;
                // Lấy đường dẫn của thư mục tạm
                const userUploadUrl = getCauHinhUploadUrl(user.email);
                // Tạo đường dẫn đến thư mục tạm
                const userUploadFolder = getCauHinhUploadFolder(user.email);
                if (!app.fs.existsSync(userUploadFolder)) {
                    app.fs.mkdirSync(userUploadFolder, { recursive: true });
                } else {
                    app.fs.readdirSync(userUploadFolder).forEach(file => {
                        app.fs.unlinkSync(app.path.join(userUploadFolder, file));
                    });
                }
                const imageFile = files.tmdtCauHinhSpUploadFile[0];
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
    };
};