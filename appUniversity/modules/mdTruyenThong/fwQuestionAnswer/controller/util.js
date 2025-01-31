module.exports = app => ({
    getUserTtLienUploadFolderUrl: function (user) {
        return `/img/ttLienHeUploadFile/${user.email}`;
    },
    getUserTtLienUploadFolder: function (user) {
        return app.path.join(app.publicPath, `/img/ttLienHeUploadFile/${user.email}`);
    },
    getFwQaMessageUploadFolderUrl: function (fwQaId, fwQaMessageId) {
        return `/img/ttLienHeUploadFile/${fwQaId}/${fwQaMessageId}`;
    },
    getFwQaMessageUploadFolder: function (fwQaId, fwQaMessageId) {
        return app.path.join(app.publicPath, `/img/ttLienHeUploadFile/${fwQaId}/${fwQaMessageId}`);
    },
    getUserFwQaBoxUploadFolderUrl: function (fwQaId) {
        return `/img/ttLienHeUploadFile/${fwQaId}`;
    },
    getUserFwQaBoxUploadFolder: function (fwQaId) {
        return app.path.join(app.publicPath, `/img/ttLienHeUploadFile/${fwQaId}`);
    }
});