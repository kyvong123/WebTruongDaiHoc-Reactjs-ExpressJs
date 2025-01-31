module.exports = app => {
    const folderGradeScan = app.path.join(app.assetPath, 'grade-scan'),
        jpgUploadedFolder = app.path.join(folderGradeScan, 'jpg-uploaded'),
        resultScannedFolder = app.path.join(folderGradeScan, 'result-scan');
    app.fs.createFolder(folderGradeScan, jpgUploadedFolder, resultScannedFolder);

    app.post('/api/dt/diem/folder-scan/start-origin', app.permission.check('dtDiemFolderScan:write'), async (req, res) => {
        try {
            let { validFiles, filter: { idFolder, idSemester }, threshold } = req.body,
                { email } = req.session.user,
                timeNow = Date.now();
            let inputFolder = app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString());
            const outputFolder = app.path.join(resultScannedFolder, idSemester.toString(), idFolder.toString());
            app.fs.createFolder(app.path.join(resultScannedFolder, idSemester.toString()), inputFolder, outputFolder);

            if (validFiles && validFiles.length) {
                app.io.to('GradeScan').emit('grade-scan-start', { total: validFiles.length, requester: email, idFolder, idSemester });
                for (let [index, item] of validFiles.entries()) {
                    const { id: idResult } = await app.model.dtDiemScanResult.create({ requestTime: timeNow, idSemester, idFolder, scanStatus: -1, filename: item.name });
                    // console.log('Send to gradeScanExecute: ', {
                    //     imagePath: app.path.join(inputFolder, item.name),
                    //     outputPath: app.path.join(outputFolder, `${idResult}.jpg`),
                    //     filename: item.name,
                    //     threshold,
                    //     socketEmit: 'grade-scan-result',
                    //     requestTime: timeNow, requester: email, idResult, idSemester, idFolder
                    // });
                    app.messageQueue.send('gradeScanExcecute', JSON.stringify({
                        imagePath: app.path.join(inputFolder, item.name),
                        outputPath: app.path.join(outputFolder, `${idResult}.jpg`),
                        filename: item.name,
                        threshold, isSendSocket: (index % 5 == 0), isDone: index == validFiles.length - 1,
                        socketEmit: 'grade-scan-result',
                        requestTime: timeNow, requester: email, idResult, idSemester, idFolder
                    }));
                }
            } else {
                app.io.to('GradeScan').emit('grade-scan-start', { error: 'None of files is valid!', requester: email, idFolder, idSemester });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/folder-scan/start-rescan', app.permission.check('dtDiemFolderScan:write'), async (req, res) => {
        try {
            let { id, idSemester, idFolder, idResult, threshold } = req.body;
            id = Number(id);
            let sheetCode = ('0000000' + id.toString()).slice(-7);
            let [checkItem, checkResult] = await Promise.all([
                app.model.dtDiemScanFile.searchPage(JSON.stringify({ idSemester, ks_id: id })),
                app.model.dtDiemScanResult.get({ id: idResult }),
            ]);
            checkItem = checkItem.rows[0];
            if (!checkItem || !checkResult) {
                res.send({ error: 'Không tìm thấy ID bảng điểm phù hợp!' });
            } else {
                await app.model.dtDiemScanResult.update({ id: idResult }, { sheetCode, idFolder });
                let { stuIdIndex, tpHocPhan, tpMonHoc, configDefault, kyThi } = checkItem,
                    { filename } = checkResult,
                    { email: requester } = req.session.user;
                stuIdIndex = JSON.parse(stuIdIndex);
                let inputFolder = app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString());
                const outputFolder = app.path.join(resultScannedFolder, idSemester.toString(), idFolder.toString());
                app.fs.createFolder(app.path.join(resultScannedFolder, idSemester.toString()), inputFolder, outputFolder);
                app.messageQueue.send('gradeScanExcecute', JSON.stringify({
                    imagePath: app.path.join(inputFolder, filename),
                    outputPath: app.path.join(outputFolder, `${idResult}.jpg`),
                    id: sheetCode, filename,
                    threshold, isSendSocket: true, isDone: true,
                    socketEmit: 'grade-rescan-result',
                    requestTime: Date.now(), requester,
                    idResult, idSemester, idFolder
                }));

                let dataStudent = await app.model.fwStudent.getAll({
                    statement: 'mssv IN (:listMssv)',
                    parameter: {
                        listMssv: Object.values(stuIdIndex)
                    }
                }, 'mssv,ho,ten');

                let tpDiem = tpHocPhan || tpMonHoc || configDefault;
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];

                let { phanTram: phanTramDiem, loaiLamTron } = tpDiem.find(tp => tp.thanhPhan == kyThi) || { phanTram: '0', loaiLamTron: '0.5' };
                res.send({ item: { ...checkItem, phanTramDiem, loaiLamTron, data: dataStudent.map(item => ({ ...item, indexInFile: Object.keys(stuIdIndex).find(key => stuIdIndex[key] == item.mssv) })) } });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.readyHooks.add('addSocketListener:ListenResultGradeScan', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('GradeScan', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDiemScan:manage')) {
                socket.join('GradeScan');
                socket.join('SaveScanDiemSinhVien');
            }
        }),
    });

    app.readyHooks.add('Cosume data scan', {
        ready: () => app.messageQueue.connection,
        run: () => {
            const resultDescription = {
                0: 'Scan thành công',
                1: 'Scan thất bại',
                2: 'Lỗi hệ thống',
                3: 'ID không tồn tại trong học kỳ'
            };
            app.messageQueue.consume('gradeScanResult', async msg => {
                // console.log(msg);
                let result = JSON.parse(msg);
                let { requestTime, responseTime,
                    data: { sheetCode, grades },
                    requestParams: { id, requester, idResult, idSemester, idFolder, filename, socketEmit, isSendSocket, isDone },
                    errorCode } = result;
                let scanStatus = errorCode, dataRescan = [];
                sheetCode = id || sheetCode;
                try {
                    if (!sheetCode || sheetCode.length > 7 || isNaN(Number(sheetCode)) || !grades) scanStatus = 1;
                    else {
                        const checkSheetCode = await app.model.dtDiemScanFile.get({ id: Number(sheetCode), idSemester });
                        if (!checkSheetCode) scanStatus = 3;
                        else {
                            let item = await app.model.dtDiemScanFile.update({ id: Number(sheetCode), idSemester }, { idFolder }),
                                { stuIdIndex, kyThi } = item;
                            stuIdIndex = JSON.parse(stuIdIndex);

                            for (let i = 0; i < Object.keys(stuIdIndex).length; i++) {
                                let { isMissed, grade, error } = grades[i] || { isMissed: '', grade: '', error: 'Lỗi không nhận diện được' },
                                    [indexInFile, mssv] = Object.entries(stuIdIndex)[i];
                                if (error) scanStatus = 1;
                                let dataEachStudent = { mssv, idFolder, idSemester, indexInFile, idFile: sheetCode, isMissed: isMissed ? 1 : 0, grade: grade || '', idResult, kyThi };
                                if (socketEmit == 'grade-rescan-result') dataRescan.push(dataEachStudent);
                                let isExist = await app.model.dtDiemScanGradeResult.get({ mssv, idFile: sheetCode, idResult, idFolder });
                                if (isExist) {
                                    await app.model.dtDiemScanGradeResult.update({ mssv, idFile: sheetCode, idResult, idFolder }, { isMissed: isMissed ? 1 : 0, grade: grade || '', kyThi });
                                } else {
                                    await app.model.dtDiemScanGradeResult.create(dataEachStudent);
                                }
                            }

                            if (socketEmit == 'grade-rescan-result') {
                                await app.model.dtDiemScanGradeResult.delete({
                                    statement: 'idFile != :sheetCode AND idFolder = :idFolder AND idResult = :idResult',
                                    parameter: { sheetCode, idFolder, idResult }
                                });
                                dataRescan = (await app.model.dtDiemScanResult.searchPage(JSON.stringify({ idResult, idSemester, idFolder, listSV: dataRescan.map(i => i.mssv).toString() }))).rows;
                            }
                        }
                    }
                } catch (error) {
                    scanStatus = 1;
                }
                result = { sheetCode, grades: JSON.stringify(grades), scanStatus, requestTime, responseTime: parseInt(responseTime), scanResult: resultDescription[scanStatus] };
                await app.model.dtDiemScanResult.update({ id: idResult }, result);
                (isSendSocket || isDone) && app.io.to('GradeScan').emit(socketEmit, { requester, idSemester, idFolder, sheetCode, filename, scanResult: resultDescription[scanStatus], dataRescan, idResult, isDone });
            });
        }
    });

    app.post('/api/dt/diem/folder-scan/scan-save', app.permission.check('dtDiemFolderScan:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let userModified = req.session.user.email,
                timeModified = Date.now();
            for (let [index, item] of data.entries()) {
                let { maHocPhan, maMonHoc, namHoc, hocKy, data: dataDiemSV, loaiDiem, phanTramDiem, idSemester, idFolder } = item,
                    timeSaved = Date.now(),
                    isLock = 1,
                    timeLock = timeModified;

                dataDiemSV = app.utils.parse(dataDiemSV || '[]');

                const configTpDiem = await app.model.dtDinhChiThi.getInfoDinhChi(maHocPhan, loaiDiem);

                if (!configTpDiem || configTpDiem.phanTram == null || configTpDiem.phanTram == '0') continue;
                phanTramDiem = configTpDiem.phanTram;

                for (let sv of dataDiemSV) {
                    let { mssv, diem, diemDacBiet, idResult, isMissed, grade = '', idDinhChi } = sv,
                        sumeData = { maHocPhan, maMonHoc, namHoc, hocKy };

                    const [infoDinhChi, isDangKy] = await Promise.all([
                        idDinhChi && app.model.dtDinhChiThi.get({ id: idDinhChi }),
                        app.model.dtDangKyHocPhan.get({ mssv, ...sumeData }),
                    ]);

                    if (idDinhChi) {
                        sumeData.maHocPhan = infoDinhChi.maHocPhan;
                        sumeData.namHoc = infoDinhChi.namHoc;
                        sumeData.hocKy = infoDinhChi.hocKy;

                        const configTpDiem = await app.model.dtDinhChiThi.getInfoDinhChi(sumeData.maHocPhan, loaiDiem);

                        if (!configTpDiem || configTpDiem.phanTram == null || configTpDiem.phanTram == '0') continue;
                        phanTramDiem = configTpDiem.phanTram;
                    } else if (!isDangKy) continue;

                    let isExist = await app.model.dtDiemAll.get({ mssv, ...sumeData, loaiDiem }), oldDiem = '';
                    if (isExist) {
                        oldDiem = isExist.diem;
                        await app.model.dtDiemAll.update({ mssv, ...sumeData, loaiDiem, phanTramDiem }, { diem, diemDacBiet, isLock, timeLock });
                    } else {
                        await app.model.dtDiemAll.create({ mssv, ...sumeData, loaiDiem, phanTramDiem, diem, diemDacBiet, isLock, timeLock });
                    }

                    await app.model.dtDiemHistory.create({ mssv, userModified, timeModified, ...sumeData, loaiDiem, phanTramDiem, oldDiem, newDiem: diem, diemDacBiet, hinhThucGhi: 1 });

                    const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK({ mssv, ...sumeData });

                    if (isTK) {
                        await app.model.dtDiemAll.update({ mssv, ...sumeData, loaiDiem: 'TK' }, { diem: sumDiem });
                    } else {
                        await app.model.dtDiemAll.create({ mssv, ...sumeData, loaiDiem: 'TK', diem: sumDiem });
                    }
                    await app.model.dtDiemScanGradeResult.update({ mssv, idFolder, idSemester, idResult }, { timeSaved, isMissed, grade });
                    app.dkhpRedis.initDiemStudent(mssv);
                }
                (index % 5 == 0 || index == data.length - 1) && app.io.to('SaveScanDiemSinhVien').emit('save-scan-diem-sinh-vien', { requester: req.session.user.email, idSemester, idFolder, maHocPhan, isDone: index == data.length - 1 });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send(error);
        }
    });

    app.delete('/api/dt/diem-scan-grade-result/delete-data', app.permission.check('dtDiemFolderScan:write'), async (req, res) => {
        try {
            const { idResult } = req.body;
            await Promise.all([
                app.model.dtDiemScanResult.update({ id: req.body.idResult }, { scanStatus: '1', scanResult: 'Scan thất bại' }),
                app.model.dtDiemScanGradeResult.delete({ idResult })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
