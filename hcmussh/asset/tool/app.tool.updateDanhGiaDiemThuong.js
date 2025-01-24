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
require('../../config/lib/date')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.updateDanhGiaDiemThuong.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tccbDiemThuong && app.model.tccbDanhGiaCaNhanDiemThuong,
    run: async () => {
        const nam = new Date().getFullYear();
        const khenThuongNam = await app.model.tccbDiemThuong.getAll({ nam });
        const kyLuatNam = await app.model.tccbDiemTru.getAll({ nam });
        const dsCanBo = await app.model.tchcCanBo.getAll({
            statement: 'ngayNghi IS NULL OR ngayNghi <= :ngayNghi',
            parameter: { ngayNghi: new Date(nam + 1, 0, 1).getTime() }
        });

        for (const canBo of dsCanBo) {
            if (canBo.shcc) {
                await app.model.tccbDanhGiaCaNhanDiemThuong.updateCaNhanDiemThuong(canBo.shcc, nam, khenThuongNam);
                await app.model.tccbDanhGiaCaNhanDiemTru.updateCaNhanDiemTru(canBo.shcc, nam, kyLuatNam);
            }
        }
    }
});