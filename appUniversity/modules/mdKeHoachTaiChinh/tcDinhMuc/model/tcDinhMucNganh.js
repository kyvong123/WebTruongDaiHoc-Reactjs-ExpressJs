// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcDinhMucNganh.foo = () => { };
    app.model.tcDinhMucNganh.bulkCreate = async (list) => {
        return await Promise.all(list.map(item => app.model.tcDinhMucNganh.create(item)));
    };
};