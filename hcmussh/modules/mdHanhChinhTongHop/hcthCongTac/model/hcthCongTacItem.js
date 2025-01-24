// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthCongTacItem.foo = async () => { };

    app.model.hcthCongTacItem.getPermissionChecker = (item, user) => {
        const { CongTacItemPermission } = require('../permissionClasses')(app);
        return new CongTacItemPermission(item, user);
    };

    app.model.hcthCongTacItem.getItem = async (id, fetchTicket) => {
        // const { resolveTrangThai } = require('../tools')(app);
        const item = await app.model.hcthCongTacItem.get({ id });
        if (!item) throw 'Lịch công tác không tồn tại';
        // let trangThai = resolveTrangThai(item, Date.now());
        // if (item.trangThai != trangThai) {
        //     item.trangThai = trangThai;
        //     await app.model.hcthCongTacItem.update({ id: item.id }, { trangThai });
        // }
        item.congTacTicket = (fetchTicket && item.congTacTicketId) ? await app.model.hcthCongTacTicket.get({ id: item.congTacTicketId }) : null;
        item.phongHopTicket = item.phongHopTicketId ? await app.model.hcthPhongHopTicket.get({ id: item.phongHopTicketId }) : null;
        item.phongHopItem = item.phongHopTicket ? await app.model.hcthDmPhongHop.get({ ma: item.phongHopTicket.phongHop }) : null;
        item.thanhPhan = await app.model.hcthCanBoNhan.getAllFrom(item.id, 'CONG_TAC_ITEM').then(data => data.rows);
        item.chuongTrinh = await app.model.hcthChuongTrinhHop.getList(item.id).then(data => data.rows);
        item.bienBan = await app.model.hcthBienBanKetLuan.getList(item.id).then(i => i.rows);
        item.chuTri = item.thanhPhan.find(i => i.vaiTro == 'CHU_TRI')?.shccCanBoNhan;
        item.phanHoi = await app.model.hcthPhanHoi.getAllFrom(item.id, 'LICH_HOP').then(i => i.rows);
        item.files = await app.model.hcthFile.getAllFrom(item.id, 'CONG_TAC_ITEM').then(i => i.rows);
        return item;
    };

    app.model.hcthCongTacItem.getInchargeStaff = (item) => {
        return [item.nguoiTao, ...item.canBoHop.filter(i => i.vaiTro == 'CHU_TRI' && i.trangThai == 'ACCEPTED').map(i => i.shccCanBoNhan)];
    };

    app.model.hcthCongTacItem.deleteItem = async (id) => {
        let item = await app.model.hcthCongTacItem.getItem(id);
        if (item.phongHopTicket) {
            await app.model.hcthPhongHopTicket.delete({ id: item.phongHopTicket.id });
        }
        await app.model.hcthCongTacItem.delete({ id: item.id });
        //TODO:LONG
    };
};