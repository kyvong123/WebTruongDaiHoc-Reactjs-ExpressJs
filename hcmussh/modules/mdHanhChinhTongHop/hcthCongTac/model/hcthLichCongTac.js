// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthLichCongTac.foo = async () => { };
    app.model.hcthLichCongTac.getItem = async (id) => {
        const item = await app.model.hcthLichCongTac.get({ id });
        let ticketItems = await app.model.hcthCongTacTicket.searchPage(1, 500, app.utils.stringify({ lichCongTacId: item.id }), '').then(i => i.rows);
        item.ticketItems = await Promise.all(ticketItems.map(i => app.model.hcthCongTacTicket.getItem(i.id).then(item => ({ ...i, ...item }))));
        item.luuY = await app.model.hcthLichCongTacNote.getAll({ lichId: item.id }, '*', 'id');
        item.canBoKiemDuyet = app.utils.parse(item.canBoKiemDuyet, []);
        item.danhSachCanBoKiemDuyet = await app.model.tchcCanBo.getAll({
            statement: 'shcc in (:shccs)',
            parameter: { shccs: item.canBoKiemDuyet }
        }, 'shcc, ten, ho');
        item.directTasks = await app.model.hcthCongTacTicket.getItems(app.utils.stringify({ lichId: item.id })).then(({ rows }) => rows).then(items => {
            items.forEach(i => {
                i.thanhPhan = app.utils.parse(i.thanhPhan, []);
                i.censorMessages = app.utils.parse(i.censorMessages, []);
            });
            return items;
        });

        return item;
    };

    app.model.hcthLichCongTac.getCensorsStaff = async () => {
        const users = await app.model.tchcCanBo.getAll({ maDonVi: 68 });
        const truongPhongHcth = await app.model.tchcCanBo.get({ shcc: 'QSX7610151' }); //TODO: Long
        return [...users, truongPhongHcth];
    };
};