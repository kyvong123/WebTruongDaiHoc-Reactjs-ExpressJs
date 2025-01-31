module.exports = (app, appConfig) => {
    app.fs.createFolder(app.bundlePath);

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            1006: { title: 'Cluster', link: '/user/cluster', icon: 'fa-braille', backgroundColor: '#4db6ac' }
        }
    };
    app.permission.add({ name: 'cluster:manage', menu }, { name: 'cluster:write' }, { name: 'cluster:delete' });

    app.get('/user/cluster', app.permission.check('cluster:manage'), app.templates.admin);

    // Cluster APIs ---------------------------------------------------------------------------------------------------------------------------------
    // const socketIoEmit = (error) => !error && setTimeout(() => app.io.to('cluster').emit('services-changed'), 1000);

    // Current node API
    app.get('/api/cluster/current', app.permission.isLocalIp, (req, res) => {
        res.send({ clusters: app.worker.items });
    });

    app.post('/api/cluster/current', app.permission.isLocalIp, (req, res) => {
        app.worker.create();
        res.send({});
    });

    app.put('/api/cluster/current', app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        app.worker.reset(id);
        res.send({});
    });

    app.delete('/api/cluster/current', app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        if (app.worker.items.length > 1) {
            app.worker.shutdown(id);
            res.send({});
        } else {
            res.send({ error: 'Invalid action!' });
        }
    });


    // ----------------
    app.get('/api/cluster/all', app.permission.check('cluster:manage'), async (req, res) => {
        const services = {},
            serviceNames = Object.keys(appConfig.services);
        for (let i = 0; i < serviceNames.length; i++) {
            const startTime = new Date().getTime();
            const serviceName = serviceNames[i];
            let service = {};

            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => reject(), 3000);
            });

            try {
                const result = await Promise.race([
                    app.service.clusterGetAll(serviceName),
                    timeoutPromise,
                ]);
                service = result;
            } catch (_) {
                console.error(`${serviceName} Timeout`);
            }

            const endTime = new Date().getTime();

            service.duration = Math.floor((endTime - startTime) / (1000));
            if (service && !service.error) services[serviceName] = service;
        }

        for (let mainKey of Object.keys(app.mainServices)) {
            const mainConfig = app.mainServices[mainKey];
            if (app.appName == mainConfig.appName) { // Current main<key> Ví dụ: main, main1, ...
                const startTime = new Date().getTime();
                const endTime = new Date().getTime();

                services[mainKey] = { clusters: app.worker.items, duration: Math.floor((endTime - startTime) / (1000)) };
            } else { // Another main, ví dụ main gọi main1
                const startTime = new Date().getTime();
                const data = await app.service.get(mainConfig.mainUrl + '/api/cluster/current' + '?t=' + new Date().getTime());
                const endTime = new Date().getTime();

                services[mainKey] = { clusters: data.clusters, duration: Math.floor((endTime - startTime) / (1000)) };
            }
        }

        res.send({ services });
    });

    app.get('/api/cluster/single', app.permission.check('cluster:manage'), async (req, res) => {
        const serviceName = req.query.serviceName;
        const serviceNames = Object.keys(appConfig.services);
        const mainKeys = Object.keys(app.mainServices);

        if (serviceNames.includes(serviceName)) {
            const startTime = new Date().getTime();
            const service = await app.service.clusterGetAll(serviceName);
            const endTime = new Date().getTime();

            service.duration = Math.floor((endTime - startTime) / (1000));
            res.send(service); // { clusters }
        } else if (mainKeys.includes(serviceName)) {
            const mainConfig = app.mainServices[serviceName];

            if (app.appName == mainConfig.appName) { // Current main<key> Ví dụ: main, main1, ...
                res.send({ clusters: app.worker.items, duration: 0 });
            } else { // Another main, ví dụ main gọi main1
                const startTime = new Date().getTime();
                const data = await app.service.get(mainConfig.mainUrl + '/api/cluster/current' + '?t=' + new Date().getTime());
                const endTime = new Date().getTime();

                data.duration = Math.floor((endTime - startTime) / (1000));
                res.send(data); // { clusters, duration }
            }
        } else {
            res.send({ error: 'Invalid service name' });
        }
    });

    app.post('/api/cluster', app.permission.check('cluster:write'), async (req, res) => {
        const { serviceName } = req.body;
        // Kiểm tra serviceName có phải là main hay không
        const mainKeys = Object.keys(app.mainServices);
        const isMainService = mainKeys.includes(serviceName);

        if (isMainService) { // Worker cần tạo là main|main1|....
            const mainConfig = app.mainServices[serviceName]; // Cấu hình của service main cần tạo worker
            if (app.appName == mainConfig.appName) { // Ví dụ vô đúng main và tạo main worker
                app.worker.create();
            } else { // Ví dụ tạo main worker nhưng lại vào main1
                await app.service.post(mainConfig.mainUrl + '/api/cluster/current' + '?t=' + new Date().getTime());
            }
        } else { // Worker cần tạo là các md Services
            await app.service.clusterCreate(serviceName);
        }
        // socketIoEmit();
        res.send({});
    });

    app.put('/api/cluster', app.permission.check('cluster:write'), async (req, res) => {
        const { serviceName, id } = req.body;
        // Kiểm tra serviceName có phải là main hay không
        const mainKeys = Object.keys(app.mainServices);
        const isMainService = mainKeys.includes(serviceName);

        if (isMainService) { // Worker cần reset là main|main1|....
            const mainConfig = app.mainServices[serviceName]; // Cấu hình của service main cần reset worker
            if (app.appName == mainConfig.appName) { // Ví dụ vô đúng main và reset main worker
                app.worker.reset(id);
            } else { // Ví dụ reset main worker nhưng lại vào main1
                await app.service.put(mainConfig.mainUrl + '/api/cluster/current' + '?t=' + new Date().getTime(), { id });
            }
        } else { // Worker cần reset là các md Services
            await app.service.clusterReset(serviceName, id);
        }
        // socketIoEmit();
        res.send({});
    });

    app.delete('/api/cluster', app.permission.check('cluster:delete'), async (req, res) => {
        const { serviceName, id } = req.body;
        // Kiểm tra serviceName có phải là main hay không
        const mainKeys = Object.keys(app.mainServices);
        const isMainService = mainKeys.includes(serviceName);

        if (isMainService) { // Worker cần reset là main|main1|....
            const mainConfig = app.mainServices[serviceName]; // Cấu hình của service main cần delete worker
            if (app.appName == mainConfig.appName) { // Ví dụ vô đúng main và delete main worker
                if (app.worker.items.length > 1) {
                    app.worker.shutdown(id);
                } else {
                    return res.send({ error: 'Invalid action!' });
                }
            } else { // Ví dụ reset main worker nhưng lại vào main1
                const data = await app.service.delete(mainConfig.mainUrl + '/api/cluster/current' + '?t=' + new Date().getTime(), { id });
                if (data && data.error) {
                    return res.send({ error: data.error });
                }
            }
        } else { // Worker cần xóa là các md Services
            await app.service.clusterDelete(serviceName, id);
        }

        // socketIoEmit();
        res.send({});
    });
};