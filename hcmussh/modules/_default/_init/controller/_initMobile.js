module.exports = app => {
    app.mobileState = {
        prefixKey: 'hcmussh_mobile_state:',

        initState: {
            latestIOSVersion: '1.0.0',
            latestAndroidVersion: '1.0.0',
            isQA: '1',
            isBlackbox: '1',
            isTtLienHeBeta: '1',
            isYShop: '1',
            isTmdtYShopTestBeta: '1',
            isMaintainence: '0',
        },

        init: () => app.database.redis.keys('hcmussh_mobile_state:*', (_, keys) => {
            keys && Object.keys(app.mobileState.initState).forEach(key => {
                const redisKey = `hcmussh_mobile_state:${key}`;
                if (!keys.includes(redisKey) && app.mobileState.initState[key]) app.database.redis.set(redisKey, app.mobileState.initState[key]);
            });
        }),

        get: (...params) => new Promise((resolve, reject) => {
            const n = params.length, prefixKeyLength = app.mobileState.prefixKey.length;
            const keys = n == 0 ? app.mobileState.keys : params.map(key => `hcmussh_mobile_state:${key}`);
            app.database.redis.mget(keys, (error, values) => {
                if (error || values == null) {
                    reject(error || 'Error when get Redis value!');
                } else if (n == 1) { // Get 1 value
                    resolve(values[0]);
                } else {
                    const state = {};
                    keys.forEach((key, index) => state[key.substring(prefixKeyLength)] = values[index]);
                    resolve(state);
                }
            });
        }),

        set: (...params) => new Promise((resolve, reject) => {
            const n = params.length;
            for (let i = 0; i < n - 1; i += 2) params[i] = app.mobileState.prefixKey + params[i];
            app.database.redis.mset(params, error => error ? reject(error) : resolve());
        }),
    };

    app.mobileState.keys = Object.keys(app.mobileState.initState).map(key => app.mobileState.prefixKey + key);

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyMobileInitState', {
        ready: () => app.database.redis,
        run: () => app.primaryWorker && app.mobileState.init(),
    });
};