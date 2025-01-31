module.exports = app => {
    app.executeTask.importVerifyCode = async ({ items, email, idFolder }) => {
        const timeVerify = Date.now(), userVerify = email;

        for (let code of items) {
            let errorDetail = await app.model.dtDiemVerifyCode.checkCode(code);
            await app.model.dtDiemVerifyCode.create({ timeVerify, userVerify, idCode: code, errorDetail, status: 0, idFolder });
        }
        return {};
    };
};