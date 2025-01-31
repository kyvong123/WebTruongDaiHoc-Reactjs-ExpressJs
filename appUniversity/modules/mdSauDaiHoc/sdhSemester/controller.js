module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7518: {
                title: 'Cấu hình năm học', groupIndex: 2,
                link: '/user/sau-dai-hoc/cau-hinh-nam-hoc'
            }
        }
    };

    app.permission.add(
        { name: 'sdhSemester:read', menu }, 'sdhSemester:write', 'sdhSemester:delete'
    );

    app.get('/user/sau-dai-hoc/cau-hinh-nam-hoc', app.permission.orCheck('sdhSemester:write', 'sdhSemester:read'), app.templates.admin);
    //------API--------------s
    app.get('/api/sdh/semester', app.permission.check('sdhSemester:read'), async (req, res) => {
        try {
            let items = await app.model.sdhSemester.getAll({}, '*', 'namHoc DESC, hocKy DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/school-year', app.permission.check('user:login'), async (req, res) => {
        try {
            let items = await app.model.sdhSemester.getAll({}, 'namHoc', 'namHoc ASC');
            items = Object.keys(items.groupBy('namHoc'));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/school-year/:khoaSv', app.permission.check('user:login'), async (req, res) => {
        try {
            const khoaSv = parseInt(req.params.khoaSv);
            let allYear = await app.model.sdhSemester.getAll({}, 'namHoc', 'namHoc ASC');
            allYear = Object.keys(allYear.groupBy('namHoc'));
            let item = allYear.filter(year => {
                return parseInt(year.substring(0, 4)) >= khoaSv ? year : null;
            });
            let listHocKy = [];
            for (const year of item) {
                let hocKy = await app.model.sdhSemester.getAll({ namHoc: year }, 'ma,hocKy,beginTime,endTime,namHoc', 'ma,hocKy ASC');
                listHocKy.push(...hocKy);
            }
            res.send({ items: listHocKy });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/school-year/item/:namHoc', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.sdhSemester.get({ namHoc: req.params.namHoc }, 'namHoc', 'namHoc DESC');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/semester/item/:ma', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.sdhSemester.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/semester/from/:maHocKy', app.permission.check('sdhSemester:read'), async (req, res) => {
        try {
            let maHocKy = req.params.maHocKy;
            let items = await app.model.sdhSemester.getAll({
                statement: 'TO_NUMBER(MA) >= :hocKy ',
                parameter: {
                    hocKy: maHocKy
                }
            }, '*', 'ma');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/semester', app.permission.check('sdhSemester:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            changes.userModified = req.session.user.email;
            changes.timeModified = Date.now();
            if (changes.active == 1) {
                await app.model.sdhSemester.update({
                    active: 1
                }, { active: 0 });
            } else if (changes.active == 0) {
                const item = await app.model.sdhSemester.get({ ma });
                if (item.active) return res.send({ error: 'Năm học - học kỳ hiện tại đang được kích hoạt!' });
            }
            const item = await app.model.sdhSemester.update({ ma: ma }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/semester', app.permission.check('sdhSemester:write'), async (req, res) => {
        try {
            const data = req.body.data;
            data.userModified = req.session.user.email;
            data.timeModified = Date.now();
            const cur = await app.model.sdhSemester.get({ namHoc: data.namHoc, hocKy: data.hocKy });
            if (cur) return res.send({ error: 'Năm học - học kỳ đã tồn tại' });
            const item = await app.model.sdhSemester.create({ ...data });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/semester/current', app.permission.check('sdhSemester:read'), async (req, res) => {
        try {
            const item = await app.model.sdhSemester.get({ active: 1 }, '*', '');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
