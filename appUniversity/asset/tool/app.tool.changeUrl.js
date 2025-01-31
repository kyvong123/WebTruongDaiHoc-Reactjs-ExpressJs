let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, '../../', 'public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../', 'modules'),
    database: {},
    model: {}
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

// Init =======================================================================
app.loadModules(false);

// Init =======================================================================

app.loadModules(false);
const errorList = [];

const run = () => {
    const condition = {
        statement: `content LIKE :searchTerm`,
        parameter: { searchTerm: '%/api/storage/%' },
    };
    app.model.fwNews.getAll(condition, (error, items) => {
        console.log(items.length);
        if (!error && items && items.length) {
            items.forEach(item => {
                let content = item.content.replaceAll('/api/storage/', '/api/tt/storage/');
                // console.log(item.id, content);
                // app.model.fwNews.update({ id: item.id }, { content }, (error) => { });
            });
        }
    });
};

app.readyHooks.add('Run tool.changeUrl.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.fwNews,
    run
});