module.exports = (app, appConfig, http) => {
    const { Server } = require('socket.io');
    const { createAdapter } = require('@socket.io/redis-adapter');

    app.io = new Server(http);
    const redis = require('redis');
    const pubClient = app.isDebug ?
        redis.createClient({ socket: { connectTimeout: 30000 } }) :
        redis.createClient({ url: `redis://:${appConfig.redisDB.auth}@${appConfig.redisDB.host}:${appConfig.redisDB.port}` });
    pubClient.on('connect', () => console.log(` - #${process.pid}: The Redis connection ${app.isDebug ? 'localhost' : appConfig.redisDB.host} succeeded.`));
    pubClient.on('error', error => console.log(` - #${process.pid}: The Redis connection failed!`, error.message));

    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        app.io.adapter(createAdapter(pubClient, subClient));

        const socketListeners = {};
        app.io.addSocketListener = (name, listener) => socketListeners[name] = listener;

        app.io.getSessionUser = socket => {
            const sessionUser = socket.request.session ? socket.request.session.user : null;
            if (sessionUser) {
                delete sessionUser.password;
                delete sessionUser.token;
                delete sessionUser.tokenDate;
            }
            return sessionUser;
        };

        const joinSystem = socket => {
            // Leave all rooms except default room
            const rooms = Array.from(socket.rooms).slice(1);
            rooms.forEach(room => socket.leave(room));

            // Join with room of current user email
            const sessionUser = app.io.getSessionUser(socket);
            sessionUser && sessionUser.email  && socket.join(sessionUser.email.toString());

            // Remove all listener
            const eventNames = socket.eventNames().filter(event => !['disconnect', 'system:join'].includes(event));
            eventNames.forEach(event => socket.removeAllListeners(event));

            // Run all socketListeners
            Object.values(socketListeners).forEach(socketListener => socketListener(socket));
        };

        app.io.on('connection', socket => {
            app.isDebug && console.log(` - Socket ID ${socket.id} connected!`);
            app.isDebug && socket.on('disconnect', () => console.log(` - Socket ID ${socket.id} disconnected!`));

            socket.on('system:join', () => joinSystem(socket));
            joinSystem(socket);
        });
    });

    if (app.isDebug && app.fs.existsSync('public/js')) {
        app.fs.watch('public/js', () => {
            console.log('Reload client!');
            app.io.emit('debug', 'reload');
        });
    }
};