// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.hcthCongTacTicket.getItem = async (id) => {
        const item = await app.model.hcthCongTacTicket.get({ id });
        item.nguoiTaoItem = await app.model.tchcCanBo.get({ shcc: item.nguoiTao });
        item.congTacItems = await app.model.hcthCongTacTicket.getItems(app.utils.stringify({ ticketId: item.id })).then(({ rows }) => rows).then(items => {
            items.forEach(i => {
                i.thanhPhan = app.utils.parse(i.thanhPhan, []);
                i.censorMessages = app.utils.parse(i.censorMessages, []);
            });
            return items;
        });
        return item;
    };

    app.model.hcthCongTacTicket.deleteItem = async (id) => {
        let item = await app.model.hcthCongTacTicket.getItem(id);
        if (item.congTacItems?.length) {
            await Promise.all(item.congTacItems.map(i => app.model.hcthCongTacItem.deleteItem(i.id)));
        }
        await app.model.hcthCongTacTicket.delete({ id: item.id });
        //TODO:LONG
    };
};