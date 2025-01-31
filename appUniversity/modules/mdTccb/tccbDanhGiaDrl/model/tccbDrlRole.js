// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.tccbDrlRole.foo = async () => { };
    app.model.tccbDrlRole.getStaffs = async (khoaSv, heSv) => {
        const items = await app.model.tccbDrlRole.getAll({
            statement: 'khoaSv like \'%\' || :khoaSv || \'%\' and heSv like \'%\' || :heSv || \'%\'',
            parameter: { khoaSv, heSv }
        });
        return items.map(item => item.emailCanBo);
    };
};