module.exports = (cluster, isDebug) => {
    let appConfig = require('../package.json');
    const express = require('express');
    const app = express();
    app.isDebug = isDebug;
    app.fs = require('fs');
    app.path = require('path');
    if (app.fs.existsSync('./specialConfig.json')) {
        const specialConfig = require('../specialConfig.json');
        appConfig = Object.assign({}, appConfig, specialConfig);
    }
    app.appName = appConfig.name;
    app.primaryWorker = process.env['primaryWorker'] == 'true';
    const server = app.isDebug ?
        require('http').createServer(app) :
        require('https').createServer({
            cert: app.fs.readFileSync('/etc/ssl/hcmussh_certificate.pem'),
            // ca: app.fs.readFileSync('/etc/ssl/hcmussh_ca_bundle.crt'),
            key: app.fs.readFileSync('/etc/ssl/hcmussh_private.key')
        }, app);
    if (!app.isDebug && app.fs.existsSync('./asset/config.json')) {
        const mainConfig = require('../asset/config.json');
        appConfig = Object.assign({}, appConfig, mainConfig);
    }
    app.mainServices = appConfig.mainServices || {};

    // Variables ------------------------------------------------------------------------------------------------------
    app.port = appConfig.port;
    app.developers = appConfig.developers;
    app.rootUrl = appConfig.rootUrl ? appConfig.rootUrl : appConfig.mainUrl;
    app.debugUrl = `http://localhost:${app.port}`;
    if (appConfig.email) {
        app.email = appConfig.email;
        app.apiKeySendGrid = appConfig.email.apiKeySendGrid;
        app.defaultAdminEmail = appConfig.default.adminEmail;
        app.mailSentName = appConfig.email.from;
    }
    app.tempPath = app.path.join(__dirname, '../.temp');
    app.assetPath = app.path.join(__dirname, '../asset');
    app.bundlePath = appConfig.isProxyService ? app.path.join(__dirname, '../bundle') : app.path.join(app.assetPath, 'bundle');
    app.viewPath = app.path.join(__dirname, '../view');
    app.modulesPath = app.path.join(__dirname, '../modules');
    app.servicesPath = app.path.join(__dirname, '../services');
    app.publicPath = app.path.join(__dirname, '../public');
    app.imagePath = app.path.join(app.publicPath, 'img');
    app.faviconPath = app.path.join(app.imagePath, 'favicon.png');
    app.uploadPath = app.path.join(__dirname, '../asset/upload');
    app.documentPath = app.path.join(__dirname, '../asset/document');
    app.database = {};
    app.model = {};

    // Configure ------------------------------------------------------------------------------------------------------
    require('./common')(app, appConfig);
    require('./view')(app, express);
    require('./database.redisDB')(app, appConfig);
    require('./database.oracleDB')(app, appConfig);
    require('./packages')(app, appConfig);
    require('./authentication')(app);
    require('./permission')(app, appConfig);
    require('./authentication.google')(app, appConfig);
    if (!app.appName?.startsWith('mdDangKyMonHoc')) {
        require('./rabbitmq')(app, appConfig);
    } else {
        app.messageQueue = {
            consume: () => { }
        };
    }
    require('./io')(app, appConfig, server);
    require('./mobile/google.firebase')(app);

    // Init -----------------------------------------------------------------------------------------------------------
    app.createTemplate('home', 'admin', 'unit', 'utils');
    app.loadModules();
    app.loadServices();
    app.get('/user', app.permission.check('user:login'), app.templates.admin);

    let hasUpdate = new Set(); //Mỗi lần nodemon restart nó chỉ updateSessionUser 1 lần
    app.get('*', (req, res, next) => {
        const process = () => {
            const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
            app.model.fwHomeMenu.get({ link }, (error, menu) => {
                if (menu) {
                    if (menu.maDonVi == '00')
                        app.templates.home(req, res);
                    else {
                        app.templates.unit(req, res);
                    }
                } else {
                    next();
                }
            });
        };
        if (app.isDebug && req.session.user && !hasUpdate.has(req.session.user.email)) {
            hasUpdate.add(req.session.user.email);
            app.updateSessionUser(req, req.session.user, () => {
                process();
            });
        } else {
            process();
        }
    });

    // ProxyService ---------------------------------------------------------------------------------------------------
    if (appConfig.isProxyService && appConfig.services && appConfig.services[appConfig.name]) {
        console.log(`Service ${appConfig.name} is ready! ${appConfig.services[appConfig.name].apiPrefix}hello/:name`);
        app.get(`${appConfig.services[appConfig.name].apiPrefix}hello/:name`, (req, res) => res.send(`Hello ${req.params.name}! My name is ${appConfig.name}.`));
        require('./initService')(app, appConfig);
    }

    // Worker ---------------------------------------------------------------------------------------------------------
    app.worker = {
        create: () => process.send({ type: 'createWorker' }),
        reset: (workerId) => process.send({ type: 'resetWorker', workerId, primaryWorker: app.primaryWorker }),
        shutdown: (workerId) => process.send({ type: 'shutdownWorker', workerId, primaryWorker: app.primaryWorker })
    };

    // Listen from MASTER ---------------------------------------------------------------------------------------------
    process.on('message', message => {
        if (message.type == 'workersChanged') {
            // app.io && app.io.to('cluster').emit('services-changed');
            app.worker.items = message.workers;
        } else if (message.type == 'resetWorker') {
            server.close();
            process.exit(1);
        } else if (message.type == 'shutdownWorker') {
            process.exit(4);
        } else if (message.type == 'setPrimaryWorker') {
            app.primaryWorker = true;
        }
    });

    // Launch website -------------------------------------------------------------------------------------------------
    require('./debug')(app);
    server.listen(app.port);
};