module.exports = (app, serviceConfig) => {
    app.service[serviceConfig.name] = {
        send: async (mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => {
            try {
                const item = await app.model.fwEmailTask.create({ mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state: 'waiting', createDate: new Date().getTime() });
                app.messageQueue.send(`${serviceConfig.name}:send`, { id: item.id });
                return null;
            } catch (error) {
                console.error(error);
                return error;
            }
        },
        updateTransporter: (email) => {
            try {
                app.messageQueue.send(`${serviceConfig.name}:updateTransporter`, { email });
                return null;
            } catch (error) {
                console.error(error);
                return error;
            }
        },
        sendENews: async (data) => {
            let item = await app.model.fwENews.get({ id: data.id });

            if (item.sending == 0) item = await app.model.fwENews.update({ id: data.id }, { sending: 1 });
            item.structures = await app.model.fwENewsStructure.getAll({ eNewsId: data.id }, '*', 'thuTu') || [];
            app.messageQueue.send(`${serviceConfig.name}:sendENews`, data);
            return item;
        }
    };

    app.readyHooks.add('comsumeEmailTask:done', {
        ready: () => app.messageQueue && app.messageQueue.consume,
        run: () => {
            app.messageQueue.consume('emailService:done', data => {
                app.io.to('emailTask').emit('emailTask:done', { state: data.state });
            });
        }
    });
};