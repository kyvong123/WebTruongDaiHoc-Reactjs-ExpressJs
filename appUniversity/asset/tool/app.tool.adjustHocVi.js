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
    app.model.tchcCanBo.getAll({}, (error, result) => {
        if (result) {
            result.forEach(canBo => {
                if (canBo.hocVi == '02') {
                    app.model.tchcCanBo.update({ shcc: canBo.shcc }, { tienSi: 1 }, (err, out) => {
                        console.log(canBo.shcc);
                    })
                } else if (canBo.hocVi == '03') {
                    app.model.tchcCanBo.update({ shcc: canBo.shcc }, { thacSi: 1 }, (err, out) => {
                        console.log(canBo.shcc);
                    })
                } else if (canBo.hocVi == '04') {
                    app.model.tchcCanBo.update({ shcc: canBo.shcc }, { cuNhan: 1 }, (err, out) => {
                        console.log(canBo.shcc);
                    })
                }

            });
        }
    });
}

app.readyHooks.add('Run tool.adjustHocVi.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tchcCanBo,
    run,
});