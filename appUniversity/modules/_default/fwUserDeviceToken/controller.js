module.exports = app => {
    app.post('/api/device-token', app.permission.check('user:login'), async (req, res) => {
        try {
            let { deviceToken } = req.body;
            let user = req.session.user, item = {};
            const oldItem = await app.model.fwUserDeviceToken.get({ deviceToken, });
            if (oldItem) {
                item = await app.model.fwUserDeviceToken.update({ deviceToken }, {
                    createdTime: Date.now(),
                    email: user.email,
                });
            } else {
                item = await app.model.fwUserDeviceToken.create({
                    email: user.email,
                    deviceToken,
                    createdTime: Date.now()
                });
            }
            req.session.user.deviceToken = deviceToken;
            req.session.save();
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/device-token', app.permission.check('user:login'), async (req, res) => {
        try {
            const { deviceToken } = req.body,
                user = req.session.user;
            const item = await app.model.fwUserDeviceToken.update({ email: user.email, deviceToken }, {
                createdTime: Date.now()
            });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/device-token', app.permission.check('user:login'), async (req, res) => {
        try {
            const user = req.session.user;

            const item = await app.model.fwUserDeviceToken.get({ email: user.email });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/device-token', app.permission.check('user:login'), async (req, res) => {
        try {
            const user = req.session.user, { deviceToken } = req.body;
            await app.model.fwUserDeviceToken.delete({ email: user.email, deviceToken });
            req.session.user.deviceToken = null;
            req.session.save();
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/notification/test-only-firebase', async (req, res) => {
        const { title, body, token } = req.query;
        const result = await app.firebase.sendNotification({ title, body, token });
        res.send(result);
    });

    app.get('/api/notification/test-all', async (req, res) => {
        const { toEmail, title, subTitle } = req.query;
        const result = await app.notification.send({ firebaseNotify: true, toEmail, title, subTitle });
        res.send(result);
    });
};