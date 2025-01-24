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
app.readyHooks.add('Run tool.importToQtLuong.js', {
    ready: () => app.database.oracle.connected && app.model.qtLuong && app.model.tchcCanBo,
    run: async () => {
        const convertTyLe = (value) => {
            if (typeof value === 'string' && value.includes('%')) {
                /* TY_LE_PHU_CAP_UU_DAI */
                return Number(value.substring(0, value.length - 1)) / 100;
            } else if (!isNaN(value)) {
                /* TY_LE_VUOT_KHUNG */
                return Number(value) / 100;
            } else {
                return null;
            }
        }

        try {
            let qtLuongItems = await app.model.tchcCanBo.getAll();
            await Promise.all(qtLuongItems.map((item) => {
                const {ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, shcc, tyLePhuCapThamNien, tyLePhuCapUuDai, mocBacLuongCuoiCung} = item;
                return app.model.qtLuong.create({
                    batDauType: 'dd/mm/yyyy',
                    ketThucType: 'dd/mm/yyyy',
                    chucDanhNgheNghiep: ngach,
                    bac: bacLuong,
                    heSoLuong,
                    batDau: ngayHuongLuong,
                    mocNangBacLuong: mocNangLuong,
                    shcc,
                    tyLeVuotKhung: convertTyLe(tyLeVuotKhung),
                    tyLePhuCapUuDai: convertTyLe(tyLePhuCapUuDai),
                    tyLePhuCapThamNien: convertTyLe(tyLePhuCapThamNien),
                    mocBacLuongCuoiCung
                }, null);
            }));
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})