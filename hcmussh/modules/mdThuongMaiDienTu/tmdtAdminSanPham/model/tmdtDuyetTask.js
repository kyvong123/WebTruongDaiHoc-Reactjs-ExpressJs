// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.tmdtDuyetTask.foo = async () => { };
    app.model.tmdtDuyetTask.searchPageWithImages = async (_pageNumber, _pageSize, filterStringify, searchTerm) => {
        const page = await app.model.tmdtDuyetTask.searchPage(_pageNumber, _pageSize, filterStringify, searchTerm);
        let { pagenumber, pagesize, pagetotal, totalitem, rows } = page;
        const { getSanPhamDraftSaveFolder, getSanPhamDraftSaveUrl } = require('../../tmdtSellerDashboard/controller/util')(app);

        for (let item of rows) {
            const images = app.fs.existsSync(getSanPhamDraftSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamDraftSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(img => app.path.join(getSanPhamDraftSaveUrl(item.id), img));
            }
        }

        return { pagenumber, pagesize, pagetotal, totalitem, rows };
    };

    app.model.tmdtDuyetTask.searchPageByDaiLyWithImages = async (_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy) => {
        const page = await app.model.tmdtDuyetTask.searchPageByDaiLy(_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy);
        let { pagenumber, pagesize, pagetotal, totalitem, rows } = page;
        const { getSanPhamDraftSaveFolder, getSanPhamDraftSaveUrl } = require('../../tmdtSellerDashboard/controller/util')(app);

        for (let item of rows) {
            const images = app.fs.existsSync(getSanPhamDraftSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamDraftSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(img => app.path.join(getSanPhamDraftSaveUrl(item.id), img));
            }
        }

        return { pagenumber, pagesize, pagetotal, totalitem, rows };
    };
};