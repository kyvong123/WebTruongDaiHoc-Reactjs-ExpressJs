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

const trangThaiCu = {
    'cho_xac_nhan': 1,
    'cho_thanh_toan': 2,
    'da_thanh_toan': 3,
    'da_nhan_hang': 4,
    'huy': 5,
    'shop_tu_choi': 6,
    'dang_giao_hang': 7,
};

const trangThai = {
    'pending': 0,
    'cho_xac_nhan': 1,
    'dang_xu_ly': 2,
    'ket_thuc': 3,
    'huy': 4,
    'shop_tu_choi': 5,
};

const trangThaiGiaoHang = {
    'pending': 0,
    'dang_trong_kho': 1,
    'dang_giao_hang': 2,
    'da_giao_hang': 3,
    'giao_hang_that_bai': 4,
};

const trangThaiThanhToan = {
    'pending': 0,
    'cho_thanh_toan': 1,
    'da_thanh_toan': 2,
};

app.loadModules(false);
app.readyHooks.add('Run tool.convertSubDonTrangThai.js', {
    ready: () => app.database.oracle.connected && app.model.tmdtSubDon,
    run: async () => {
        try {
            let subDonList = await app.model.tmdtSubDon.getAll({}, 'id,trangThai,isConverted');
            await Promise.all(subDonList.map(async subDon => {
                if (subDon.isConverted == 0) {
                    switch (subDon.trangThai) {
                        case trangThaiCu.cho_xac_nhan:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.cho_xac_nhan, trangThaiGiaoHang: trangThaiGiaoHang.dang_trong_kho, trangThaiThanhToan: trangThaiThanhToan.pending, isConverted: 1 });
                            break;
                        case trangThaiCu.cho_thanh_toan:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.dang_xu_ly, trangThaiGiaoHang: trangThaiGiaoHang.dang_trong_kho, trangThaiThanhToan: trangThaiThanhToan.cho_thanh_toan, isConverted: 1 });
                            break;
                        case trangThaiCu.da_thanh_toan:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.dang_xu_ly, trangThaiGiaoHang: trangThaiGiaoHang.dang_trong_kho, trangThaiThanhToan: trangThaiThanhToan.da_thanh_toan, isConverted: 1 });
                            break;
                        case trangThaiCu.da_nhan_hang:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.ket_thuc, trangThaiGiaoHang: trangThaiGiaoHang.da_giao_hang, trangThaiThanhToan: trangThaiThanhToan.da_thanh_toan, isConverted: 1 });
                            break;
                        case trangThaiCu.huy:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.huy, trangThaiGiaoHang: trangThaiGiaoHang.pending, trangThaiThanhToan: trangThaiThanhToan.pending, isConverted: 1 });
                            break;
                        case trangThaiCu.shop_tu_choi:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.shop_tu_choi, trangThaiGiaoHang: trangThaiGiaoHang.pending, trangThaiThanhToan: trangThaiThanhToan.pending, isConverted: 1 });
                            break;
                        case trangThaiCu.dang_giao_hang:
                            await app.model.tmdtSubDon.update({ id: subDon.id }, { trangThai: trangThai.dang_xu_ly, trangThaiGiaoHang: trangThaiGiaoHang.pending, trangThaiThanhToan: trangThaiThanhToan.pending, isConverted: 1 });
                            break;
                    }
                }
            }));
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})