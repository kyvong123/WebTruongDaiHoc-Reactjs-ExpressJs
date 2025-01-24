// eslint-disable-next-line no-unused-vars
module.exports = (app) => {

    // app.model.fwStudentQuyetDinhLog.foo = async () => { };

    app.model.fwStudentQuyetDinhLog.createLog = async ({ mssv, sinhVienObj, handleTime }) => {
        let _handleTime = handleTime ?? Date.now();
        let sv = sinhVienObj ?? (await app.model.fwStudent.get({ mssv }));
        await app.model.fwStudentQuyetDinhLog.delete({
            statement: 'mssv = :mssv and handleTime >= :handleTime',
            parameter: { mssv: sv.mssv, handleTime: _handleTime }
        });
        await app.model.fwStudentQuyetDinhLog.create({
            mssv: sv.mssv,
            handleTime: _handleTime,
            oldTinhTrang: sv.tinhTrang,
            oldMaNganh: sv.maNganh,
            oldLoaiHinhDaoTao: sv.loaiHinhDaoTao,
            oldLop: sv.lop,
        });
    };
};