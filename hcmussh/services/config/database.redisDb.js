module.exports = (app, appConfig) => {
    // Connect RedisDB ------------------------------------------------------------------------------------------------------------------------------
    const redisDB = appConfig.redisDB;
    const redis = require('redis');
    app.database.redis = app.isDebug ?
        redis.createClient({ legacyMode: true }) :
        redis.createClient({ legacyMode: true, host: redisDB.host, port: redisDB.port, password: redisDB.auth });

    app.database.redis.on('connect', () => {
        console.log(` - #${process.pid}: The Redis connection succeeded.`);
    });
    app.database.redis.on('error', error => {
        console.log(` - #${process.pid}: The Redis connection failed!`, error.message);
        app.database.redis.end(true);
    });
};