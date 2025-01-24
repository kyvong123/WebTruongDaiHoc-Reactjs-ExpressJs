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

function extractData(data, startStr, endStr) {
    var startIndex, endIndex, text = '';
    startIndex = data.indexOf(startStr);
    if (startIndex != -1) {
        startIndex += startStr.length;
        text = data.substring(startIndex);
        if (endStr) {
            endIndex = text.indexOf(endStr);
            if (endIndex != -1) {
                text = text.substring(0, endIndex);
            } else {
                text = '';
            }
        }
    }
    return text;
}

app.readyHooks.add('Run tool.importUnitStaff.js', {
    ready: () => app.database.oracle.connected && app.model.qtHopDongLaoDong && app.model.tccbPhanTramHuong,
    run: async () => {
        try {
            const listHopDong = await app.model.qtHopDongLaoDong.getAll();
            const listPhanTramHuong = await app.model.tccbPhanTramHuong.getAll();
            for (let hopDongItem of listHopDong) {
                if (!listPhanTramHuong.find(phanTramHuongItem => phanTramHuongItem.soHopDong == hopDongItem.soHopDong)) {
                    let pthItem = hopDongItem.phanTramHuong;
                    if (pthItem != null) {
                        const soHopDong = hopDongItem.soHopDong;
                        const loaiHopDong = 'Hợp đồng lao động';
                        const phanTramHuong = extractData(pthItem, '(Hưởng ', '% lương =');
                        if (pthItem.length <= 25) {
                            const heSoThuc = extractData(pthItem, 'lương = ', ')');
                            const { batDauLamViec: ngayBatDau, ketThucHopDong: ngayKetThuc } = hopDongItem;
                            await app.model.tccbPhanTramHuong.create({ soHopDong, loaiHopDong, phanTramHuong, heSoThuc, ngayBatDau, ngayKetThuc }, null);
                        } else {
                            const heSoThuc1 = extractData(pthItem, 'lương = ', ' đến ngày');
                            const ngayKetThucStr1 = extractData(pthItem, 'đến ngày ', '; từ ngày').split('/');
                            const ngayKetThuc1 = Date.parse(ngayKetThucStr1[1] + '/' + ngayKetThucStr1[0] + '/' + ngayKetThucStr1[2]);
                            const ngayBatDauStr2 = extractData(pthItem, 'từ ngày ', ' được hưởng').split('/');
                            const ngayBatDau2 = Date.parse(ngayBatDauStr2[1] + '/' + ngayBatDauStr2[0] + '/' + ngayBatDauStr2[2]);
                            const phanTramHuong2 = extractData(pthItem, 'được hưởng ', '% lương)');
                            const { batDauLamViec: ngayBatDau1, ketThucHopDong: ngayKetThuc2, heSo: heSoThuc2 } = hopDongItem;
                            await app.model.tccbPhanTramHuong.create({ soHopDong, loaiHopDong, phanTramHuong, heSoThuc: heSoThuc1, ngayBatDau: ngayBatDau1, ngayKetThuc: ngayKetThuc1 }, null);
                            await app.model.tccbPhanTramHuong.create({ soHopDong, loaiHopDong, phanTramHuong: phanTramHuong2, heSoThuc: heSoThuc2, ngayBatDau: ngayBatDau2, ngayKetThuc: ngayKetThuc2 }, null);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Error: Set up that bai', error);
            process.exit(1);
        }
    }
})
