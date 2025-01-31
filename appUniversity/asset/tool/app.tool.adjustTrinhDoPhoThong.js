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
                if ((canBo.hocVi || canBo.chucDanh || canBo.chuyenNganh) && !canBo.trinhDoPhoThong) {
                    app.model.tchcCanBo.update({ shcc: canBo.shcc }, { trinhDoPhoThong: '12/12' }, (er, out) => {
                        console.log(i++);
                    })
                }
            });
        }
    });
}

app.readyHooks.add('Run tool.adjustTrinhDoPhoThong.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tchcCanBo,
    run,
});