const { stringify } = require('querystring');
let package = require('../../package.json');
const path = require('path');
const { list } = require('pm2');
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

app.readyHooks.add('Run tool.fixMaLoaiDangKy.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        try {
            console.log('Start fix ma loai dang ky');
            const fixDangKy = [];
            let listSinhVien = (await app.model.dtDangKyHocPhan.getListStudent(JSON.stringify({ namHoc: '2022 - 2023', hocKy: 1 }))).rows;
            if (listSinhVien.length) {
                const chunks = listSinhVien.chunk(100);
                for (const chunk of chunks) {
                    await Promise.all(chunk.map((async sinhVien => {
                        console.log('processing ' + sinhVien.mssv);
                        let listDangKy = await app.model.dtDangKyHocPhan.getAll({ mssv: sinhVien.mssv, namHoc: '2022 - 2023', hocKy: 1 });
                        if (listDangKy.length) {
                            for (let dangKy of listDangKy) {
                                let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: dangKy.maHocPhan }, 'id, maHocPhan, maMonHoc, namHoc, hocKy');
                                if (hocPhan) {
                                    let listLop = await app.model.dtThoiKhoaBieuNganh.getAll({ idThoiKhoaBieu: hocPhan.id }),
                                        maLoaiDky = null,
                                        loaiMonHoc = 1;

                                    if (listLop.length) {
                                        listLop = listLop.map(e => e.idNganh);
                                        if (listLop.includes(sinhVien.lop)) {
                                            let listCTDT = await app.model.dtDangKyHocPhan.getListCtdt(app.utils.stringify({ mssvFilter: sinhVien.mssv }));
                                            listCTDT = listCTDT.rows;
                                            if (listCTDT.length) {
                                                listCTDT = listCTDT.filter(ctdt => ctdt.maMonHoc == hocPhan.maMonHoc);
                                                if (listCTDT.length == 1) {
                                                    let monCTDT = listCTDT[0];
                                                    loaiMonHoc = monCTDT.loaiMonHoc;
                                                    if (parseInt(monCTDT.namHocDuKien) == parseInt(hocPhan.namHoc) && monCTDT.hocKyDuKien == hocPhan.hocKy) {
                                                        maLoaiDky = 'KH';
                                                    } else if ((parseInt(monCTDT.namHocDuKien) == parseInt(hocPhan.namHoc) && monCTDT.hocKyDuKien > hocPhan.hocKy)
                                                        || (parseInt(monCTDT.namHocDuKien) > parseInt(hocPhan.namHoc))) {
                                                        maLoaiDky = 'HV';
                                                    } else maLoaiDky = 'NKH';
                                                } else maLoaiDky = 'NCTDT';
                                            } else maLoaiDky = 'NCTDT';
                                        } else maLoaiDky = 'NCTDT';
                                    } else maLoaiDky = 'NCTDT';

                                    let list = (await app.model.dtDangKyHocPhan.checkDiem(app.utils.stringify({ mssv: sinhVien.mssv, maMonHoc: hocPhan.maMonHoc }))).rows;
                                    if (list.length) {
                                        let listDiemCheck = [];
                                        list = list.filter(e => e.maHocPhan != hocPhan.maHocPhan);
                                        for (let diem of list) {
                                            if ((hocPhan.namHoc == diem.namHoc && hocPhan.hocKy > diem.hocKy) || hocPhan.namHoc > diem.namHoc) {
                                                let soHK = (parseInt(hocPhan.namHoc) - parseInt(diem.namHoc)) * 2 + parseInt(hocPhan.hocKy) - parseInt(diem.hocKy);
                                                if (diem.hocKy == 3) soHK = soHK + 1;
                                                if (hocPhan.hocKy == 3) soHK = soHK - 1;
                                                let data = { soHocKy: soHK, diem: null };
                                                if (diem.diem != null) data.diem = parseFloat(diem.diem);
                                                listDiemCheck.push(data);
                                            }
                                        }

                                        if (listDiemCheck.length) {
                                            let diemMax = [], soHocKyMin = [];
                                            listDiemCheck.forEach(e => {
                                                diemMax.push(e.diem);
                                                soHocKyMin.push(e.soHocKy);
                                            });
                                            diemMax = Math.max.apply(null, diemMax);
                                            soHocKyMin = Math.min.apply(null, soHocKyMin);

                                            let diemLasted = 0;
                                            for (let diem of listDiemCheck) {
                                                if (diem.soHocKy == soHocKyMin) {
                                                    if (diem.diem == null) diemLasted = null;
                                                    else if (diemLasted != null && diemLasted < diem.diem) diemLasted = diem.diem;
                                                }
                                            }

                                            if (diemLasted == null) { //Khong du dieu kien hoc lai
                                                maLoaiDky = 'HL';

                                            } else {
                                                let chDiem = await app.model.dtCauHinhDiem.getAll(),
                                                    chDiemRot = parseFloat((chDiem.filter(e => e.key == 'rotMon'))[0].value),
                                                    chDiemCtMin = parseFloat((chDiem.filter(e => e.key == 'caiThienMin'))[0].value),
                                                    chDiemCtMax = parseFloat((chDiem.filter(e => e.key == 'caiThienMax'))[0].value),
                                                    caiThienHK = parseFloat((chDiem.filter(e => e.key == 'caiThienHK'))[0].value);

                                                if (diemMax < chDiemRot) maLoaiDky = 'HL'; //Du dieu kien hoc lai
                                                else if (chDiemCtMin <= diemMax && diemMax < chDiemCtMax) { //Du dieu kien hoc cai thien ve diem
                                                    if (soHocKyMin > caiThienHK) { //Khong du dieu kien hoc cai thien ve hoc ky
                                                        maLoaiDky = 'CT';

                                                    } else maLoaiDky = 'CT';
                                                } else { //Khong du dieu kien hoc cai thien ve diem
                                                    maLoaiDky = 'CT';

                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    })));
                }
            }



            fixDangKy.length && app.fs.writeFileSync(app.path.join(app.assetPath, 'tool', 'fixDangKy.json'), JSON.stringify(fixDangKy));
            console.log('Fix ma done!');
        } catch (error) {
            console.error(error);
            console.log('Error: Set up that bai');
            process.exit(1);
        }
    }
});