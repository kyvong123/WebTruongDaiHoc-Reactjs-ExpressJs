// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.hcthCongTacLog.createLog = async (id, req) => {
        try {
            const item = await app.model.hcthCongTacItem.getItem(id);
            await app.model.hcthCongTacLog.create({ id: item.id, itemData: app.utils.stringify(item), thoiGian: Date.now(), nguoiTao: req.session.user.shcc });
        } catch (error) {
            console.error('Create cong tac log fail', error);
        }
    };
};