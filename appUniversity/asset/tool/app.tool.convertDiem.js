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
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.convertDiem.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        console.log('Start convert diem');
        let dataDiemAll = await app.model.dtDiem.getAll({});

        for (let diem of dataDiemAll) {
            try {
                let { mssv, maHocPhan, namHoc, hocKy, maMonHoc, diemGk = '', diemTk = '', diemCk = '', phanTramDiemCk, phanTramDiemGk, ghiChu = '', id } = diem;
                let diemDacBiet = '';
                if (diemGk == -1.00) {
                    diemGk = '0.00';
                }

                if (diemCk == 'VT') {
                    diemDacBiet = 'VT';
                    diemCk = '0.00';
                } else if (diemCk == 'I') {
                    diemDacBiet = 'I';
                    diemCk = '';
                }

                if (phanTramDiemGk != 0) {
                    let isGK = await app.model.dtDiemAll.get({ mssv, maHocPhan, loaiDiem: 'GK' });
                    if (isGK) {
                        await app.model.dtDiemAll.update({ mssv, maHocPhan, loaiDiem: 'GK' }, { namHoc, hocKy, maMonHoc, diem: diemGk, phanTramDiem: phanTramDiemGk });
                    } else {
                        await app.model.dtDiemAll.create({ mssv, maHocPhan, namHoc, hocKy, maMonHoc, diem: diemGk, phanTramDiem: phanTramDiemGk, loaiDiem: 'GK' });
                        await app.model.dtDiemHistory.create({ mssv, maHocPhan, namHoc, hocKy, userModified: 'an.le', timeModified: Date.now(), loaiDiem: 'GK', oldDiem: '', newDiem: diemGk, hinhThuGhi: 4 });
                    }
                }

                let isCK = await app.model.dtDiemAll.get({ mssv, maHocPhan, loaiDiem: 'CK' });
                if (isCK) {
                    await app.model.dtDiemAll.update({ mssv, maHocPhan, loaiDiem: 'CK' }, { namHoc, hocKy, maMonHoc, diem: diemCk, phanTramDiem: phanTramDiemCk });
                } else {
                    await app.model.dtDiemAll.create({ mssv, maHocPhan, namHoc, hocKy, maMonHoc, diem: diemCk, phanTramDiem: phanTramDiemCk, loaiDiem: 'CK', diemDacBiet });
                    await app.model.dtDiemHistory.create({ mssv, maHocPhan, namHoc, hocKy, userModified: 'an.le', timeModified: Date.now(), loaiDiem: 'CK', diemDacBiet, oldDiem: '', newDiem: diemCk, hinhThuGhi: 4 });
                }

                let isTK = await app.model.dtDiemAll.get({ mssv, maHocPhan, loaiDiem: 'TK' });
                if (isTK) {
                    await app.model.dtDiemAll.update({ mssv, maHocPhan, loaiDiem: 'TK' }, { namHoc, hocKy, maMonHoc, diem: diemTk });
                } else {
                    await app.model.dtDiemAll.create({ mssv, maHocPhan, namHoc, hocKy, maMonHoc, diem: diemTk, loaiDiem: 'TK' });
                }

                ghiChu && await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, timeModified: Date.now(), userModified: 'an.le' });
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`Convert id: ${id} done`);
            } catch (error) {
                console.log(`Convert id: ${id} error: `, error);
            }
        }
        console.log('Convert diem done!');
    }
});