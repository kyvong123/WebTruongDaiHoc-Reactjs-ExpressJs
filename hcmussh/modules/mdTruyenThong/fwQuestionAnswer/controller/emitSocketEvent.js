module.exports = app => ({
    // Socket refresh trang Q&A hộp thư đến
    emitFwQaRefreshHopThuDen: (data, error) => { !error && app.io.to(`fwQAChuDe:${data.maChuDe}`).emit('fwQaRefreshHopThuDen', data); },
    // Socket refresh trang Q&A phụ trách
    emitFwQaRefreshPhuTrach: (data, error) => { !error && app.io.to(data.email).emit('fwQaRefreshPhuTrach', data); },
    // Socket refresh trang Q&A user
    emitFwQaRefreshUser: (data, error) => { !error && app.io.to(data.email).emit('fwQaRefreshUser', data); },

    // Socket refresh trang Blackbox Admin
    emitFwBlackboxRefreshAdmin: (data, error) => { !error && app.io.to('fwBlackboxAdmin').emit('fwBlackboxRefreshAdmin', data); }, 
    // Socket refresh trang Blackbox hộp thư đến
    emitFwBlackboxRefreshHopThuDen: (data, error) => { !error && app.io.to(`fwBlackboxDonVi:${data.maDonVi}`).emit('fwBlackboxRefreshHopThuDen', data); },
    // Socket refresh trang Blackbox phụ trách
    emitFwBlackboxRefreshPhuTrach: (data, error) => { !error && app.io.to(data.email).emit('fwBlackboxRefreshPhuTrach', data); },
    // Socket refresh trang Q&A user
    emitFwBlackboxRefreshUser: (data, error) => { !error && app.io.to(data.email).emit('fwBlackboxRefreshUser', data); },

    // Socket refresh chat
    emitFwChatboxRefreshEvent: (data, error) => { !error && app.io.to(data.email).emit('fwChatboxRefresh', data); },

    // Socket refesh trang notification trên mobile và nút notification hộp thư trên web
    emitFwQaBlackboxNotiEvent: (data, error) => { !error && app.io.to(data.email).emit('fwQaBlackboxNotiUserEvent', data); },
});
