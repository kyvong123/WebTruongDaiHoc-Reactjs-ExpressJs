// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svQtKyLuat.foo = () => { };
    app.model.svQtKyLuat.getDrlMapKyLuat = async (mssv, namHoc, hocKy) => {
        const dmHinhThuc = await app.model.svDmHinhThucKyLuat.getAll({}, 'id, ten, drlMax'),
            objHinhThuc = Object.assign({}, ...dmHinhThuc.map(hinhThuc => ({ [hinhThuc.id]: hinhThuc })));
        let dsKyLuat = await app.model.svDsKyLuat.getAll({ mssv }, '*');
        const kyLuatInfo = await app.model.svQtKyLuat.getAll({
            statement: 'id IN (:listKyLuat) AND namHoc = :namHoc AND hocKy = :hocKy',
            parameter: {
                listKyLuat: dsKyLuat.length ? dsKyLuat.map(item => item.qdId) : [-1],
                namHoc, hocKy
            }
        }, '*');
        if (kyLuatInfo) {
            dsKyLuat = dsKyLuat.filter(item => kyLuatInfo.some(kyLuat => kyLuat.id == item.qdId));
            dsKyLuat.forEach(item => {
                const hinhThuc = objHinhThuc[item.hinhThucKyLuat] || {};
                item.tenKyLuat = hinhThuc.ten || '';
                item.drlMax = hinhThuc.drlMax || '';
            });
            return dsKyLuat;
        } else return [];
    };
};