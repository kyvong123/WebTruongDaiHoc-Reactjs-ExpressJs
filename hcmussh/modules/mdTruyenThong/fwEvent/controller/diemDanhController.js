module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.truyenThong,
    //     menus: {
    //         5104: { title: 'Điểm danh', link: '/user/event/attendance', groupIndex: 3, icon: 'fa-pencil-square-o', backgroundColor: '#00b8d4' },
    //     }
    // };

    app.permission.add(
        'event:attendance',
        // { name: 'event:attendance', menu }
    );

    app.get('/user/event/attendance', app.permission.check('event:attendance'), app.templates.admin);

    app.get('/api/tt/event/attendance/page/:pageNumber/:pageSize', app.permission.check('event:attendance'), async (req, res) => {
        try {
            const { eventId, searchTerm = '' } = req.query,
                { pageNumber, pageSize } = req.params,
                page = await app.model.fwEventAttendance.searchPage(eventId, parseInt(pageNumber), parseInt(pageSize), searchTerm)
                    .then(value => ({ pageNumber: value.pagenumber, pageSize: value.pagesize, pageCondition: value.searchterm, pageTotal: value.pagetotal, list: value.rows }));
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/event/attendance/check-student', app.permission.check('event:attendance'), async (req, res) => {
        try {
            const item = await app.model.fwStudent.getData(req.query.mssv).then(value => value.rows[0]);
            if (item) {
                const { mssv, ho, ten } = item;
                res.send({ item: { mssv, ho, ten } });
            } else {
                res.end();
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/event/attendance/confirm', app.permission.check('event:attendance'), async (req, res) => {
        try {
            const { eventId, mssv } = req.body;
            const handleStaff = req.session.user.email,
                handleTime = Date.now();
            let item = await app.model.fwEventAttendance.get({ eventId, mssv });
            if (!item) {
                const [mailSinhVien, eventName] = await Promise.all([
                    app.model.fwStudent.get({ mssv }).then(value => value.emailTruong),
                    app.model.fwEvent.get({ id: eventId }).then(value => app.utils.parse(value.title, {})['vi']),
                ]);
                item = await app.model.fwEventAttendance.create({ eventId, mssv, handleTime, handleStaff });
                await app.notification.send({
                    toEmail: mailSinhVien,
                    title: 'Điểm danh thành công',
                    subTitle: `Bạn đã điểm danh sự kiện "${eventName}"`,
                    icon: 'fa-check',
                    iconColor: 'success',
                    firebaseNotify: true
                });
                res.send(item);
            } else {
                throw 'Sinh viên đã điểm danh cho sự kiện';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};