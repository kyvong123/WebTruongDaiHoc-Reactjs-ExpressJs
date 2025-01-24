// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svDsKyLuat.foo = async () => { };
    app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu = async (listMssv) => {
        const maHinhThucCanhCao = app.isDebug ? 61 : 41;
        const lichSuKyLuat = await app.model.svDsKyLuat.getAll({
            statement: 'mssv in (:listMssv) AND hinhThucKyLuat = :maHinhThucCanhCao',
            parameter: {
                listMssv: listMssv.length ? listMssv : ['-1'],
                maHinhThucCanhCao
            }
        }, '*');
        let qdKyLuat = await app.model.svQtKyLuat.getAll({
            statement: 'id in (:listQdId)',
            parameter: {
                listQdId: lichSuKyLuat.length ? lichSuKyLuat.map(item => item.qdId) : ['-1']
            }
        }, '*');
        qdKyLuat = qdKyLuat.mapArrayToObject('id');
        lichSuKyLuat.forEach(item => {
            item.namHoc = qdKyLuat[item.qdId.toString()].namHoc;
            item.hocKy = qdKyLuat[item.qdId.toString()].hocKy;
        });
        const groupByMssv = lichSuKyLuat.reduce((group, item) => {
            const { mssv } = item;
            group[mssv] = group[mssv] ?? [];
            group[mssv].push({ namHoc: item.namHoc, hocKy: item.hocKy });
            return group;
        }, {});
        return groupByMssv;
    };
};