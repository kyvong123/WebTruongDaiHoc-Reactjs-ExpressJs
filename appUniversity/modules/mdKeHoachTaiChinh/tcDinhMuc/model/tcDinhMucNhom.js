// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcDinhMucNhom.foo = () => { };
    app.model.tcDinhMucNhom.bulkCreate = async (list) => {
        return await Promise.all(list.map(item => app.model.tcDinhMucNhom.create(item)));
    };
};