module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);
    require('./eNewsEmail')(app);

    if (!app.isDebug) app.assetPath = '/var/www/hcmussh/asset';

    const nodemailer = require('nodemailer'),
        transporters = {},
        delay = ms => new Promise(res => setTimeout(res, ms));
    const sendMail = async (mailFrom, mailFromPassword, mailTo, cc = null, bcc = null, subject, text, html, attachments = null) => {
        try {
            let transporter = await getTransporter(mailFrom, mailFromPassword);
            const developerMail = await app.model.fwSetting.get({ key: 'developerMail' });
            const message = { from: mailFrom, to: developerMail?.value || mailTo, subject, text, html, attachments };
            if (cc) message.cc = cc.toString();
            if (bcc) message.bcc = bcc.toString();

            await transporter.sendMail(message).catch(async error => {
                console.error(`Send mail to ${mailTo} error! retrying with new transporter`, error);
                let transporter = await createTransporter(mailFrom, mailFromPassword);
                await transporter.sendMail(message);
            });
            await delay(5000);
            console.log(`Sucessfully send mail to ${mailTo} from ${mailFrom}!`);
            return null;
        } catch (error) {
            console.error(`Send mail to ${mailTo} error!`, error);
            return error;
        }
    };

    const createTransporter = async (mailFrom, mailFromPassword) => {
        let transporter;
        try {
            transporter = transporters[mailFrom];
            if (!transporter) {
                let tokensItem = await app.model.tcEmailConfig.get({ email: mailFrom });
                if (!tokensItem || !tokensItem.emailToken) throw ('no config');
                const tokens = app.utils.parse(tokensItem.emailToken);
                transporter = app.email.createTransporterByToken({
                    user: mailFrom,
                    clientId: '108504856514-vkekmde3m4lovpns4q2bj4jfbtkn89br.apps.googleusercontent.com',
                    clientSecret: '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',
                    refreshToken: tokens.refresh_token,
                    accessToken: tokens.access_token,
                });
            }
        } catch (error) {
            console.error(error);
            if (!mailFromPassword) {
                throw 'no password provided';
            }
            transporter = nodemailer.createTransport({
                pool: true,
                host: 'smtp.gmail.com',
                port: 465,
                auth: { user: mailFrom, pass: mailFromPassword },
                debug: true
            });
        }
        transporter.on('log', console.log);
        console.log('replace mail transporter', mailFrom);
        transporters[mailFrom] = transporter;
        return transporter;
    };

    const getTransporter = async (mailFrom, mailFromPassword) => {
        let transporter;
        try {
            transporter = transporters[mailFrom];
            if (!transporter) {
                transporter = await createTransporter(mailFrom, mailFromPassword);
            }
        } catch (error) {
            if (!mailFromPassword) {
                throw 'no password provided';
            }
            transporter = nodemailer.createTransport({
                pool: true,
                host: 'smtp.gmail.com',
                port: 465,
                auth: { user: mailFrom, pass: mailFromPassword },
                debug: true
            });
        }
        return transporter;
    };

    app.readyHooks.add('consumeEmailTask', {
        ready: () => app.model && app.model.fwSetting && app.model.fwEmailTask,
        run: () => {

            app.messageQueue.consume(`${serviceConfig.name}:updateTransporter`, async (message) => {
                try {
                    const data = JSON.parse(message);
                    const { email } = data;
                    await createTransporter(email);
                } catch (error) {
                    console.error(error);
                }
            });

            app.messageQueue.consume(`${serviceConfig.name}:send`, async (message) => {
                try {
                    const id = JSON.parse(message).id;
                    const item = await app.model.fwEmailTask.get({ id });
                    if (item) {
                        const { mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state } = item;
                        if (state == 'waiting') {
                            let res;
                            if (mailFrom && mailFromPassword) {
                                const error = await sendMail(mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments);
                                error && console.error(serviceConfig.name, error);
                                res = await app.model.fwEmailTask.update({ id }, { state: error ? 'error' : 'success' });
                            } else {
                                res = await app.model.fwEmailTask.update({ id }, { state: 'error' });
                            }
                            app.messageQueue.send(`${serviceConfig.name}:done`, { id: res.id, state: res.state });
                        }
                    }
                } catch (error) {
                    console.error(`Error: ${serviceConfig.name}:send:`, error);
                    // app.messageQueue.send(`${serviceConfig.name}:sendResult`, { error });
                }
            });

            app.messageQueue.consume(`${serviceConfig.name}:sendENews`, async (message) => {
                try {
                    await app.sendENewsEmail(JSON.parse(message));
                } catch (error) {
                    console.error(`Error: ${serviceConfig.name}:sendENews:`, error);
                }
            });
        },
    });

    app.isDebug && process.on('SIGINT', function () {
        console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
        // some other closing procedures go here
        // nodemon.emit('quit');
        process.exit(0);
    });
};