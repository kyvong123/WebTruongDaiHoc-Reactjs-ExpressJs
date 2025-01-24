module.exports = (app, serviceConfig) => {
    app.service[serviceConfig.name] = {
        send: ({ data, user }) => app.messageQueue.send(`${serviceConfig.name}:send`, { data, user }),
    };
};