let package = require('../../../package.json');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../../', 'public'),
    assetPath: path.join(__dirname, '../../'),
    modulesPath: path.join(__dirname, '../../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../../config.json'));
// Configure ==================================================================
require('../../../config/common')(app);
require('../../../config/lib/fs')(app);
// require('../../../config/lib/excel')(app);
require('../../../config/lib/hooks')(app);
require('../../../config/lib/utils')(app);
require('../../../config/lib/date')(app);
require('../../../config/lib/array')(app);
require('../../../config/lib/string')(app);
require('../../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.dongBoHocPhi.js', {
    ready: () => app.database.oracle.connected && app.model.dtLichSuDkhp && app.model.tcDotDong,
    run: async () => {
        try {
            console.log('START')
            let listSv = await app.model.dtLichSuDkhp.getAll({ thaoTac: 'U' }, 'mssv').then(data => data.map(item => item.mssv));
            listSv = Array.from(new Set(listSv)).chunk(20);
            idx = 1
            for (let chunk of listSv) {
                console.log(`CHUNK ${idx}:`);
                await Promise.all(chunk.map(async sv => {
                    await app.model.tcDotDong.dongBoHocPhi(null, null, sv, 'Tool RUN', 1, 1);
                }))
                idx++;
            }
            console.log('END');
        } catch (error) {
            console.error(error);
            console.log('FAILED');
            process.exit(1);
        }
    }
});
