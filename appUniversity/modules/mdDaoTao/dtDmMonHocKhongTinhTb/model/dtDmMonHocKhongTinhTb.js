// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDmMonHocKhongTinhTb.foo = () => { };

    app.model.dtDmMonHocKhongTinhTb.getNhom = async () => {
        let [listNhom, listMon] = await Promise.all([
            app.model.dtDmNhomMonHocKhongTinhTb.getAll(),
            app.model.dtDmMonHocKhongTinhTb.getMon(),
        ]);
        listMon = listMon.rows;
        listNhom.forEach(nhom => {
            nhom.submenus = listMon.filter(item => item.maNhom == nhom.ma);
        });
        return listNhom;
    };
};