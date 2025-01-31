// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtDiemVerifyCode.foo = async () => { };
    app.model.dtDiemVerifyCode.checkCode = async (code) => {
        const [verify, codeFile] = await Promise.all([
            app.model.dtDiemVerifyCode.get({ idCode: code, status: 1 }),
            app.model.dtDiemCodeFile.get({ id: code })
        ]), condition = {};
        if (codeFile) {
            condition.maHocPhan = codeFile.maHocPhan;
            condition.kyThi = codeFile.kyThi;
            if (codeFile.idExam) condition.idExam = codeFile.idExam;
        }
        const idFile = await app.model.dtDiemCodeFile.get(condition, '*', 'id DESC');

        let errorDetail = '';
        if (!codeFile) errorDetail = 'Mã bảng điểm không tồn tại trong hệ thống!';
        else if (idFile.id != code) errorDetail = 'Học phần đã được cập nhật mã xác thực mới!';
        else if (verify) errorDetail = 'Mã đã được xác thực!';

        return errorDetail;
    };
};