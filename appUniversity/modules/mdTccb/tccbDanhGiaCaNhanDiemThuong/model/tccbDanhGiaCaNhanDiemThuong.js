// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.tccbDanhGiaCaNhanDiemThuong.createOrUpdate = async (condition, changes) => {
        let item = await app.model.tccbDanhGiaCaNhanDiemThuong.get(condition);
        if (item) {
            item = await app.model.tccbDanhGiaCaNhanDiemThuong.update(condition, changes);
        } else {
            item = await app.model.tccbDanhGiaCaNhanDiemThuong.create({ ...condition, ...changes });
        }
        return item;
    };

    app.model.tccbDanhGiaCaNhanDiemThuong.updateCaNhanDiemThuong = async (shcc, nam, khenThuongNam) => {
        if (!khenThuongNam) khenThuongNam = await app.model.tccbDiemThuong.getAll({ nam });
        const khenThuongNamMa = khenThuongNam.map(item => item.ma).filter(ma => !!ma);
        let listQtKhenThuong = await app.model.qtKhenThuongAll.getAll({ loaiDoiTuong: '02', ma: shcc, namDatDuoc: nam });
        listQtKhenThuong = listQtKhenThuong.filter(item => khenThuongNamMa.includes(item.thanhTich));
        const listQtKhenThuongId = listQtKhenThuong.map(item => item.thanhTich);
        const listCurrentKhenThuong = await app.model.tccbDanhGiaCaNhanDiemThuong.getAll({ shcc, nam, tuDangKy: 0 });
        const currentKhenThuongNotInList = listCurrentKhenThuong.filter(item => !listQtKhenThuongId.includes(item.maDiemThuong));
        for (const qtKhenThuong of listQtKhenThuong) {
            await app.model.tccbDanhGiaCaNhanDiemThuong.createOrUpdate({ shcc, nam, maDiemThuong: qtKhenThuong.thanhTich }, { tuDangKy: 0, duyet: 1 });
        }
        if (currentKhenThuongNotInList.length) {
            await app.model.tccbDanhGiaCaNhanDiemThuong.delete({
                statement: 'id IN (:id)',
                parameter: { id: currentKhenThuongNotInList.map(item => item.id) }
            });
        }
    };
};