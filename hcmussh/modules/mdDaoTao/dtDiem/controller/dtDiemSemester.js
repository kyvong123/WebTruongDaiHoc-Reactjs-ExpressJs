module.exports = app => {


    app.get('/api/dt/diem-semester', app.permission.orCheck('staff:login', 'dtDiem:manage'), async (req, res) => {
        try {
            let data = await app.model.dtDiemSemester.getAll({}, '*', 'namHoc desc, hocKy desc');
            delete data.pass;
            let { accessGradeData } = req.session.user, now = Date.now();
            if (accessGradeData) {
                for (let key of Object.keys(accessGradeData)) {
                    let currentTime = accessGradeData[key];
                    if (currentTime <= now) delete accessGradeData[key];
                }
                req.session.user.accessGradeData = accessGradeData;
                req.session.save();
            }

            res.send({ data, accessGradeData: accessGradeData || {}, now: Date.now() });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-semester/get-active', app.permission.orCheck('staff:login', 'dtDiem:manage'), async (req, res) => {
        try {
            const semester = await app.model.dtSemester.get({ active: 1 });

            const diemSemester = await app.model.dtDiemSemester.get({ namHoc: semester.namHoc, hocKy: semester.hocKy }),
                { id, namHoc, hocKy } = diemSemester;

            res.send({ dataSem: { id, namHoc, hocKy } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-semester/check-valid-pass', app.permission.check('dtDiem:manage'), async (req, res) => {
        try {

            let { namHoc, hocKy, pass } = req.query.data;
            let [checkData, dataSessionDiem] = await Promise.all([
                app.model.dtDiemSemester.get({ namHoc, hocKy, active: 1 }),
                app.model.dtSettings.getValue('maxTimeSessionGrade')
            ]); // maxTimeSessionGrade by minutes
            let maxTimeSessionGrade = 10 * 60;
            if (dataSessionDiem && dataSessionDiem.maxTimeSessionGrade != null) maxTimeSessionGrade = dataSessionDiem.maxTimeSessionGrade;
            const isValid = Number(app.model.dtDiem.checkEqualPassword(pass, checkData.pass));
            if (isValid) {
                let user = req.session.user,
                    { accessGradeData } = user, now = Date.now();
                if (accessGradeData) {
                    for (let key of Object.keys(accessGradeData)) {
                        let currentTime = accessGradeData[key];
                        if (currentTime <= now) delete accessGradeData[key];
                    }
                }
                req.session.user = {
                    ...user,
                    accessGradeData: { ...user.accessGradeData, [checkData.id]: Date.now() + Number(maxTimeSessionGrade) * 1000 }
                };
                req.session.save();
            }
            res.send({ isValid: Number(app.model.dtDiem.checkEqualPassword(pass, checkData.pass)), startTime: Date.now() });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-semester/semester', app.permission.check('user:login'), async (req, res) => {
        try {
            let items = await app.model.dtDiemSemester.getAll({}, 'id, namHoc, hocKy', 'namHoc DESC, hocKy DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-semester/item/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dtDiemSemester.get({ id: req.params.id }, 'id, namHoc, hocKy', 'namHoc DESC, hocKy DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};