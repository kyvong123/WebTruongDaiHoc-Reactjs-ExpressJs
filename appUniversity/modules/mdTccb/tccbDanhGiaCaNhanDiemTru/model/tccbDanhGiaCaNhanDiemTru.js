// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.tccbDanhGiaCaNhanDiemTru.createOrUpdate = async (condition, changes) => {
        let item = await app.model.tccbDanhGiaCaNhanDiemTru.get(condition);
        if (item) {
            if (changes)
                item = await app.model.tccbDanhGiaCaNhanDiemTru.update(condition, changes);
        } else {
            item = await app.model.tccbDanhGiaCaNhanDiemTru.create({ ...condition, ...(changes || {}) });
        }
        return item;
    };

    app.model.tccbDanhGiaCaNhanDiemTru.updateCaNhanDiemTru = async (shcc, nam, kyLuatNam) => {
        if (!kyLuatNam) kyLuatNam = await app.model.tccbDiemTru.getAll({ nam });
        const kyLuatNamMa = kyLuatNam.map(item => item.ma).filter(ma => !!ma);
        const batDau = new Date(nam, 0, 1, 0, 0, 0, 0).getTime();
        const ketThuc = new Date(nam, 11, 31, 23, 59, 59, 999).getTime();
        let listQtKyLuat = await app.model.qtKyLuat.getAll({
            statement: 'shcc = :shcc AND ngayRaQuyetDinh >= :batDau AND ngayRaQuyetDinh <= :ketThuc',
            parameter: { shcc, batDau, ketThuc }
        });

        listQtKyLuat = listQtKyLuat.filter(item => kyLuatNamMa.includes(item.lyDoHinhThuc));
        const listQtKyLuatId = listQtKyLuat.map(item => item.lyDoHinhThuc);
        const listCurrentKyLuat = await app.model.tccbDanhGiaCaNhanDiemTru.getAll({ shcc, nam });
        const currentKyLuatNotInList = listCurrentKyLuat.filter(item => !listQtKyLuatId.includes(item.maDiemTru));
        for (const qtKyLuat of listQtKyLuat) {
            await app.model.tccbDanhGiaCaNhanDiemTru.createOrUpdate({ shcc, nam, maDiemTru: qtKyLuat.lyDoHinhThuc });
        }
        if (currentKyLuatNotInList.length) {
            await app.model.tccbDanhGiaCaNhanDiemTru.delete({
                statement: 'id IN (:id)',
                parameter: { id: currentKyLuatNotInList.map(item => item.id) }
            });
        }
    };
};