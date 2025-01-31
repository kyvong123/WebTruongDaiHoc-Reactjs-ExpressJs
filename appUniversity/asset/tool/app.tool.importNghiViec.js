let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package.db);

// Init =======================================================================
app.loadModules(false);

const run = () => {
    let i = 0;
    app.model.tchcCanBo.getAll({}, (error, result) => {
        if (result) {
            result.forEach(canBo => {
                if (canBo.daNghi) {
                    app.model.qtNghiViec.create({ shcc: canBo.shcc, ngayNghi: canBo.ngayNghi }, (err, res) => {
                        if (res) {
                            console.log(i++);
                        }
                    })
                }

            });
        }
    });
}

app.readyHooks.add('Run tool.importNghiViec.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tchcCanBo && app.model.qtNghiViec,
    run,
});