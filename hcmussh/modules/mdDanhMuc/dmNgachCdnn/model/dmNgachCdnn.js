// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmNgachCdnn.foo = () => { };
    app.model.dmNgachCdnn.getAllDetail = async (condition, selectedColumns, orderBy, done) => {
        try {
            let ngachCdnnItems = await app.model.dmNgachCdnn.getAll(condition, selectedColumns, orderBy, done);
            if (ngachCdnnItems == null) ngachCdnnItems = [];
            const ngachLuongCdnnItems = await Promise.all(ngachCdnnItems.map(async (ngachCdnnItem) => {
                const ngachLuongs = await app.model.dmNgachLuong.getAll({ idNgach: ngachCdnnItem.id }, '*', 'bac');
                return {
                    ...ngachCdnnItem,
                    luongs: ngachLuongs || []
                };
            }));
            return ngachLuongCdnnItems;
        } catch (error) {
            console.error('[app.model.dmNgachCdnn.getAllDetail] error', error);
            return null;
        }
    };
};