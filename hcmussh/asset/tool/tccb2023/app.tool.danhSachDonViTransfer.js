let package = require('../../../package.json');
const path = require('path');
const e = require('cors');
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
require('../../../config/lib/excel')(app);
require('../../../config/lib/hooks')(app);
require('../../../config/lib/utils')(app);
require('../../../config/lib/date')(app);
require('../../../config/lib/string')(app);
require('../../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.danhSachDonViTransfer.js', {
    ready: () => app.database.oracle.connected && app.model.dmDonVi && app.model.tccbDanhSachDonVi,
    run: async() => {
        try {
            let items = await app.model.dmDonVi.getAll();
            items = items.filter(item => item.kichHoat == 1);

            await Promise.all(items.map(async item => {
                const {ma: maTt, ten, tenVietTat: vietTat, ghiChu, kichHoat} = item;
                await app.model.tccbDanhSachDonVi.create({
                    ten, maTt, vietTat, ghiChu, kichHoat
                }, null);
            }));
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})