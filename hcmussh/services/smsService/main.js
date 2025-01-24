module.exports = (app, serviceConfig) => {
    // Các chức năng của service
    app.service[serviceConfig.name] = {
        send: (user, phoneNumber, content, idSms) => app.messageQueue.send(`${serviceConfig.name}:send`, { user, phoneNumber, content, idSms }),
    };
};