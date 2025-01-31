// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.svShcdDiemDanh.updateDanhSach = async (id, danhSach, nguoiScan) => {
        let items = [];
        if (danhSach && danhSach.length) {
            let { mssv } = danhSach[0];
            const { maNganh } = await app.model.fwStudent.get({ mssv }, 'maNganh');
            const { listevent: listEvent } = await app.model.svSinhHoatCongDan.getData(null, maNganh, null);
            await Promise.all(danhSach.map(async ({ mssv, thoiGianVao, thoiGianRa, danhGia }) => {
                if (listEvent.map(item => item.id).includes(parseInt(id))) {
                    await app.model.svShcdDiemDanh.delete({ mssv, id });
                    if (thoiGianVao || thoiGianRa || danhGia) {
                        let item = await app.model.svShcdDiemDanh.create({ id, mssv, thoiGianVao, nguoiScanVao: thoiGianVao ? nguoiScan : null, thoiGianRa, nguoiScanRa: thoiGianRa ? nguoiScan : null, danhGia });
                        items.push(item);
                    }
                }
            }));
        }
        return items;
    };
};