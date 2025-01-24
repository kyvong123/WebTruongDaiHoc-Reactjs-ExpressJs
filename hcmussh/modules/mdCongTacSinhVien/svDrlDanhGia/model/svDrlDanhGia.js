// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svDrlDanhGia.foo = () => { };
    app.model.svDrlDanhGia.initDiemTable = async (svDot, mssv, namHoc, hocKy) => {
        let dsTieuChi = await app.model.svBoTieuChi.getAll({ kichHoat: 1, idBo: svDot ? svDot.maBoTc : null }, '*', 'MA ASC');
        let { rows: listSuKien } = await app.model.svSuKien.getDrl(mssv, svDot ? svDot.maBoTc : null, namHoc, hocKy);

        const { rows: lsDiemDanhGia } = await app.model.svDrlDanhGia.getDrl(mssv, svDot ? svDot.maBoTc : null, namHoc, hocKy);

        const { rows: bhytData } = await app.model.svBaoHiemYTe.getData(mssv);

        const lsMinhChung = await app.model.svDrlMinhChung.getAll({ mssv, namHoc, hocKy }, '*', 'ID ASC');

        let objDiemDanhGia = Object.assign({}, ...lsDiemDanhGia.map(tieuChi => ({ [tieuChi.maTieuChi]: tieuChi })));
        let listCha = dsTieuChi.filter(item => !item.maCha);
        const initDsTieuChiCon = (tieuChiCha) => {
            tieuChiCha.lyDoLt = objDiemDanhGia[tieuChiCha.ma]?.lyDoLt;
            tieuChiCha.lyDoF = objDiemDanhGia[tieuChiCha.ma]?.lyDoF;
            const listCon = dsTieuChi.filter(item => item.maCha == tieuChiCha.ma);
            for (let tieuChiCon of listCon) {
                tieuChiCon.dsTieuChiCon = initDsTieuChiCon(tieuChiCon);
            }
            return listCon;
        };
        dsTieuChi = listCha.map(itemCha => (itemCha.dsTieuChiCon = initDsTieuChiCon(itemCha, itemCha), itemCha));
        return { dsTieuChi, lsDiemDanhGia, listSuKien, lsMinhChung, bhytData: bhytData[0] };
    };

    app.model.svDrlDanhGia.resetDiem = async (mssv, idDot) => { //Khoi tao lai diem danh gia (LT va F)
        let now = Date.now();
        if (mssv && !Array.isArray(mssv)) {
            mssv = [mssv];
        }
        const dotInfo = await app.model.svDotDanhGiaDrl.get({ id: idDot });
        if (!dotInfo) throw `Không tìm thấy đợt !${idDot}`;
        if (mssv && mssv.length) {
            const { namHoc, hocKy } = dotInfo;
            const condition = {
                statement: 'namHoc = :namHoc and hocKy = :hocKy and mssv in (:mssv)',
                parameter: { mssv, namHoc, hocKy }
            };
            await Promise.all([
                // Reset cac diem danh gia (ngoai tru diem TB)
                app.model.svDiemRenLuyen.update(condition, { svSubmit: null, ltSubmit: null, fSubmit: null, tkSubmit: null, lyDoF: null, lyDoTk: null }),
                app.model.svDrlDanhGia.update(condition, { diemLt: null, diemF: null, lyDoLt: null, lyDoF: null, modifiedTime: now }),
            ]);
        }
    };
};