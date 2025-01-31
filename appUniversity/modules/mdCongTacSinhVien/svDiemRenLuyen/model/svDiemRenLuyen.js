// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svDiemRenLuyen.foo = () => { };
    app.model.svDiemRenLuyen.createOrUpdate = async (condition, changes) => {
        let item = await app.model.svDiemRenLuyen.createOrUpdate.get(condition);
        if (item) {
            item = await app.model.svDiemRenLuyen.createOrUpdate.update(condition, changes);
        } else {
            item = await app.model.svDiemRenLuyen.createOrUpdate.create({ ...condition, ...changes });
        }
        return item;
    };
};