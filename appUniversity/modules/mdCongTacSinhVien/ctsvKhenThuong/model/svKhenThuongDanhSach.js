// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svKhenThuongDanhSach.foo = async () => { };
    app.model.svKhenThuongDanhSach.updateDanhSach = async (id, danhSach) => {
        await app.model.svKhenThuongDanhSach.delete({ idKhenThuong: id });
        let items;
        if (danhSach && danhSach.length) {
            items = await Promise.all(danhSach.map(({ mssv, maLop, maThanhTich, namHoc }) => app.model.svKhenThuongDanhSach.create({ mssv, maLop, maThanhTich, namHoc, idKhenThuong: id })));
        }
        return items;
    };
};