// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svQtKyLuatDieuKien.foo = async () => { };
    app.model.svQtKyLuatDieuKien.getDsDieuKien = async (cauHinhId) => {
        let dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId }, '*', 'thuTu ASC');
        const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
        let hinhThucKyLuatMap = {};
        hinhThucKyLuat.forEach(ht => {
            hinhThucKyLuatMap[ht.id] = {
                ...ht
            };
        });
        return dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
    };
};