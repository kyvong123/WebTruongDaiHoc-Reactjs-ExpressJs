module.exports = (app) => {
    // EMAIL ---------------------------------------------------------------------------------------
    app.email = {
        normalSendEmail: async (mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => {
            try {
                const item = await app.model.fwEmailTask.create({ mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state: 'waiting', createDate: new Date().getTime() });
                console.log('MAIL FROM: ', mailFrom);
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


};