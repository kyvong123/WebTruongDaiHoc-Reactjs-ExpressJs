// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmNgayLe.foo = () => { };

    app.model.dmNgayLe.getAllNgayLeTrongNam = async (nam = new Date().getFullYear()) => {
        const listNgayLe = await app.model.dmNgayLe.getAll({
            statement: 'ngay >= :startDateOfYear AND kichHoat = 1',
            parameter: {
                startDateOfYear: new Date(nam, 0, 1).setHours(0, 0, 0, 1)
            }
        });
        return listNgayLe;
    };
};
