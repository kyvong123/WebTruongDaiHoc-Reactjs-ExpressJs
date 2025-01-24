// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtDiemCodeFile.foo = async () => { };
    app.model.dtDiemCodeFile.genCode = async (item, email) => {
        let id = await app.model.dtDiemCodeFile.get({ namHoc: item.namHoc, hocKy: item.hocKy }, 'id', 'id DESC');
        if (!id) id = `${item.namHoc.split(' - ')[0].substring(2, 4)}${item.hocKy}00000`;
        else id = Number(id.id) + 1;

        return await app.model.dtDiemCodeFile.create({ ...item, kyThi: item.thanhPhan, userPrint: email, printTime: Date.now(), id });
    };

    app.model.dtDiemCodeFile.getCode = async (item, email) => {
        let { namHoc, hocKy, maHocPhan, kyThi, idExam } = item,
            [currCode, maxCode] = await Promise.all([
                app.model.dtDiemCodeFile.get({ maHocPhan, kyThi, idExam }, '*', 'id DESC'),
                app.model.dtDiemCodeFile.get({ namHoc, hocKy }, 'id', 'id DESC'),
            ]);

        if (!currCode) {
            let id = '';
            if (!maxCode) id = `${item.namHoc.split(' - ')[0].substring(2, 4)}${item.hocKy}00000`;
            else id = Number(maxCode.id) + 1;
            return await app.model.dtDiemCodeFile.create({ ...item, kyThi, userPrint: email, printTime: Date.now(), id }).then(i => i.id);
        } else {
            return currCode.id;
        }
    };
};