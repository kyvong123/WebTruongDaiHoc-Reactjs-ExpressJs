module.exports = app => {
    const menu = {
        parentMenu: { index: 2500, title: 'Khóa học ngắn hạn', icon: 'fa-briefcase', link: '/user/courses' }
    };

    app.permission.add(
        { name: 'fwCourse:manage', menu },
        'fwCourse:admin',
    );

    app.get('/user/courses', app.permission.check('fwCourse:manage'), app.templates.admin);
    app.get('/user/courses/item/:id', app.permission.check('fwCourse:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tt/courses/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
            const page = await app.model.fwCourses.getPage(pageNumber, pageSize, { kichHoat: 1 }, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/courses/all', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { maDonVi } = req.session.user;
            const items = await app.model.fwCourses.getAll({ maDonVi }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/courses/item/:id', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { id } = req.params;
            const [course, classItems] = await Promise.all([
                app.model.fwCourses.get({ id }),
                app.model.fwCoursesClass.getAll({ idCourses: id }),
            ]);

            res.send({ course, classItems });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/courses', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            if (req.session.fwCoursesImage) {
                const srcPath = req.session.fwCoursesImage,
                    imageLink = '/img/fwCourses/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath),
                    destPath = app.path.join(app.publicPath, imageLink);
                await app.fs.copyFile(srcPath, destPath, async () => {
                    app.fs.deleteFile(srcPath);
                    data.image = imageLink;
                    await app.model.fwCourses.create(data);
                });
            } else {
                await app.model.fwCourses.create(data);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/courses', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.fwCourses.update({ id }, changes);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/courses/class', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { changes, idCourses } = req.body;
            await app.model.fwCoursesClass.create({ idCourses, ...changes, userModified: req.session.user.email, timeModified: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/courses/class', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { changes, id } = req.body;
            await app.model.fwCoursesClass.update({ id }, { ...changes, userModified: req.session.user.email, timeModified: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/courses/don-vi', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const [donVi, loaiDonVi] = await Promise.all([
                app.model.dmDonVi.getAll({
                    statement: 'kichHoat = 1 AND maPl IS NOT NULL',
                    parameter: {}
                }),
                app.model.dmLoaiDonVi.getAll({ kichHoat: 1 }),
            ]);

            const items = loaiDonVi.map(i => ({ ...i, listDonVi: donVi.filter(dv => dv.maPl == i.ma) }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/courses/class-don-vi/:maDonVi', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { maDonVi } = req.params;

            let [items, dmCoSo] = await Promise.all([
                app.model.fwCourses.getAll({ donVi: maDonVi, kichHoat: 1 }),
                app.model.dmCoSo.getAll({}),
            ]);
            items = await Promise.all(items.map(async item => {
                const courseClasses = await app.model.fwCoursesClass.getAll({ kichHoat: 1, idCourses: item.id });
                return {
                    ...item, tieuDe: JSON.parse(item.tieuDe).vi,
                    courseClasses: courseClasses.map(i => ({
                        ...i, coSo: JSON.parse(dmCoSo.find(cs => i.coSo == cs.ma)?.ten || { 'vi': '' }).vi.replace('Cơ sở', ''),
                        thoiGianBatDau: app.date.viDateFormat(new Date(i.thoiGianBatDau)),
                        thoiGianKetThuc: app.date.viDateFormat(new Date(i.thoiGianKetThuc)),
                        caHoc: JSON.parse(i.caHoc),
                    }))
                };
            }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/course/all', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            let items = await app.model.fwCourses.getAll({ kichHoat: 1 }, '*', 'id DESC');
            items = items.map(item => ({ ...item, tieuDe: JSON.parse(item.tieuDe).vi, ghiChu: JSON.parse(item.ghiChu || { 'vi': '' }).vi, }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/course/class/:id', app.permission.check('fwCourse:manage'), async (req, res) => {
        try {
            const { id } = req.params;

            let [items, dmCoSo] = await Promise.all([
                app.model.fwCoursesClass.getAll({ idCourses: id, kichHoat: 1 }, '*', 'id DESC'),
                app.model.dmCoSo.getAll({}),
            ]);

            items = items.map(i => ({
                ...i, coSo: JSON.parse(dmCoSo.find(cs => i.coSo == cs.ma)?.ten || { 'vi': '' }).vi.replace('Cơ sở', ''),
                thoiGianBatDau: app.date.viDateFormat(new Date(i.thoiGianBatDau)),
                thoiGianKetThuc: app.date.viDateFormat(new Date(i.thoiGianKetThuc)),
                caHoc: JSON.parse(i.caHoc),
            }));

            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/fwCourses'));

    const uploadFwCoursesImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('fwCourses:') && files.FwCoursesImage && files.FwCoursesImage.length > 0) {
            console.log('Hook: uploadFwCoursesImage => news image upload');
            app.uploadComponentImage(req, 'fwCourses', app.model.fwCourses, fields.userData[0].substring(10), files.FwCoursesImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadFwCoursesImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFwCoursesImage(req, fields, files, params, done), done, 'fwCourse:manage'));

};