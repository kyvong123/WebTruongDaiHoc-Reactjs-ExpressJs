module.exports = (app, serviceConfig) => {
    app.fs.createFolder(app.bundlePath);
    !app.isDebug && app.get('/', (req, res) => res.send(`Hi, my name is ${serviceConfig.name.upFirstChar()}`));

    // Clusters -------------------------------------------------------------------------------------------------------------------------------------
    app.get(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        res.send({ clusters: app.worker.items });
    });

    app.post(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        app.worker.create();
        res.send({});
    });

    app.put(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        id && app.worker.reset(id);
        res.send({});
    });

    app.delete(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        id && app.worker.items.length > 1 && app.worker.shutdown(id);
        res.send({});
    });
};