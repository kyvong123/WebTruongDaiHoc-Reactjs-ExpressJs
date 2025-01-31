let package = require('../../package.json');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../', 'public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../config.json'));
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/hooks')(app);
require('../../config/lib/utils')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.changeIdScanFile.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        console.log('Start update scan file data');
        const dataScanFile = await app.model.dtDiemScanFile.getAll({
            statement: 'id > :id',
            parameter: { id: 205 }
        }, '*', 'id DESC');
        for (let file of dataScanFile) {
            await app.model.dtDiemScanFile.update({ id: file.id }, { id: file.id + 1 });
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Update id scan file for ${file.id} done`);
        }
        console.log('Update scan file data done!');
    }
});