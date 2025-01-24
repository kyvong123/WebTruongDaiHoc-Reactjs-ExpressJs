// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthFollowLog.foo = async () => { };
    app.model.hcthFollowLog.updateOrCreate = async (congVanDenId, shcc) => {
        const item = await app.model.hcthFollowLog.get({ congVanDenId, shcc, phanHoiId: null, chiDaoId: null });
        if (!item) {
            return await app.model.hcthFollowLog.create({ congVanDenId, shcc, createdAt: Date.now() });
        } else
            return await app.model.hcthFollowLog.update({ id: item.id }, { createdAt: Date.now() });
    };
};