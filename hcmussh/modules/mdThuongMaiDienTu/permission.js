module.exports = () => {
    const isTmdtYShopTestBeta = false;
    return {
        isTmdtYShopTestBeta,

        /**
         * Admin
         */
        tmdtAdminDaiLyManageRead: isTmdtYShopTestBeta ? 'tmdtAdminDaiLyManage:readTest' : 'tmdtAdminDaiLyManage:read',
        tmdtAdminDaiLyManageWrite: isTmdtYShopTestBeta ? 'tmdtAdminDaiLyManage:writeTest' : 'tmdtAdminDaiLyManage:write',
        tmdtAdminDaiLyManageDelete: isTmdtYShopTestBeta ? 'tmdtAdminDaiLyManage:deleteTest' : 'tmdtAdminDaiLyManage:delete',

        tmdtAdminSanPhamManageRead: isTmdtYShopTestBeta ? 'tmdtAdminSanPhamManage:readTest' : 'tmdtAdminSanPhamManage:read',
        tmdtAdminSanPhamManageWrite: isTmdtYShopTestBeta ? 'tmdtAdminSanPhamManage:writeTest' : 'tmdtAdminSanPhamManage:write',
        tmdtAdminSanPhamManageDelete: isTmdtYShopTestBeta ? 'tmdtAdminSanPhamManage:deleteTest' : 'tmdtAdminSanPhamManage:delete',

        tmdtAdminDuyetTaskManageRead: isTmdtYShopTestBeta ? 'tmdtAdminDuyetTaskManage:readTest' : 'tmdtAdminDuyetTaskManage:read',
        tmdtAdminDuyetTaskManageWrite: isTmdtYShopTestBeta ? 'tmdtAdminDuyetTaskManage:writeTest' : 'tmdtAdminDuyetTaskManage:write',
        tmdtAdminDuyetTaskManageDelete: isTmdtYShopTestBeta ? 'tmdtAdminDuyetTaskManage:deleteTest' : 'tmdtAdminDuyetTaskManage:delete',

        tmdtDmLoaiSanPhamRead: isTmdtYShopTestBeta ? 'tmdtDmLoaiSanPham:readTest' : 'tmdtDmLoaiSanPham:read',
        tmdtDmLoaiSanPhamWrite: isTmdtYShopTestBeta ? 'tmdtDmLoaiSanPham:writeTest' : 'tmdtDmLoaiSanPham:write',
        tmdtDmLoaiSanPhamDelete: isTmdtYShopTestBeta ? 'tmdtDmLoaiSanPham:deleteTest' : 'tmdtDmLoaiSanPham:delete',

        tmdtDmTagSanPhamRead: isTmdtYShopTestBeta ? 'tmdtDmTagSanPham:readTest' : 'tmdtDmTagSanPham:read',
        tmdtDmTagSanPhamWrite: isTmdtYShopTestBeta ? 'tmdtDmTagSanPham:writeTest' : 'tmdtDmTagSanPham:write',
        tmdtDmTagSanPhamDelete: isTmdtYShopTestBeta ? 'tmdtDmTagSanPham:deleteTest' : 'tmdtDmTagSanPham:delete',

        /**
         * Seller
         */
        // tmdtSellerSanPhamDraft coi là permission cho toàn bộ thao tác của đại lý đối với sản phẩm và đơn hàng 
        tmdtSellerSanPhamDraftRead: isTmdtYShopTestBeta ? 'tmdtSellerSanPhamDraft:readTest' : 'tmdtSellerSanPhamDraft:read',
        tmdtSellerSanPhamDraftWrite: isTmdtYShopTestBeta ? 'tmdtSellerSanPhamDraft:writeTest' : 'tmdtSellerSanPhamDraft:write',
        tmdtSellerSanPhamDraftDelete: isTmdtYShopTestBeta ? 'tmdtSellerSanPhamDraft:deleteTest' : 'tmdtSellerSanPhamDraft:delete',

        // TODO - Trưởng đại lý
        tmdtTruongDaiLyManageRead: isTmdtYShopTestBeta ? 'tmdtTruongDaiLyManage:readTest' : 'tmdtTruongDaiLyManage:read',
        tmdtTruongDaiLyManageWrite: isTmdtYShopTestBeta ? 'tmdtTruongDaiLyManage:writeTest' : 'tmdtTruongDaiLyManage:write',
        tmdtTruongDaiLyManageDelete: isTmdtYShopTestBeta ? 'tmdtTruongDaiLyManage:deleteTest' : 'tmdtTruongDaiLyManage:delete',

        // TODO - Quyền thành viên riêng biệt với quyền trưởng đại lý
        tmdtMemberDaiLyManageRead: isTmdtYShopTestBeta ? 'tmdtMemberDaiLyManage:readTest' : 'tmdtMemberDaiLyManage:read',
        tmdtMemberDaiLyManageWrite: isTmdtYShopTestBeta ? 'tmdtMemberDaiLyManage:writeTest' : 'tmdtMemberDaiLyManage:write',
        tmdtMemberDaiLyManageDelete: isTmdtYShopTestBeta ? 'tmdtMemberDaiLyManage:deleteTest' : 'tmdtMemberDaiLyManage:delete',

        /**
         * User Y-Shop
         */
        tmdtUserSanPhamHomePage: isTmdtYShopTestBeta ? 'tmdtUserSanPhamHomePage:readTest' : 'tmdtUserSanPhamHomePage:read',
    };
};