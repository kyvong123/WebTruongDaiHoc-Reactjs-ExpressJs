let package = require('../../../package.json');
const path = require('path');
const { parse } = require('path');
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
require('../../../config/lib/array')(app);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.setUpSoTienTungMon.js', {
    ready: () => app.database.oracle.connected && app.model.tcHocPhiDetail && app.model.tcHocPhiSubDetail && app.model.dtDangKyHocPhan && app.model.tcHocPhiDetail,
    run: async () => {
        try {
            console.log('START');
            const { mssv } = await app.model.tcHocPhiSubDetail.get({});
            const { rows: hocPhi } = await app.model.tcHocPhiDetail.getHocPhi(2022, 1, mssv);
            const loaiPhiHocPhi = parseInt(hocPhi[0].loaiPhi);
            const condtion = {
                statement: 'loaiPhi = :loaiPhi AND soTienDaDong > 0',
                parameter: {
                    loaiPhi: loaiPhiHocPhi
                }
            };
            console.log('Step 1: Reset data')
            await app.model.tcHocPhiSubDetail.update({}, { soTienDaDong: 0 })
            console.log('-----------------------')
            console.log('Step 2: Setup data')
            const listSinhVienHocPhi = await app.model.tcHocPhiDetail.getAll(condtion, 'mssv, soTienDaDong');
            if (listSinhVienHocPhi.length) {
                const chunks = listSinhVienHocPhi.chunk(100);
                for (const chunk of chunks) {
                    await Promise.all(chunk.map((async item => {
                        const { mssv, soTienDaDong } = item;
                        console.log('processing ' + mssv);
                        let soTienConLai = parseInt(soTienDaDong);
                        const { rows: subDetail } = await app.model.tcHocPhi.getSubDetail(mssv);
                        for (let hocPhan of subDetail) {
                            const soTienCanDong = parseInt(hocPhan.soTien) - parseInt(hocPhan.soTienDaDong);
                            if (soTienConLai == 0 || parseInt(hocPhan.soTien) == 0) {
                                break;
                            } else if (soTienConLai > 0 && soTienConLai >= soTienCanDong) {
                                await app.model.tcHocPhiSubDetail.update({ id: hocPhan.id }, { soTienDaDong: parseInt(hocPhan.soTien) });
                                soTienConLai -= parseInt(hocPhan.soTien);
                            }
                            else if (soTienConLai > 0 && soTienConLai < soTienCanDong) {
                                await app.model.tcHocPhiSubDetail.update({ id: hocPhan.id }, { soTienDaDong: parseInt(hocPhan.soTienDaDong) + parseInt(soTienConLai) });
                                soTienConLai = 0;
                            }
                        }
                    })));
                }
            }
            console.log('END');

        } catch (error) {
            console.error(error);
            console.log('Error: Set up that bai');
            process.exit(1);
        }
    }
});
