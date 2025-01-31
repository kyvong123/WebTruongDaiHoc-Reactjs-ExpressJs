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
require('../../config/lib/date')(app);
require('../../config/lib/array')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.importTKBCustom.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        let dataTKB = await app.model.dtThoiKhoaBieu.getAll({ namHoc: '2022 - 2023', hocKy: 2 }, 'maHocPhan');
        let dataGroup = dataTKB.groupBy('maHocPhan'),
            modifier = '',
            timeModified = -1;

        console.log('Start import thoiKhoaBieu');

        for (let maHocPhan in dataGroup) {
            try {
                let { rows: fullData, datacahoc: dataTiet, datangayle } = await app.model.dtThoiKhoaBieu.getData(maHocPhan), dataTuan = [];
                if (fullData.every(item => item.thu && item.ngayBatDau && item.tietBatDau && item.soTietBuoi && item.thoiGianBatDau && item.thoiGianKetThuc)) {
                    dataTuan = await app.model.dtThoiKhoaBieu.generateSchedule({
                        fullData, listNgayLe: datangayle || [], dataTiet, dataTeacher: []
                    });
                }

                let dataGV = {};
                for (let eachData of fullData) {
                    const { id } = eachData;

                    let listGV = await app.model.dtThoiKhoaBieuGiangVien.getAll({ idThoiKhoaBieu: id }, 'giangVien, type');
                    const uniqueList = listGV.filter((item, index, self) => {
                        return index === self.findIndex((i) => (
                            i.giangVien === item.giangVien && i.type === item.type
                        ));
                    });
                    dataGV[id] = uniqueList;
                }

                await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan });
                if (dataTuan.length) {
                    for (let eachData of fullData) {
                        await app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: eachData.id });
                    }
                    for (let tuan of dataTuan) {
                        let { id } = tuan;
                        delete tuan.id;
                        await app.model.dtThoiKhoaBieuCustom.create({ ...tuan, isNgayLe: tuan.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: tuan.ngayBatDau, thoiGianKetThuc: tuan.ngayKetThuc, modifier, timeModified });
                        if (!tuan.isNgayLe) {
                            for (let gv of dataGV[id]) {
                                await app.model.dtThoiKhoaBieuGiangVien.create({
                                    idThoiKhoaBieu: id,
                                    giangVien: gv.giangVien,
                                    type: gv.type,
                                    ngayBatDau: tuan.ngayBatDau,
                                    ngayKetThuc: tuan.ngayKetThuc,
                                });
                            }
                        }
                    }
                }

                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`Import mã học phần: ${maHocPhan} done`);
            } catch (error) {
                console.log(`Lỗi mã học phần ${maHocPhan}`, { error });
            }
        }
        console.log('Done!');
    }
});