module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1012: {
                title: 'Khai báo dữ liệu VNU-HCM',
                link: '/user/data-vnu/khai-bao',
                icon: 'fa fa-pencil',
            }
        }
    };

    app.permission.add(
        { name: 'cbDataVnu:read', menu },
        { name: 'cbDataVnu:write' },
    );

    app.get('/user/data-vnu/khai-bao', app.permission.orCheck('cbDataVnu:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/data-vnu/khai-bao', app.permission.check('cbDataVnu:write'), async (req, res) => {
        try {
            let userEmail = req.session.user?.email;
            if (!userEmail) throw 'Dữ liệu lỗi, vui lòng thử lại!';

            let data = await app.model.tccbDataVnu.get({ emailLogIn: userEmail });

            for (let key in data) {
                data[key] = app.utils.parse(data[key], data[key]);
            }
            res.send({ data });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/data-vnu/khai-bao', app.permission.check('cbDataVnu:write'), async (req, res) => {
        try {
            let data = req.body.data,
                userEmail = req.session.user?.email;
            if (!data || !userEmail) throw 'Dữ liệu lỗi, vui lòng thử lại!';

            for (let key in data) {
                if (typeof (data[key]) == 'object') data[key] = app.utils.stringify(data[key]);
            }

            let checkExistForm = await app.model.tccbDataVnu.get({ emailLogIn: userEmail });
            if (!checkExistForm) {
                await app.model.tccbDataVnu.create({ ...data, emailLogIn: userEmail, timeModified: Date.now(), xacNhan: 1 });
            }
            else {
                await app.model.tccbDataVnu.update({ emailLogIn: userEmail }, { ...data, timeModified: Date.now(), xacNhan: 1 });
            }
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};