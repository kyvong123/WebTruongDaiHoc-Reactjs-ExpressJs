module.exports = (app) => {
    // EMAIL ---------------------------------------------------------------------------------------
    app.email = {
        normalSendEmail: async (mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => {
            try {
                const item = await app.model.fwEmailTask.create({ mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state: 'waiting', createDate: new Date().getTime() });
                app.messageQueue.send('emailService:send', JSON.stringify({ id: item.id }));
                return null;
            } catch (error) {
                console.error(error);
                return error;
            }
        },

        validateEmail: email => {
            return (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase());
        },
    };

    // SMS ---------------------------------------------------------------------------------------
    app.sms = {
        // sendByViettel: async (user, phone, mess, idSms) => await app.service.smsService.send(user, phone, mess, idSms),
        sendByViettel: async (user, phoneNumber, content, idSms) => app.messageQueue.send('smsService:send', { user, phoneNumber, content, idSms }),
        // eslint-disable-next-line no-control-regex
        checkNonLatinChar: (string) => /[^\u0000-\u00ff]/.test(string)
    };

    // Notify ------------------------------------------------------------------------------------
    app.notification = {
        send: ({ toEmail = '', title = '', subTitle = '', icon = 'fa-commenting', iconColor = '#1488db', link = '', buttons = [], sendEmail = null }) => new Promise((resolve, reject) => {
            // Validate data
            if (!toEmail) return reject('The email to send notification is empty!');
            if (!app.email.validateEmail(toEmail)) return reject('The email to send notification is invalid!');
            if (!title) return reject('The title of notification is empty!');
            // Convert iconColor
            switch (iconColor) {
                case 'primary': {
                    iconColor = '#1488db';
                    break;
                }
                case 'secondary': {
                    iconColor = '#6c757d';
                    break;
                }
                case 'success': {
                    iconColor = '#28a745';
                    break;
                }
                case 'info': {
                    iconColor = '#17a2b8';
                    break;
                }
                case 'warning': {
                    iconColor = '#ffc107';
                    break;
                }
                case 'danger': {
                    iconColor = '#dc3545';
                    break;
                }
                case 'light': {
                    iconColor = '#f8f9fa';
                    break;
                }
                case 'dark': {
                    iconColor = '#343a40';
                    break;
                }
                default: break;
            }
            // Convert buttons
            if (!Array.isArray(buttons)) buttons = [buttons];
            try {
                buttons = JSON.stringify(buttons);
            } catch {
                buttons = '[]';
            }
            // Create notification item:
            const newNotification = { email: toEmail, title, subTitle, icon, iconColor, targetLink: link, buttonLink: buttons, sendTime: new Date().getTime() };
            app.model.fwNotification.create(newNotification, (error, item) => {
                if (error || !item) {
                    reject(error || 'System has error when creating new notification');
                } else {
                    if (sendEmail) {
                        sendEmail(() => resolve(item));
                    } else {
                        resolve(item);
                    }
                }
            });
        })
    };

};