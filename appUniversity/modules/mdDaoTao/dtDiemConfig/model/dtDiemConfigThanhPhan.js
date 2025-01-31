// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDiemConfigThanhPhan.foo = () => { };
    app.model.dtDiemConfigThanhPhan.getFullDataConfig = async () => {
        let [items, loaiDiem] = await Promise.all([
            app.model.dtDiemConfigThanhPhan.getAll({}, '*', 'namHoc DESC, hocKy DESC'),
            app.model.dtDiemDmLoaiDiem.getAll({}),
        ]);
        items = items.map(item => {
            let diem = loaiDiem.find(i => i.ma == item.ma);
            return { ...item, loaiDiem: diem ? diem.ten : '' };
        });
        return items;
    };
};