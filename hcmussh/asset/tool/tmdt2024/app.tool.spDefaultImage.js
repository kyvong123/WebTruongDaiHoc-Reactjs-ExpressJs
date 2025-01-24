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
const getSanPhamSaveUrl = (spId) => app.path.join(`/img/tmdtSpUploadFile/${spId}`);
const getSanPhamSaveFolder = (spId) => app.path.join(app.publicPath, `/img/tmdtSpUploadFile/${spId}`);
app.loadModules(false);
app.readyHooks.add('Run tool.spDefaultImage.js', {
    ready: () => app.database.oracle.connected && app.model.tmdtSanPham,
    run: async () => {
        try {
            let ids = (await app.model.tmdtSanPham.getAll({})).map(item => item.id);
            await Promise.all(ids.map(async id => {
                const imageFiles = app.fs.existsSync(getSanPhamSaveFolder(id)) && app.fs.readdirSync(getSanPhamSaveFolder(id));
                if (imageFiles && imageFiles.length) {
                    await app.model.tmdtSanPham.update({ id }, { defaultImage: app.path.join(getSanPhamSaveUrl(id), imageFiles[0]) });
                }
            }));
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})