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
const reduceBill = async (mssv, amount) => {
    try {
        const hocPhiSinhVien = await app.model.tcHocPhi.get({ mssv, namHoc: 2022, hocKy: 1 });
        if (hocPhiSinhVien) {
            const keys = { mssv, namHoc: hocPhiSinhVien.namHoc, hocKy: hocPhiSinhVien.hocKy };
            const data = await app.model.tcHocPhi.sinhVienGetHocPhi(app.utils.stringify(keys));
            let soTienConLai = parseInt(amount);
            let hocPhiDetail = data.rows;
            let result = {};
            if (hocPhiDetail.find(item => item.isTamThu == 1 && hocPhiDetail.find(cur => cur.tamThu == item.idLoaiPhi))) {
                hocPhiDetail = hocPhiDetail.filter(loaiPhi => loaiPhi.isTamThu == 0);
            }
            for (const row of hocPhiDetail) {
                const soTienCanDong = parseInt(row.soTien) - parseInt(row.daDong);
                if (soTienConLai == 0) {
                    break;
                }
                else if (soTienCanDong > 0 && soTienConLai >= soTienCanDong && row.isHocPhi == 0) {
                    soTienConLai = soTienConLai - soTienCanDong;
                    result[row.idLoaiPhi.toString()] = { soTien: soTienCanDong, ten: row.tenLoaiPhi };
                    await app.model.tcHocPhiDetail.update({ loaiPhi: row.idLoaiPhi, ...keys }, { soTienDaDong: row.soTien });
                }
                else if (soTienCanDong > 0 && soTienConLai < soTienCanDong) {
                    result[row.idLoaiPhi.toString()] = { soTien: soTienConLai, ten: row.tenLoaiPhi };
                    await app.model.tcHocPhiDetail.update({ loaiPhi: row.idLoaiPhi, ...keys }, { soTienDaDong: parseInt(row.daDong) + soTienConLai });
                    soTienConLai = 0;
                }
                else if (soTienConLai > 0 && (row.isHocPhi == 1 || hocPhiDetail.indexOf(row) == hocPhiDetail.length - 1)) {
                    result[row.idLoaiPhi.toString()] = { soTien: soTienConLai, ten: row.tenLoaiPhi };
                    await app.model.tcHocPhiDetail.update({ loaiPhi: row.idLoaiPhi, ...keys }, { soTienDaDong: parseInt(row.daDong) + soTienConLai });
                    soTienConLai = 0;
                }
            }
            return { result: `${app.utils.stringify(result)}` };
        } else {
            console.log('Bỏ qua sinh viên: ', mssv);
            return { result: null }
        }
    } catch (error) {
        console.log('Lỗi ở sinh viên: ', mssv)
        console.error(error);
        return { result: null };
    }
};
// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.setupSoTienDaDong.js', {
    ready: () => app.database.oracle.connected && app.model.tcHocPhi && app.model.tcHocPhiTransaction && app.model.tcHocPhiDetail,
    run: async () => {
        try {
            console.log('START')

            await app.model.tcHocPhiDetail.update({ namHoc: 2022, hocKy: 1 }, { soTienDaDong: 0 });
            const listTransaction = await app.model.tcHocPhiTransaction.getAll({ status: 1 }, '*', 'transDate ASC');
            for (const item of listTransaction) {
                const updateContent = await reduceBill(item.customerId, item.amount);
                if (updateContent.result) {
                    await app.model.tcHocPhiTransaction.update({ transId: item.transId }, { khoanThu: updateContent.result });
                    console.log('Cập nhật cho sinh viên: ', item.customerId)
                } else {
                    console.log('Bỏ qua sinh viên: ', item.customerId)
                }
            }
            console.log('END');
        } catch (error) {
            console.error(error);
            console.log('Error: Set up thất bại');
            process.exit(1);
        }
    }
});
