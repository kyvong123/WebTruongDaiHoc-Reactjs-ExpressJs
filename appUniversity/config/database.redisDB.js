module.exports = async (app, appConfig) => {
    const redis = require('redis');
    app.database.redis = app.isDebug ?
        redis.createClient({ legacyMode: true }) :
        redis.createClient({ legacyMode: true, url: `redis://:${appConfig.redisDB.auth}@${appConfig.redisDB.host}:${appConfig.redisDB.port}` });
    app.database.redis.on('connect', () => console.log(` - #${process.pid}: The Redis connection ${app.isDebug ? 'localhost' : appConfig.redisDB.host} succeeded.`));
    app.database.redis.on('error', error => console.log(` - #${process.pid}: The Redis connection failed!`, error.message));
    app.database.redis.connect();

    app.database.dkhpRedis = app.isDebug ?
        redis.createClient() :
        redis.createClient({ url: `redis://:${appConfig.redisDKHP.auth}@${appConfig.redisDKHP.host}:${appConfig.redisDKHP.port}` });
    app.database.dkhpRedis.on('connect', () => console.log(` - #${process.pid}: The DKHP Redis connection ${app.isDebug ? 'localhost' : appConfig.redisDKHP.host} succeeded.`));
    app.database.dkhpRedis.on('error', error => console.log(` - #${process.pid}: The DKHP Redis connection failed!`, error.message));
    await app.database.dkhpRedis.connect();

    app.dkhpRedis = {
        deleteAllKey: async () => {
            console.log(' - DKHP Redis: Start delete all key!');
            let allKeys = await app.database.dkhpRedis.keys('*');
            //Giữ lại keys của ctsv ban cán sự
            allKeys = allKeys.filter(item => !item.includes('ctsvBCS:'));
            await app.database.dkhpRedis.del(allKeys);
            // const listReinitCtdt = [];
            // for (let key of allKeys.filter(item => item.includes('NCTDT'))) {
            //     let mssv = key.substring(key.indexOf(':') + 1, key.indexOf('|'));
            //     if (!listReinitCtdt.includes(mssv)) {
            //         app.model.fwStudent.initCtdtRedis(mssv);
            //         listReinitCtdt.push(mssv);
            //     }
            // }

            console.log(' - DKHP Redis: Delete all key done!');
        },

        initCtdtStudentAll: async (idDot) => {
            console.log(' - DKHP Redis: Start init CTDT for students');
            let fullDataDotDk = '', sum = 0;
            if (idDot) {
                fullDataDotDk = [idDot];
            }
            else fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id', 'ngayBatDau')).map(item => item.id);
            if (fullDataDotDk.length) {
                const dataDangKySinhVien = await app.model.dtDssvTrongDotDkhp.getAll({
                    statement: 'idDot IN (:listId) AND kichHoat = 1',
                    parameter: {
                        listId: fullDataDotDk,
                    }
                });
                sum = dataDangKySinhVien?.length || 0;
                if (dataDangKySinhVien && dataDangKySinhVien.length) {
                    for (let index = 0; index < dataDangKySinhVien.length; index++) {
                        const mssv = dataDangKySinhVien[index].mssv;

                        let chuongTrinhDaoTaoResponse = await app.model.dtDangKyHocPhan.getListCtdt(JSON.stringify({ mssvFilter: mssv }));

                        let chuongTrinhDaoTao = [];

                        if (chuongTrinhDaoTaoResponse.rows.length) {
                            chuongTrinhDaoTao = chuongTrinhDaoTaoResponse.rows;
                        }

                        for (let id of fullDataDotDk) {
                            await app.database.dkhpRedis.set(`CTDT:${mssv}|${id}`, JSON.stringify(chuongTrinhDaoTao));
                        }

                        // if (index % 10 === 0) {
                        //   app.io.to('activeConfigDkhp').emit('dkhp-init-ctdt', { count, sum });
                        // }
                    }

                    // app.io.to('activeConfigDkhp').emit('dkhp-init-ctdt', { count, sum });
                }
            }
            console.log(` - DKHP Redis: Init CTDT for ${sum} students done. HeapUsed: ${process.memoryUsage().heapUsed} | HeapTotal: ${process.memoryUsage().heapTotal}`);
        },

        initConfig: async () => {
            const listKeyDiem = ['rotMon', 'caiThienMin', 'caiThienMax', 'caiThienHK'];
            await app.database.dkhpRedis.watch(listKeyDiem);
            const key = 'tkbSoLuongDuKienMax';
            let [settingTKB, settingDiem, semester] = await Promise.all([
                app.model.dtSettings.getValue(key),
                app.model.dtCauHinhDiem.getValue(...listKeyDiem),
                app.model.dtSemester.get({ active: 1 }, 'namHoc, hocKy')
            ]);
            Object.keys(settingDiem).forEach(key => {
                settingDiem[key] = settingDiem[key] ? parseFloat(settingDiem[key]) : 0;
            });
            await Promise.all([
                app.database.dkhpRedis.set('settingTKB', JSON.stringify(settingTKB)),
                app.database.dkhpRedis.set('settingDiem', JSON.stringify(settingDiem)),
                app.database.dkhpRedis.set('semester', JSON.stringify(semester))
            ]);
            await app.database.dkhpRedis.unwatch(listKeyDiem);
            console.log(' - DKHP Redis: Init config done!');
        },

        initConfigDotDky: async () => {
            const fullDataDotDk = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id, ngayKetThuc');
            for (let dotDk of fullDataDotDk) {
                let { id, ngayKetThuc } = dotDk;
                await app.database.dkhpRedis.set(`DOT:${id}`, parseInt(ngayKetThuc));
            }
            console.log(' - DKHP Redis: Init config dot dang ky done!');
        },

        initMonHoc: async () => {
            let items = await app.model.dmMonHoc.getAll({}, 'ma, ten, tongTiet, tongTinChi', 'ma');
            items = items.map(item => ({
                maMonHoc: item.ma, tenMonHoc: item.ten, tongTinChi: item.tongTinChi, tongSoTiet: item.tongTiet, loaiMonHoc: 1,
            }));
            await app.database.dkhpRedis.set('listMonHoc', JSON.stringify(items));
            console.log(' - DKHP Redis: Init mon hoc done!');
        },

        initMonHocKhongTinhPhi: async () => {
            let items = await app.model.dtDmMonHocKhongTinhPhi.getAll({}, 'maMonHoc');
            items = items.map(item => item.maMonHoc);
            await app.database.dkhpRedis.set('listMonKhongPhi', JSON.stringify(items));
            console.log(' - DKHP Redis: Init mon hoc khong tinh trung binh done!');
        },

        initDiemStudentAll: async () => {
            let fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id', 'ngayBatDau')).map(item => item.id);
            if (fullDataDotDk.length) {
                const dataDangKySinhVien = await app.model.dtDssvTrongDotDkhp.getAll({
                    statement: 'idDot IN (:listId) AND kichHoat = 1',
                    parameter: {
                        listId: fullDataDotDk,
                    }
                });
                if (dataDangKySinhVien && dataDangKySinhVien.length) {
                    for (let index = 0; index < dataDangKySinhVien.length; index++) {
                        const mssv = dataDangKySinhVien[index].mssv;
                        let data = await app.model.dtDiem.getDataByMonHoc(JSON.stringify({ mssvFilter: mssv }));
                        await app.database.dkhpRedis.set(`DIEM:${mssv}`, JSON.stringify(data.rows));
                    }
                }
            }
            console.log(' - DKHP Redis: Init diem sv done!');
        },

        initDiemStudent: async (mssv) => {
            let fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id', 'ngayBatDau')).map(item => item.id);
            if (fullDataDotDk.length) {
                let data = await app.model.dtDiem.getDataByMonHoc(JSON.stringify({ mssvFilter: mssv }));
                await app.database.dkhpRedis.set(`DIEM:${mssv}`, JSON.stringify(data.rows));
            }
            console.log(` - DKHP Redis: Init diem sv ${mssv} done!`);
        },

        initNgoaiNguAll: async () => {
            let fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1, ngoaiNgu: 1 }, 'id, namHoc, hocKy', 'ngayBatDau'));
            if (fullDataDotDk.length) {
                const { namHoc, hocKy } = fullDataDotDk[0],
                    dataDangKySinhVien = await app.model.dtDssvTrongDotDkhp.getAll({
                        statement: 'idDot IN (:listId) AND kichHoat = 1',
                        parameter: {
                            listId: fullDataDotDk.map(i => i.id),
                        }
                    });

                if (dataDangKySinhVien && dataDangKySinhVien.length) {
                    for (let index = 0; index < dataDangKySinhVien.length; index++) {
                        const mssv = dataDangKySinhVien[index].mssv;
                        let khoaSinhVien = null;

                        const stu = await app.model.fwStudent.get({ mssv }, 'lop, namTuyenSinh, loaiHinhDaoTao');

                        if (stu.lop) {
                            await app.model.dtLop.get({ maLop: stu.lop }, 'khoaSinhVien').then(item => {
                                if (item) khoaSinhVien = item.khoaSinhVien;
                            });
                        } else khoaSinhVien = stu.namTuyenSinh;

                        if (khoaSinhVien && stu.loaiHinhDaoTao) {
                            let data = await app.model.dtNgoaiNguKhongChuyen.checkTinhTrang({ mssv, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao: stu.loaiHinhDaoTao, semester: `${namHoc.substring(2, 4)}${hocKy}`, idDot: dataDangKySinhVien[index].idDot });
                            await app.database.dkhpRedis.set(`NGOAI_NGU:${mssv}`, JSON.stringify(data));
                        }
                    }
                }
            }
            console.log(' - DKHP Redis: Init ngoai ngu khong chuyen sv done!');
        },

        initNgoaiNguStudent: async (mssv) => {
            let fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1, ngoaiNgu: 1 }, 'id, namHoc, hocKy', 'ngayBatDau'));
            if (fullDataDotDk.length) {
                const { namHoc, hocKy, id } = fullDataDotDk[0];

                let khoaSinhVien = null;

                const stu = await app.model.fwStudent.get({ mssv }, 'lop, namTuyenSinh, loaiHinhDaoTao');

                if (stu.lop) {
                    await app.model.dtLop.get({ maLop: stu.lop }, 'khoaSinhVien').then(item => {
                        if (item) khoaSinhVien = item.khoaSinhVien;
                    });
                } else khoaSinhVien = stu.namTuyenSinh;

                if (khoaSinhVien && stu.loaiHinhDaoTao) {
                    let data = await app.model.dtNgoaiNguKhongChuyen.checkTinhTrang({ mssv, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao: stu.loaiHinhDaoTao, semester: `${namHoc.substring(2, 4)}${hocKy}`, idDot: id });
                    await app.database.dkhpRedis.set(`NGOAI_NGU:${mssv}`, JSON.stringify(data));
                }
            }
            console.log(` - DKHP Redis: Init ngoai ngu khong chuyen sv ${mssv} done!`);
        },

        initSiSoHocPhan: async (maHocPhan = null) => {
            // Chỉ lấy học phần cho phép đăng ký.
            // Nếu học phần khoá đăng khoá <--> dò trong Redis không thấy
            const key = 'tkbSoLuongDuKienMax';
            let settingSLDK = await app.model.dtSettings.getValue(key);

            let fullDataSiSo = await app.model.dtDangKyHocPhan.getSiSoTheoDotActive(JSON.stringify({ maHocPhan }));
            fullDataSiSo = fullDataSiSo.rows;
            for (let i = 0; i < fullDataSiSo.length; i++) {
                const hocPhan = fullDataSiSo[i],
                    { maHocPhan, siSoHienTai, soLuongDuKien, idDot } = hocPhan;
                await Promise.all([
                    app.database.dkhpRedis.set(`SiSo:${maHocPhan}|${idDot}`, parseInt(siSoHienTai)),
                    app.database.dkhpRedis.set(`SLDK:${maHocPhan}|${idDot}`, parseInt(soLuongDuKien || settingSLDK.tkbSoLuongDuKienMax))
                ]);
            }
            console.log(' - DKHP Redis: Init SiSo and SLDK done!');
        },

        updateSiSoHocPhan: async (changes) => {
            let { maHocPhan, soLuongDuKien } = changes;
            let settingSLDK = await app.model.dtSettings.getValue('tkbSoLuongDuKienMax');
            const allKeys = await app.database.dkhpRedis.keys(`SLDK:${maHocPhan}|*`);
            for (let key of allKeys) {
                await app.database.dkhpRedis.set(key, parseInt(soLuongDuKien || settingSLDK.tkbSoLuongDuKienMax));
            }
            console.log(` - DKHP Redis: Update SLDK for ${maHocPhan} done!`);
        },

        initInfoHocPhan: async (maHocPhan = null) => {
            let fullDataInfo = await app.model.dtDangKyHocPhan.getSiSoTheoDotActive(JSON.stringify({ maHocPhan }));

            fullDataInfo = fullDataInfo.rows;
            const dataGroupBy = fullDataInfo.groupBy('maHocPhan');

            for (let i = 0; i < fullDataInfo.length; i++) {
                const hocPhan = fullDataInfo[i],
                    { maHocPhan, idDot, giangVien, troGiang, listMaLop, ngayBatDau, ngayKetThuc } = hocPhan;

                let dataTeacher = JSON.stringify({
                    giangVien, troGiang, listMaLop, ngayBatDau, ngayKetThuc
                });
                if (dataGroupBy[maHocPhan].length > 1) {
                    let dataGV = dataGroupBy[maHocPhan].filter(item => item.giangVien).map(item => item.giangVien.split(',').map(i => `${item.id}_${i}`)),
                        dataTG = dataGroupBy[maHocPhan].filter(item => item.troGiang).map(item => item.troGiang.split(',').map(i => `${item.id}_${i}`));

                    dataGV = [... new Set(dataGV.flat())].toString();
                    dataTG = [... new Set(dataTG.flat())].toString();

                    dataTeacher = JSON.stringify({
                        giangVien: dataGV,
                        troGiang: dataTG,
                        listMaLop, ngayBatDau, ngayKetThuc,
                    });
                }
                await app.database.dkhpRedis.set(`infoHocPhan:${maHocPhan}|${idDot}`, dataTeacher);
            }
            if (!maHocPhan) {
                for (let key of Object.keys(fullDataInfo.groupBy('idDot'))) {
                    let dataHP = [...new Set(fullDataInfo.filter(item => item.idDot == key).map(item => item.maHocPhan))];
                    await app.database.dkhpRedis.set(`dataMaHocPhan|${key}`, JSON.stringify(dataHP));
                }
            } else {
                const list = await app.database.dkhpRedis.keys('dataMaHocPhan|*');
                for (let key of list) {
                    let currentDataHP = await app.database.dkhpRedis.get(key);
                    await app.database.dkhpRedis.set(key, JSON.stringify([...new Set([...app.utils.parse(currentDataHP, []), maHocPhan])]));
                }
            }

            console.log(` - DKHP Redis: Init InfoHocPhan ${maHocPhan + ' '}done!`);
        },

        initDataTuanHoc: async () => {
            let fullDataDotDk = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id, namHoc, hocKy'), uniqueList = [];
            if (fullDataDotDk.length) {
                for (let dot of fullDataDotDk) {
                    const { namHoc, hocKy } = dot;
                    if (!uniqueList.find(i => i.namHoc == namHoc && i.hocKy == hocKy)) {
                        uniqueList.push({ namHoc, hocKy });
                        const dataTuan = await app.model.dtThoiKhoaBieuCustom.getData('', app.utils.stringify({ namHoc, hocKy }));
                        await app.database.dkhpRedis.set(`listDataTuanHoc|${namHoc}|${hocKy}`, JSON.stringify(dataTuan.rows));
                    }
                }
            }
            console.log(' - DKHP Redis: Init data tuan hoc done!');
        },

        updateDataTuanHoc: async ({ maHocPhan, namHoc, hocKy }) => {
            if (!namHoc && !hocKy) {
                const infoTKB = await app.model.dtThoiKhoaBieu.get({ maHocPhan }, 'namHoc, hocKy');
                namHoc = infoTKB.namHoc;
                hocKy = infoTKB.hocKy;
            }

            let [currentData, dataTuan] = await Promise.all([
                app.database.dkhpRedis.get(`listDataTuanHoc|${namHoc}|${hocKy}`),
                app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({ namHoc, hocKy })),
            ]);

            currentData = JSON.parse(currentData || '[]');
            currentData = currentData.filter(i => i.maHocPhan != maHocPhan);

            await app.database.dkhpRedis.set(`listDataTuanHoc|${namHoc}|${hocKy}`, JSON.stringify([...currentData, ...dataTuan.rows]));
            console.log(` - DKHP Redis: Init data tuan hoc phan ${maHocPhan} done!`);
        },

        updateInfoHocPhan: async (listTuanHoc, maHocPhan) => {
            const allKeys = await app.database.dkhpRedis.keys(`infoHocPhan:${maHocPhan}|*`);
            let dataGV = [];
            let dataTG = [];
            for (const tuan of listTuanHoc) {
                if (tuan.giangVien?.length) {
                    for (let i = 0; i < tuan.giangVien.length; i++) {
                        let giangVien = tuan.giangVien[i];
                        dataGV.push(`${tuan.id}_${giangVien}`);
                    }
                }
                if (tuan.troGiang?.length) {
                    for (let i = 0; i < tuan.troGiang.length; i++) {
                        let troGiang = tuan.troGiang[i];
                        dataTG.push(`${tuan.id}_${troGiang}`);
                    }
                }
            }

            dataGV = [...new Set(dataGV)];
            dataTG = [...new Set(dataTG)];

            for (let key of allKeys) {
                await app.database.dkhpRedis.set(key, JSON.stringify({
                    giangVien: dataGV.toString(),
                    troGiang: dataTG.toString(),
                }));
            }
            console.log(` - DKHP Redis: Update Info for ${maHocPhan} done!`);
        },

        createDkhp: async (data) => {
            let { maHocPhan, idDot } = data, isSuccess = false;
            await app.database.dkhpRedis.watch(`SiSo:${maHocPhan}|${idDot}`);
            let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${maHocPhan}|${idDot}`).get(`SLDK:${maHocPhan}|${idDot}`).exec();
            let [siSo, soLuongDuKien] = redisQueue;
            siSo = parseInt(siSo);
            soLuongDuKien = parseInt(soLuongDuKien);

            if (siSo + 1 <= soLuongDuKien) {
                await app.database.dkhpRedis.incr(`SiSo:${maHocPhan}|${idDot}`);
                isSuccess = true;
            }
            await app.database.dkhpRedis.unwatch(`SiSo:${maHocPhan}|${idDot}`);
            return isSuccess;
        },

        updateDkhp: async (data) => {
            let { maHocPhanMoi, maHocPhanCu, idDot } = data, isSuccess = false;
            await app.database.dkhpRedis.watch(`SiSo:${maHocPhanCu}|${idDot}`);
            await app.database.dkhpRedis.watch(`SiSo:${maHocPhanMoi}|${idDot}`);
            let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${maHocPhanMoi}|${idDot}`).get(`SLDK:${maHocPhanMoi}|${idDot}`).exec();
            let [siSo, soLuongDuKien] = redisQueue;
            siSo = parseInt(siSo);
            soLuongDuKien = parseInt(soLuongDuKien);
            if (siSo + 1 <= soLuongDuKien) {
                await app.database.dkhpRedis.decr(`SiSo:${maHocPhanCu}|${idDot}`);
                await app.database.dkhpRedis.incr(`SiSo:${maHocPhanMoi}|${idDot}`);
                isSuccess = true;
            }
            await app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanCu}|${idDot}`);
            await app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanMoi}|${idDot}`);
            return isSuccess;
        },

        deleteDkhp: async (data) => {
            let { maHocPhan, idDot } = data;
            try {
                await app.database.dkhpRedis.decr(`SiSo:${maHocPhan}|${idDot}`);
                return true;
            } catch (error) {
                if (error) return false;
            }
        },

        createDkhpMultiple: async (data) => {
            let { maHocPhan } = data;
            const allKeys = await app.database.dkhpRedis.keys(`SiSo:${maHocPhan}|*`);
            for (let key of allKeys) {
                app.database.dkhpRedis.watch(key);
                let siSo = await app.model.dtDangKyHocPhan.count({ maHocPhan });
                await app.database.dkhpRedis.set(key, parseInt(siSo.rows[0]['COUNT(*)'] || 0));
                app.database.dkhpRedis.unwatch(key);
            }
        },

        updateDkhpMultiple: async (data) => {
            let { maHocPhanMoi, maHocPhanCu, soLuongDky } = data;
            const fullDataDotDk = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id');
            for (let dotDk of fullDataDotDk) {
                let idDot = dotDk.id;
                app.database.dkhpRedis.watch(`SiSo:${maHocPhanCu}|${idDot}`);
                app.database.dkhpRedis.watch(`SiSo:${maHocPhanMoi}|${idDot}`);
                let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${maHocPhanMoi}|${idDot}`).get(`SiSo:${maHocPhanCu}|${idDot}`).exec();
                let [redisHPMoi, redisHPCu] = redisQueue;
                if (redisHPMoi && redisHPCu) {
                    await Promise.all([
                        app.database.dkhpRedis.set(`SiSo:${maHocPhanCu}|${idDot}`, parseInt(redisHPCu) - parseInt(soLuongDky)),
                        app.database.dkhpRedis.set(`SiSo:${maHocPhanMoi}|${idDot}`, parseInt(redisHPMoi) + parseInt(soLuongDky)),
                    ]);
                }
                app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanCu}|${idDot}`);
                app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanMoi}|${idDot}`);
            }
        },

        updateDkhpSV: async (data) => {
            let { maHocPhanMoi, maHocPhanCu } = data;
            const fullDataDotDk = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id');
            for (let dotDk of fullDataDotDk) {
                let idDot = dotDk.id;
                app.database.dkhpRedis.watch(`SiSo:${maHocPhanCu}|${idDot}`);
                app.database.dkhpRedis.watch(`SiSo:${maHocPhanMoi}|${idDot}`);
                let redisQueue = await app.database.dkhpRedis.multi().get(`SiSo:${maHocPhanMoi}|${idDot}`).get(`SiSo:${maHocPhanCu}|${idDot}`).exec();
                let [redisHPMoi, redisHPCu] = redisQueue;
                if (redisHPMoi && redisHPCu) {
                    await Promise.all([
                        app.database.dkhpRedis.decr(`SiSo:${maHocPhanCu}|${idDot}`),
                        app.database.dkhpRedis.incr(`SiSo:${maHocPhanMoi}|${idDot}`),
                    ]);
                }
                app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanCu}|${idDot}`);
                app.database.dkhpRedis.unwatch(`SiSo:${maHocPhanMoi}|${idDot}`);
            }
        },

        deleteDkhpMultiple: async (data) => {
            let { maHocPhan, soLuongDky } = data;
            const allKeys = await app.database.dkhpRedis.keys(`SiSo:${maHocPhan}|*`);
            for (let key of allKeys) {
                app.database.dkhpRedis.watch(key);
                let siSo = await app.database.dkhpRedis.get(key);
                await app.database.dkhpRedis.set(key, parseInt(siSo) - parseInt(soLuongDky));
                app.database.dkhpRedis.unwatch(key);
            }
        },

        deleteDkhpSV: async (maHocPhan) => {
            const allKeys = await app.database.dkhpRedis.keys(`SiSo:${maHocPhan}|*`);
            for (let key of allKeys) {
                app.database.dkhpRedis.watch(key);
                await app.database.dkhpRedis.decr(key);
                app.database.dkhpRedis.unwatch(key);
            }
        },

        hotInit: async () => {
            await app.dkhpRedis.deleteAllKey();
            await Promise.all([
                app.dkhpRedis.initConfig(),
                app.dkhpRedis.initInfoHocPhan(),
                app.dkhpRedis.initSiSoHocPhan(),
                app.dkhpRedis.initConfigDotDky(),
                app.dkhpRedis.initMonHoc(),
                app.dkhpRedis.initMonHocKhongTinhPhi(),
                app.dkhpRedis.initDataTuanHoc(),
            ]);
            app.dkhpRedis.initCtdtStudentAll();
            app.dkhpRedis.initDiemStudentAll();
            app.dkhpRedis.initNgoaiNguAll();
        },

        createBanCanSuLop: async (data) => {
            const { userId, maChucVu, maLop } = data;
            const newChucVu = `${maLop}_${maChucVu}`;
            if (maChucVu == 'CN') {
                let listLop = await app.database.dkhpRedis.get(`ctsvBCS:${userId}`);
                if (listLop) {
                    listLop = JSON.parse(listLop);
                    listLop.push(`${maLop}_CN`);
                    await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, JSON.stringify(listLop));
                } else {
                    await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, JSON.stringify([`${maLop}_CN`]));
                }
            } else {
                let listChucVu = await app.database.dkhpRedis.get(`ctsvBCS:${userId}`);
                listChucVu = app.utils.parse(listChucVu ?? '[]') ?? [];
                if (listChucVu.every(chucVu => chucVu != newChucVu)) listChucVu.push(newChucVu);
                await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, app.utils.stringify(listChucVu));
            }
        },

        getBanCanSuLop: async (data, done) => {
            const { userId } = data,
                item = await app.database.dkhpRedis.get(`ctsvBCS:${userId}`);
            done && done(item);
            return item;
        },

        syncWithDb: async (userId) => {
            let listChucVu = await app.model.svQuanLyLop.getAll({ userId }).then(value => value.map(item => `${item.maLop}_${item.maChucVu}`));
            await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, app.utils.stringify(listChucVu));
        },

        deleteBanCanSuLop: async (data) => {
            const { maLop, userId, maChucVu } = data;
            if (maChucVu == 'CN') {
                let listLop = await app.database.dkhpRedis.get(`ctsvBCS:${userId}`);
                if (listLop) {
                    listLop = JSON.parse(listLop).filter(item => item != `${maLop}_CN`);
                    if (listLop.length) {
                        await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, JSON.stringify(listLop));
                    } else {
                        await app.database.dkhpRedis.del(`ctsvBCS:${userId}`);
                    }
                }
            } else {
                // await app.database.dkhpRedis.del(`ctsvBCS:${userId}`);
                let listChucVu = await app.database.dkhpRedis.get(`ctsvBCS:${userId}`);
                listChucVu = app.utils.parse(listChucVu ?? '[]') ?? [];
                listChucVu = listChucVu.filter(chucVu => chucVu != maChucVu);
                if (listChucVu.length > 1) await app.database.dkhpRedis.set(`ctsvBCS:${userId}`, app.utils.stringify(listChucVu));
                else await app.database.dkhpRedis.del(`ctsvBCS:${userId}`);
            }
        }
    };
};