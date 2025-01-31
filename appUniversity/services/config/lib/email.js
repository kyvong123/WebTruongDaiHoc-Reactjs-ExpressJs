const nodemailer = require('nodemailer');

module.exports = app => {
    app.email = {
        createTransporterByToken: (tokenInfo) => {
            const { user, clientId, clientSecret, refreshToken, accessToken } = tokenInfo;
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: { type: 'OAuth2', user, clientId, clientSecret, refreshToken, accessToken },
                debug: true
            });
            transporter.on('log', console.log);
            return transporter;
        },

        sendEmailByTransporter: (transporter, mailFrom, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => new Promise((resolve, reject) => {
            const mailOptions = {
                from: mailFrom,
                cc: mailCc.toString(),
                bcc: mailBcc.toString(),
                to: mailTo,
                subject: mailSubject,
                text: mailText,
                html: mailHtml,
                attachments: mailAttachments
            };
            transporter.sendMail(mailOptions, error => {
                if (error) {
                    console.error('Send mail error:', mailFrom);
                    console.error(error);
                    reject(error);
                } else {
                    console.log('Send mail to ' + mailTo + ' successful.');
                    resolve();
                }
            });
        }),

        sendEmailByToken: (tokenInfo, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => new Promise((resolve, reject) => {
            const { user, name, clientId, clientSecret, refreshToken, accessToken } = tokenInfo;
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: { type: 'OAuth2', user, clientId, clientSecret, refreshToken, accessToken },
                debug: true
            });
            transporter.on('log', console.log);

            const mailOptions = {
                from: name ? { name, address: user } : user,
                cc: mailCc.toString(),
                bcc: mailBcc.toString(),
                to: mailTo,
                subject: mailSubject,
                text: mailText,
                html: mailHtml,
                attachments: mailAttachments
            };
            transporter.sendMail(mailOptions, error => {
                if (error) {
                    console.error('Send mail error:', tokenInfo.user);
                    console.error(error);
                    transporter.close();
                    reject(error);
                } else {
                    console.log('Send mail to ' + mailTo + ' successful.');
                    transporter.close();
                    resolve();
                }
            });
        }),

        validateEmail: email => {
            return (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase());
        },
    };
};