// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svDsMienGiam.foo = () => { };
    app.model.svDsMienGiam.getDsmg = async (id, namHoc, hocKy) => {
        const sem = await app.model.dtSemester.get({ namHoc, hocKy });
        let formData = await app.model.svManageMienGiam.getData(id);
        let items = formData.dssinhvien.filter(item => (item.timeStart <= sem.beginTime && sem.beginTime <= item.timeStart));
        return items;
    };

    app.model.svDsMienGiam.getAllDsmg = async (namHoc, hocKy) => {
        let sem = { endTime: Date.now() };
        if (namHoc && hocKy) {
            sem = await app.model.dtSemester.get({ namHoc, hocKy });
        }
        let { rows: items } = (await app.model.svDsMienGiam.getValid(sem.endTime));
        return { items };
    };
};