// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.fwENewsItem.createOrUpdate = async (condition, changes) => {
        let item = await app.model.fwENewsItem.get(condition);
        if (item) {
            item = await app.model.fwENewsItem.update(condition, changes);
        } else {
            item = await app.model.fwENewsItem.create({ ...condition, ...changes });
        }

        return item;
    };
};