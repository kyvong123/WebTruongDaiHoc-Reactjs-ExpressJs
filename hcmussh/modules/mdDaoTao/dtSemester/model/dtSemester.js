// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtSemester.foo = () => { };

    app.model.dtSemester.getCurrent = async () => {
        const currentSem = await app.model.dtSemester.get({ active: 1 });
        return currentSem;
    };
};