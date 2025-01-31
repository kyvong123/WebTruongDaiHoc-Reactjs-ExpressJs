module.exports = (app, serviceConfig) => {
    app.service[serviceConfig.name] = {
        setupTailWatch: async (path, done) => {
            const url = app.service.url('/api/log/setup-tail-watch', serviceConfig);
            const response = await app.service.get(url, { path });
            done && done(response);
        },
        getListLog: async (done) => {
            const url = app.service.url('/api/log/get-list', serviceConfig);
            const response = await app.service.get(url);
            done && done(response);
        },
        getLog: async (path, nLines, from, done) => {
            const url = app.service.url('/api/log/get-log', serviceConfig);
            const response = await app.service.get(url, { path, nLines, from });
            done && done(response);
        },
        getFreshLog: async (done) => {
            const url = app.service.url('/api/log/fresh-log', serviceConfig);
            const response = await app.service.get(url);
            done && done(response);
        },
        downloadLog: async (path, done) => {
            const url = app.service.url('/api/log/download', serviceConfig);
            const response = await app.service.get(url, { path });
            done && done(response);
        },
    };
};