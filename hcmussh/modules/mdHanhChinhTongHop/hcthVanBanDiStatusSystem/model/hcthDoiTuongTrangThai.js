// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDoiTuongTrangThai.foo = () => { };
    app.model.hcthDoiTuongTrangThai.bulkCreate = (items) => Promise.all(items.map(item => app.model.hcthDoiTuongTrangThai.create(item)));
};