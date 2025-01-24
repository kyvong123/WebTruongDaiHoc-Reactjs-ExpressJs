// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.fwStudentGhiChu.foo = async () => { };
    app.model.fwStudentGhiChu.updateGhiChu = async (mssv, data, staffModified = '') => {
        const timeModified = Date.now();
        await app.model.fwStudentGhiChu.delete({ mssv });
        if (data == 0) data = [];
        await Promise.all(
            data?.map(ghiChu => (delete ghiChu.id, app.model.fwStudentGhiChu.create({ mssv, staffModified, timeModified, ...ghiChu })))
        );
    };
};