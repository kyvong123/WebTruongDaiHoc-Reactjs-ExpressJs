module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);
    require('./notify')(app);

    require('./controllerAgri')(app);
    require('./controllerBidv')(app);
    require('./controllerVcb')(app);
    require('./controllerVnpay')(app);
};