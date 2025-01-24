let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules)
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

// Init =======================================================================
app.loadModules(false);
const run = () => {
    app.model.dmDonVi.getMaDonVi('Khoa Việt Nam học', (ma) => {
        app.model.tchcCanBo.getShccCanBo({ ho: 'Nguyễn Thị Hoàng', ten: 'Yến', ngaySinh: '12/12/1964', maDonVi: ma }, (error, shcc) => {
            console.log("data1 = ", { error, shcc });
        });
    });
    app.model.dmDonVi.getMaDonVi('Khoa Việt Nam học', (ma) => {
        app.model.tchcCanBo.getShccCanBo({ ho: 'lƯu tuẤn', ten: 'Anh', ngaySinh: '12/12/1964', maDonVi: ma }, (error, shcc) => {
            console.log("data2 = ", { error, shcc });
        });
    });
};

app.readyHooks.add('Run tool.testGetShccCanBo.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tchcCanBo && app.model.dmDonVi,
    run
});