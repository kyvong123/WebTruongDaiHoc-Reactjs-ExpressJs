// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.tcEmailConfig.foo = async () => { };
    app.model.tcEmailConfig.getMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailList', 'taiChinhEmailPassword');
        if (mailConfig.taiChinhEmailList) {
            return mailConfig.taiChinhEmailList.split(',').map(item => ({ email: item, password: mailConfig.taiChinhEmailPassword }));
        } else
            return [];
    };
};