module.exports = (app) => ({
    getSanPhamDraftUploadUrl: (email) => `/img/tmdtDraftUpload/${email}`,
    getSanPhamDraftUploadFolder: (email) => app.path.join(app.publicPath, `/img/tmdtDraftUpload/${email}`),
    getSanPhamDraftSaveUrl: (duyetTaskId) => `/img/tmdtDraftUpload/${duyetTaskId}`,
    getSanPhamDraftSaveFolder: (duyetTaskId) => app.path.join(app.publicPath, `/img/tmdtDraftUpload/${duyetTaskId}`),

    getCauHinhDraftUploadUrl: (email) => `/img/tmdtCauHinhSpDraftUpload/${email}`,
    getCauHinhDraftUploadFolder: (email) => app.path.join(app.publicPath, `/img/tmdtCauHinhSpDraftUpload/${email}`),
    getCauHinhDraftSaveUrl: (duyetTaskId) => `/img/tmdtCauHinhSpDraftUpload/${duyetTaskId}`,
    getCauHinhDraftSaveFolder: (duyetTaskId) => app.path.join(app.publicPath, `/img/tmdtCauHinhSpDraftUpload/${duyetTaskId}`),

    sendNotificationToBuyer: async (userEmail, subDon) => {
        let text;
        switch (subDon.trangThai.toString()) {
            case '2':
                text = 'Xác nhận';
                break;
            case '3':
                text = 'Thanh toán';
                break;
        }
        if (text) {
            await app.notification.send({
                toEmail: userEmail,
                title: `${text} đơn hàng thành công`,
                subTitle: `Đơn hàng #${subDon.id} đã được ${text.toLowerCase()} thành công `,
                icon: 'fa-check', iconColor: 'success', firebaseNotify: true,
            });
        }
    },
});