module.exports = (app) => {
    /**
     * TODO(thinh): viết lại routine mới
     */

    app.model.tmdtSanPham.getItemDetail = async (id) => {
        const { getSanPhamSaveFolder, getSanPhamSaveUrl } = require('../controller/util')(app);
        const item = await app.model.tmdtSanPham.get({ id });
        const loaiSanPham = await app.model.tmdtDmLoaiSanPham.get({ id: item.maLoaiSanPham });
        const daiLy = await app.model.tmdtDaiLy.get({ id: item.maDaiLy });
        const tagList = ((await app.model.tmdtSanPhamTagMap.getAll({ maSanPham: item.id })).map(i => i.maTag)).toString();
        const images = await app.fs.existsSync(getSanPhamSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamSaveFolder(item.id));
        if (images) {
            item.imagesUrl = images.map(img => app.path.join(getSanPhamSaveUrl(item.id), img));
        }
        return { ...item, tenLoaiSanPham: loaiSanPham.ten, tenDaiLy: daiLy.ten, tagList };
    };
    app.model.tmdtSanPham.getDraftItemDetail = async (id) => {
        const { getSanPhamDraftSaveFolder, getSanPhamDraftSaveUrl } = require('../../tmdtSellerDashboard/controller/util')(app);
        const item = await app.model.tmdtSanPhamDraft.get({ id });
        const loaiSanPham = await app.model.tmdtDmLoaiSanPham.get({ id: item.maLoaiSanPham });
        const daiLy = await app.model.tmdtDaiLy.get({ id: item.maDaiLy });
        const tagList = ((await app.model.tmdtSanPhamTagMapDraft.getAll({ maDuyetTask: item.id })).map(i => i.maTag)).toString();
        const images = await app.fs.existsSync(getSanPhamDraftSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamDraftSaveFolder(item.id));
        if (images) {
            item.imagesUrl = images.map(img => app.path.join(getSanPhamDraftSaveUrl(item.id), img));
        }
        return { ...item, tenLoaiSanPham: loaiSanPham.ten, tenDaiLy: daiLy.ten, tagList };
    };

    app.model.tmdtSanPham.searchPageByDaiLyWithImages = async (_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy) => {
        const page = await app.model.tmdtSanPham.searchPageByDaiLy(_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy);
        let { pagenumber, pagesize, pagetotal, totalitem, rows } = page;
        const { getSanPhamSaveFolder, getSanPhamSaveUrl } = require('../controller/util')(app);

        for (let item of rows) {
            const images = app.fs.existsSync(getSanPhamSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(img => app.path.join(getSanPhamSaveUrl(item.id), img));
            }
        }
        return { pagenumber, pagesize, pagetotal, totalitem, rows };
    };

    app.model.tmdtSanPham.searchPageWithImages = async (_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy) => {
        const page = await app.model.tmdtSanPham.searchPage(_pageNumber, _pageSize, filterStringify, searchTerm, maDaiLy);
        let { pagenumber, pagesize, pagetotal, totalitem, rows } = page;
        const { getSanPhamSaveFolder, getSanPhamSaveUrl } = require('../controller/util')(app);

        for (let item of rows) {
            const images = app.fs.existsSync(getSanPhamSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(img => app.path.join(getSanPhamSaveUrl(item.id), img));
            }
        }
        return { pagenumber, pagesize, pagetotal, totalitem, rows };
    };

    /**
     * TODO: Sửa lại đống ở dưới 
     */
    app.model.tmdtSanPham.searchUserHomePageWithImages = async (_pageNumber, _pageSize, filterStringify, searchTerm) => {
        const page = await app.model.tmdtSanPham.searchUserHomePage(_pageNumber, _pageSize, filterStringify, searchTerm);
        let { pagenumber, pagesize, pagetotal, totalitem, rows } = page;
        const { getSanPhamSaveFolder, getSanPhamSaveUrl } = require('../controller/util')(app);

        for (let item of rows) {
            const images = app.fs.existsSync(getSanPhamSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(img => app.path.join(getSanPhamSaveUrl(item.id), img));
            }
        }
        return { pagenumber, pagesize, pagetotal, totalitem, rows };
    };
};