module.exports = app => {
    const folderGradeScan = app.path.join(app.assetPath, 'grade-scan'),
        zipToPrintFolder = app.path.join(folderGradeScan, 'print');
    app.fs.createFolder(folderGradeScan, zipToPrintFolder);

    const kyThiMapper = {
        'DS': 'DANH SÁCH LỚP',
        'CK': 'ĐIỂM THI CUỐI KỲ',
        'GK': 'ĐIỂM THI GIỮA KỲ',
    }, tenKyThiMapper = {
        'DS': '',
        'CK': 'Tỷ lệ cuối kỳ:',
        'GK': 'Tỷ lệ giữa kỳ:',
    };

    app.readyHooks.add('addSocketListener:ListenResultExportScan', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ExportScan', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtDiem:write') && socket.join('ExportScan');
        }),
    });

    app.get('/api/dt/diem/export-scan', app.permission.orCheck('dtDiem:export', 'dtExam:export'), async (req, res) => {
        let { listMaHocPhan, namHocHocPhi, hocKyHocPhi, kyThi, printMode, isThi, studentListMode, listStudentMode, tabId } = {},
            // exportWord = 0,
            dataHocPhan = [], dataSinhVien = [], userPrint = req.session.user.email, dataToPrint = [];
        let printTime = new Date();
        const outputFolder = app.path.join(zipToPrintFolder, `${printTime.getTime()}`);
        app.fs.createFolder(outputFolder);
        try {
            let query = req.query.data;
            listMaHocPhan = query.listMaHocPhan;
            namHocHocPhi = query.namHocHocPhi;
            hocKyHocPhi = query.hocKyHocPhi;
            kyThi = query.kyThi;
            printMode = query.printMode;
            isThi = query.isThi == 'true';
            studentListMode = query.studentListMode;
            listStudentMode = query.listStudentMode;
            tabId = query.tabId;
            let [dataAll] = await Promise.all([
                app.model.dtDiem.getDataThi(JSON.stringify({ listMaHocPhan: listMaHocPhan.toString(), kyThi, namHocHocPhi, hocKyHocPhi, isThi: kyThi == 'DS' ? '0' : Number(isThi) }))
            ]);
            dataHocPhan = dataAll.rows;
            dataSinhVien = dataAll.datasinhvien;
            res.end();
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            app.io.to('ExportScan').emit('export-scan-error', { userPrint, error });
            return res.send({ error });
        }
        try {
            for (let i = 0; i < dataHocPhan.length; i++) {
                let hocPhan = dataHocPhan[i], page = 0;

                let data = { ...hocPhan, studentListMode, printMode, kyThi };

                data.tenMonHoc = data.tenMonHoc ? JSON.parse(data.tenMonHoc).vi : '';
                data.nhom = data.maHocPhan.slice(-2);
                data.giangVien = data.giangVien || '';
                data.tinChi = data.tinChi || '';
                data.tenHe = data.tenHe || '';
                let dataSinhVienHocPhan = dataSinhVien.filter(item => item.maHocPhan == data.maHocPhan).map(item => {
                    item.R = parseInt(item.R);
                    item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                    item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                    item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                    item.lop = item.lop ? item.lop.toUpperCase() : '';
                    return item;
                }).sort((a, b) => a.R - b.R ? 0 : -1);
                let listStudent = Array.from(dataSinhVienHocPhan);
                const get2 = (x) => ('0' + x).slice(-2);

                if (kyThi == 'DS') {
                    dataToPrint.push({ ...data, a: dataSinhVienHocPhan, dd: get2(printTime.getDate()), mm: get2(printTime.getMonth() + 1), yyyy: printTime.getFullYear() });
                } else {
                    data.buoi = data.buoi ? JSON.parse(data.buoi).map(item => {
                        ['thu', 'tgbd', 'tgkt', 'phong'].forEach(key => {
                            if (!item[key]) item[key] = '';
                            else {
                                if (key == 'thu') item[key] = `Thứ ${item[key]},`;
                                else if (key == 'tgbd') item[key] = `${item[key]} - `;
                                else if (key == 'tgkt') item[key] = `${item[key]}, `;
                            }
                        });
                        return item;
                    }) : [{ thu: '', tgbd: '', tgkt: '', phong: '' }];

                    data.ngayBatDau = data.ngayBatDau ? app.date.dateTimeFormat(new Date(data.ngayBatDau), 'dd/mm/yyyy') : '';
                    data.ngayKetThuc = data.ngayKetThuc ? app.date.dateTimeFormat(new Date(data.ngayKetThuc), 'dd/mm/yyyy') : '';
                    if (data.ngayBatDau && data.ngayKetThuc) data.ngayBatDau = `${data.ngayBatDau} - `;
                    data.tenKyThi = tenKyThiMapper[kyThi] ? tenKyThiMapper[kyThi] : '';

                    let lichThi = data.lichThi ? JSON.parse(data.lichThi).filter(item => item.kyThi == kyThi) : [];
                    data.titleThi = kyThiMapper[kyThi];

                    let { tpHocPhan, tpMonHoc, tpMacDinh } = data;
                    let percent = JSON.parse(tpHocPhan || tpMonHoc || tpMacDinh);
                    data.tyLeDiem = tenKyThiMapper[kyThi] ? `${percent && percent[kyThi] != null ? percent[kyThi] : 0}%` : '';

                    if (listStudentMode[data.maHocPhan] == '2') {
                        listStudent = listStudent.filter(item => item.congNo);
                    }
                    if (isThi && lichThi.length) {
                        let listIdExam = lichThi.map(item => item.idExam);
                        listStudent = listStudent.filter(item => item.idExam && listIdExam.includes(item.idExam));
                        let dataGroupBy = listStudent.groupBy('idExam');
                        for (let idExam of Object.keys(dataGroupBy)) {
                            let { batDau, ketThuc, phong } = lichThi.find(item => item.idExam == idExam),
                                listStudentExam = listStudent.filter(item => item.idExam == idExam);
                            listStudentExam = listStudentExam.map((item, index) => ({ ...item, R: index + 1 }));
                            page = 0;
                            while (listStudentExam.length) {
                                page = page + 1;
                                let dataStudent = listStudentExam.splice(0, 28);
                                let stuIdIndex = dataStudent.reduce((pre, cur) => ({ ...pre, [cur.R]: cur.mssv }), {});
                                dataToPrint.push({
                                    ...data, stuIdIndex: JSON.stringify(stuIdIndex), page, quantity: dataStudent.length, userPrint, idExam,
                                    ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
                                    gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
                                    phongThi: phong, a: dataStudent
                                });
                            }
                            dataToPrint = dataToPrint.map(data => {
                                return data.idExam == idExam ? { ...data, pageTotal: page } : data;
                            });
                        }
                    } else {
                        if (studentListMode == '1') {

                            let listHoanThi = await app.model.dtDinhChiThi.getInfoSV(app.utils.stringify({ maHocPhanThi: data.maHocPhan, kyThi, namHocHocPhi, hocKyHocPhi }));

                            listHoanThi = listHoanThi.rows.filter(i => listStudentMode[data.maHocPhan] == '2' ? i.congNo : true).map(item => {
                                item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                                item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                                item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                                item.lop = item.lop ? item.lop.toUpperCase() : '';
                                return item;
                            });

                            listStudent.push(...listHoanThi);

                            listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);
                            listStudent = listStudent.map((item, index) => ({ ...item, R: index + 1 }));

                            while (listStudent.length) {
                                page = page + 1;
                                let dataStudent = listStudent.splice(0, 28);
                                for (let sv of dataStudent) {
                                    !sv.idDinhChi && await app.model.dtDangKyHocPhan.update({ mssv: sv.mssv, maHocPhan: sv.maHocPhan }, { isBoSung: 0 });
                                }
                                let stuIdIndex = dataStudent.reduce((pre, cur) => ({ ...pre, [cur.R]: cur.mssv }), {});
                                dataToPrint.push({ ...data, stuIdIndex: JSON.stringify(stuIdIndex), page, quantity: dataStudent.length, userPrint, ngayThi: '', phongThi: '', gioThi: '', a: dataStudent });
                            }
                        } else if (studentListMode == '2') {
                            listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);
                            listStudent = listStudent.map((item, index) => ({ ...item, R: index + 1 }));

                            let listStudentBoSung = listStudent.groupBy('isBoSung'),
                                keyBoSung = Object.keys(listStudentBoSung),
                                maxBoSungIdx = listStudent.reduce((acc, shot) => acc = acc > shot.isBoSung ? acc : shot.isBoSung, 0);
                            for (let index of keyBoSung) {
                                let list = listStudentBoSung[index];
                                if (index == 'null') {
                                    for (let sv of list) {
                                        await app.model.dtDangKyHocPhan.update({ mssv: sv.mssv, maHocPhan: sv.maHocPhan }, { isBoSung: maxBoSungIdx + 1 });
                                    }
                                }
                                list = list.map((item, index) => ({ ...item, R: index + 1 }));
                                list = list.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);
                                while (list.length) {
                                    page = page + 1;
                                    let dataStudent = list.splice(0, 28);
                                    let stuIdIndex = dataStudent.reduce((pre, cur) => ({ ...pre, [cur.R]: cur.mssv }), {});
                                    dataToPrint.push({
                                        ...data, stuIdIndex: JSON.stringify(stuIdIndex), page, quantity: dataStudent.length, userPrint,
                                        ngayThi: '', phongThi: '', gioThi: '', a: dataStudent
                                    });
                                }
                            }
                        }
                        dataToPrint = dataToPrint.map(data => {
                            return data.maHocPhan == hocPhan.maHocPhan ? { ...data, pageTotal: page } : data;
                        });
                    }
                }
            }
            if (kyThi == 'DS') {
                const source = app.path.join(__dirname, '../resource', 'FormDS.docx');
                let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data })
                    .then(buf => {
                        let filepath = app.path.join(outputFolder, `${data.maHocPhan}.docx`);
                        app.fs.writeFileSync(filepath, buf);
                        return filepath;
                    })
                ));
                let mergedPath = app.path.join(zipToPrintFolder, `output_${printTime.getTime()}.pdf`);
                await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
                app.io.to('ExportScan').emit(mergedPath ? 'export-scan-done' : 'export-scan-error', { mergedPath, userPrint, tabId });
                app.fs.deleteFolder(outputFolder);
            } else {
                dataToPrint = dataToPrint.map((item, index) => ({
                    ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
                }));
                let dataToCreate = dataToPrint.map(({ maHocPhan, userPrint, stuIdIndex, idSemester, idFolder, idExam, printMode, kyThi, studentListMode, quantity, printTimeId }) => ({ maHocPhan, userPrint, stuIdIndex, idSemester, idFolder, idExam, printMode, kyThi, studentListMode, quantity, printTimeId }));
                const result = await app.model.dtDiemScanFile.insertData(JSON.stringify(dataToCreate));
                if (result && result.outBinds.ret) {
                    if (result.outBinds.ret == 'DONE') {
                        // Get id of page
                        const listId = await app.model.dtDiemScanFile.getAll({
                            statement: 'userPrint = :userPrint AND printTime IN (:listPrintTimeId) AND maHocPhan IN (:listMaHocPhan)',
                            parameter: {
                                userPrint, listPrintTimeId: dataToCreate.map(item => item.printTimeId), listMaHocPhan: dataToCreate.map(item => item.maHocPhan)
                            }
                        }, 'id,printTime', 'printTime ASC');
                        if (listId.length != dataToCreate.length) {
                            // throw error
                            console.error('GET /api/dt/diem/export-scan', { error: 'Get unvalid files' });
                            app.io.to('ExportScan').emit('export-scan-error', { userPrint });
                        } else {
                            dataToPrint = dataToPrint.map(item => ({ ...item, id: listId.find(ele => ele.printTime == item.printTimeId).id })).map(item => ({ ...setUpNumberImg(item) }));

                            const source = app.path.join(__dirname, '../resource', 'FormScan.docx');
                            let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFileHasImage(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') }, [16, 16])
                                .then(buf => {
                                    let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.id}.docx`);
                                    app.fs.writeFileSync(filepath, buf);
                                    return filepath;
                                })
                            ));
                            let mergedPath = app.path.join(zipToPrintFolder, `output_${printTime.getTime()}.pdf`);
                            await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
                            app.io.to('ExportScan').emit(mergedPath ? 'export-scan-done' : 'export-scan-error', { mergedPath, userPrint, tabId });
                            app.fs.deleteFolder(outputFolder);
                        }
                    } else {
                        // throw error
                        console.error('GET /api/dt/diem/export-scan', { error: 'DT_DIEM_INSERT_DATA function has error' });
                        app.io.to('ExportScan').emit('export-scan-error', { userPrint });
                    }
                }
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            app.fs.deleteFolder(outputFolder);
            app.io.to('ExportScan').emit('export-scan-error', { userPrint, error });
        }
    });

    const setUpNumberImg = (dataPrint) => {
        dataPrint.id = ('0000000' + dataPrint.id.toString()).slice(-7);
        const numberPath = app.path.join(__dirname, '../resource');
        for (let i = 1; i <= 7; i++) {
            for (let j = 0; j <= 9; j++) {
                const numCur = dataPrint.id[i - 1];
                dataPrint[`${i}.${j}`] = app.path.join(numberPath, 'Colored.png');
                if (j != numCur) {
                    const numFilePath = app.path.join(numberPath, `Num${j}.png`);
                    dataPrint[`${i}.${j}`] = numFilePath;
                }
            }
        }
        return dataPrint;
    };


    app.get('/api/dt/diem/export-scan-excel', app.permission.orCheck('dtDiem:export', 'dtExam:export'), async (req, res) => {
        try {
            let srcPath = app.path.join(__dirname, '../resource', 'FormDS.xlsx');
            const workBook = await app.excel.readFile(srcPath),
                ws = workBook.getWorksheet('Sheet1');

            let { listMaHocPhan, namHocHocPhi, hocKyHocPhi, kyThi } = {},
                // exportWord = 0,
                dataHocPhan = [], dataSinhVien = [], dataToPrint = [];
            const get2 = (x) => ('0' + x).slice(-2);
            let printTime = new Date(),
                dd = get2(printTime.getDate()), mm = get2(printTime.getMonth() + 1), yyyy = printTime.getFullYear();

            let query = app.utils.parse(req.query.data);
            listMaHocPhan = query.listMaHocPhan;
            namHocHocPhi = query.namHocHocPhi;
            hocKyHocPhi = query.hocKyHocPhi;
            kyThi = query.kyThi;
            let [dataAll] = await Promise.all([
                app.model.dtDiem.getDataThi(JSON.stringify({ listMaHocPhan: listMaHocPhan.toString(), kyThi, namHocHocPhi, hocKyHocPhi }))
            ]);
            dataHocPhan = dataAll.rows;
            dataSinhVien = dataAll.datasinhvien;

            for (let i = 0; i < dataHocPhan.length; i++) {
                let hocPhan = dataHocPhan[i];

                let data = { ...hocPhan, kyThi };

                data.tenMonHoc = data.tenMonHoc ? JSON.parse(data.tenMonHoc).vi : '';
                data.nhom = data.maHocPhan.slice(-2);
                data.giangVien = data.giangVien || '';
                data.tinChi = data.tinChi || '';
                data.tenHe = data.tenHe || '';
                let dataSinhVienHocPhan = dataSinhVien.filter(item => item.maHocPhan == data.maHocPhan).map(item => {
                    item.R = parseInt(item.R);
                    item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                    item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                    item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                    item.lop = item.lop ? item.lop.toUpperCase() : '';
                    return item;
                }).sort((a, b) => a.R - b.R ? 0 : -1);

                dataToPrint.push({ ...data, a: dataSinhVienHocPhan, dd, mm, yyyy });
            }

            for (let data of dataToPrint) {
                workBook.addWorksheet(data.maHocPhan);

                let sheet = workBook.getWorksheet(data.maHocPhan), index = 11;
                await app.excel.copyWorksheet(ws, sheet);
                sheet.name = data.maHocPhan;

                sheet.getCell('E5').value = `Học kỳ ${data.hocKy} - Năm học ${data.namHoc}`;
                sheet.getCell('C7').value = `${data.maMonHoc} - ${data.tenMonHoc} - ${data.nhom}`;
                sheet.getCell('C8').value = data.giangVien;
                sheet.getCell('S7').value = data.tinChi;

                let rowStyle = sheet.getRow(index).style;

                for (let i = 0; i < data.a.length; i++) {
                    let item = data.a[i];
                    sheet.getRow(index + i).style = rowStyle;
                    sheet.getCell(`A${index + i}`).value = item.R;
                    sheet.getCell(`B${index + i}`).value = item.mssv;
                    sheet.getCell(`C${index + i}`).value = item.ho;
                    sheet.getCell(`D${index + i}`).value = item.ten;
                    sheet.getCell(`E${index + i}`).value = item.ngaySinh;
                    sheet.getCell(`F${index + i}`).value = item.lop;
                }

                index = index + data.a.length + 1;
                sheet.mergeCells(`N${index}:U${index}`);
                sheet.getRow(index).font = { name: 'Times New Roman', size: 9 };
                sheet.getCell(`N${index}`).value = `Ngày ${data.dd} tháng ${data.mm} năm ${data.yyyy}`;
                sheet.getCell(`N${index}`).alignment = { horizontal: 'center' };
                sheet.mergeCells(`N${index + 1}:U${index + 1}`);
                sheet.getRow(index + 1).font = { name: 'Times New Roman', size: 9 };
                sheet.getCell(`N${index + 1}`).value = 'Người lập biểu';
                sheet.getCell(`N${index + 1}`).alignment = { horizontal: 'center' };
            }
            const worksheet = workBook.getWorksheet('Sheet1');
            workBook.removeWorksheet(worksheet.id);

            app.excel.attachment(workBook, res, `${dd}_${mm}_${yyyy}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
        }
    });

    app.get('/api/dt/diem/download-export', app.permission.orCheck('dtDiem:export', 'dtExam:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });


};