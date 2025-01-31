
module.exports = app => {
    const admin = require('firebase-admin');
    const serviceAccount = require('./service_account_app.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    app.firebase = {
        sendToEmails: async function ({ listEmail, title, body }) {
            if (listEmail && listEmail.length && title && body) {
                const listToken = await app.model.fwUserDeviceToken.getAll({
                    statement: 'email IN (:list)',
                    parameter: { list: listEmail }
                }).then(items => [...new Set(items.map(item => item.deviceToken))]);
                await Promise.all(listToken.map(async (token) => {
                    await app.firebase.sendNotification({ title, body, token });
                }));
            }
        },

        sendNotification: async ({ title, body, token }) => {
            const message = {
                notification: { title, body },
                token
            };
            try {
                const response = await admin.messaging().send(message);
                console.log(`${app.date.viDateFormat(new Date())}: Send notification SUCCESSFULLY by firebase to device-token ${token}`);
                return ({ response });
            } catch (error) {
                console.error(`${app.date.viDateFormat(new Date())}: Send notification FAILED by firebase to device-token ${token}`, error);
                return ({ error });
            }
        }
    };
};