module.exports = (app) => ({
    getSanPhamUploadUrl: (email) => `/img/tmdtSpUploadFile/${email}`,
    getSanPhamUploadFolder: (email) => app.path.join(app.publicPath, `/img/tmdtSpUploadFile/${email}`),
    getSanPhamSaveUrl: (spId) => `/img/tmdtSpUploadFile/${spId}`,
    getSanPhamSaveFolder: (spId) => app.path.join(app.publicPath, `/img/tmdtSpUploadFile/${spId}`),

    getCauHinhUploadUrl: (email) => `/img/tmdtCauHinhSpUploadFile/${email}`,
    getCauHinhUploadFolder: (email) => app.path.join(app.publicPath, `/img/tmdtCauHinhSpUploadFile/${email}`),
    getCauHinhSaveUrl: (cauHinhId) => `/img/tmdtCauHinhSpUploadFile/${cauHinhId}`,
    getCauHinhSaveFolder: (cauHinhId) => app.path.join(app.publicPath, `/img/tmdtCauHinhSpUploadFile/${cauHinhId}`),
});