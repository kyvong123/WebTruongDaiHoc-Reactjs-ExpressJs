// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svDotDanhGiaDrl.foo = () => { };
    app.model.svDotDanhGiaDrl.getInitData = async (mssv, namHoc, hocKy) => {
        let svInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, namHoc, hocKy }, '*');
        let [svDot, svData] = await Promise.all([
            app.model.svDotDanhGiaDrl.get({ id: svInfo?.idDot }, '*', 'ID DESC'),
            app.model.fwStudent.get({ mssv }),
        ]);
        if (svInfo) {
            svInfo.hoTen = `${svData.ho} ${svData.ten}`;
            svInfo.lop = svData.lop;
        }
        return { svDot, svInfo };
    };

    app.model.svDotDanhGiaDrl.patchPhucKhaoInfo = async (svDot, maKhoa) => {
        // let pkInfo = await app.model.svDrlThoiGianPhucKhao.get({ idDot: svDot.id, maKhoa }, 'timePkStart', 'ID DESC');
        let pkInfo = await app.model.svDrlThoiGianPhucKhao.get({
            statement: 'idDot = :idDot AND maKhoa in (:maKhoa)',
            parameter: { idDot: svDot.id, maKhoa: maKhoa.split(',') }
        }, 'timePkStart', 'timePkStart');
        if (!pkInfo) pkInfo = await app.model.svDrlThoiGianPhucKhao.get({ idDot: svDot.id, maKhoa: null }, 'timePkStart', 'timePkStart');
        //Lấy thời hạn kết thúc đánh giá, dựa trên thời gian gia hạn khoa và thời gian cho phép đánh của kiến nghị
        svDot.timePkStart = pkInfo ? pkInfo.timePkStart : null;
        return { svDot };
    };

    app.model.svDotDanhGiaDrl.patchGiaHanInfo = async (svDot, mssv) => {
        const { rows: [giaHanInfo] } = await app.model.svDrlDssvGiaHan.getGiaHanInfo(mssv, svDot.id);
        svDot.timeGiaHanEnd = giaHanInfo ? giaHanInfo.timeEnd : null;
        return { svDot };
    };

    app.model.svDotDanhGiaDrl.patchTongKetInfo = async (svDot, mssv, namHoc, hocKy) => {
        const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
        tongKetInfo.kyLuat = await app.model.svQtKyLuat.getDrlMapKyLuat(mssv, namHoc, hocKy);
        if (tongKetInfo.tkSubmit) { //Đã tổng kết
            tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.tkSubmit);
        }

        return { svDot };
    };

    // app.model.svDotDanhGiaDrl. = async () => {

    // };
};