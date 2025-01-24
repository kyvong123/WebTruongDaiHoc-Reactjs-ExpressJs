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

app.loadModules(false);
app.readyHooks.add('Run tool.importUnitStaff.js', {
    ready: () => app.database.oracle.connected && app.model.qtHopDongDonViTraLuong && app.model.tccbCanBoDonVi && app.model.tchcCanBo,
    run: async () => {
        try {
            const hopDong = await app.model.qtHopDongDonViTraLuong.getAll();
            const canBoDonVi = await app.model.tccbCanBoDonVi.getAll();
            const canBo = await app.model.tchcCanBo.getAll();
            for (let hopDongItem of hopDong) {
                console.log(!canBoDonVi.find(canBoDonViItem => canBoDonViItem.shcc == hopDongItem.shcc));
                if (!canBoDonVi.find(canBoDonViItem => canBoDonViItem.shcc == hopDongItem.shcc)) {
                    let canBoItem = canBo.find(canBoItem => canBoItem.shcc == hopDongItem.shcc);
                    if (canBoItem) {
                        const { shcc } = hopDongItem;
                        const { ho, ten, ngaySinh, phai, cmnd, cmndNgayCap, cmndNoiCap, quocGia, danToc, tonGiao, email, dienThoaiCaNhan, maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha, hocVi, chuyenNganh, chucDanh, chuyenNganhChucDanh } = canBoItem;
                        app.model.tccbCanBoDonVi.create({ shcc, ho, ten, ngaySinh, phai, cmnd, cmndNgayCap, cmndNoiCap, quocGia, danToc, tonGiao, email, dienThoaiCaNhan, maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha, hocVi, chuyenNganh, chucDanh, chuyenNganhChucDanh }, null);
                    }
                }
            }
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})
