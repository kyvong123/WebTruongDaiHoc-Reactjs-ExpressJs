let package = require('../../../package.json');
const path = require('path');
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
// require('../../../config/lib/excel')(app);
require('../../../config/lib/hooks')(app);
require('../../../config/lib/utils')(app);
require('../../../config/lib/date')(app);
require('../../../config/lib/string')(app);
require('../../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.setupLuuTruHocPhan.js', {
    ready: () => app.database.oracle.connected && app.model.tcHocPhiSubDetail && app.model.dtDangKyHocPhan && app.model.tcHocPhiDetail,
    run: async () => {
        try {
            console.log('START');
            condition_getSub = {
                statement: 'maHocPhan IS NULL'
            }
            // await app.model.tcHocPhiSubDetail.update({}, { maHocPhan: null });
            const data = await app.model.tcHocPhiSubDetail.getAll(condition_getSub);
            for (let item of data) {
                const { id, mssv, maMonHoc } = item;
                const condition = {
                    statement: 'mssv=:mssv AND maMonHoc=:maMonHoc AND (hocKy IS NULL OR hocKy = 1)',
                    parameter: {
                        mssv,
                        maMonHoc
                    }
                }
                const maHocPhan = await app.model.dtDangKyHocPhan.getAll(condition, '*');
                for (let hocPhan of maHocPhan) {
                    const checkHocPhanTrung = await app.model.tcHocPhiSubDetail.get({ mssv, maMonHoc, maHocPhan: hocPhan.maHocPhan });
                    if (checkHocPhanTrung && hocPhan.maHocPhan) {
                        continue;
                    } else {
                        await app.model.tcHocPhiSubDetail.update({ id }, { maHocPhan: hocPhan.maHocPhan });
                        break;
                    }
                }
            }
            console.log('END');

        } catch (error) {
            console.log('Error: Set up that bai');
            process.exit(1);
        }
    }
});
