module.exports = app => {
    const dateformat = require('dateformat');

    app.readyHooks.add('addSocketListener:ListenThoiKhoaBieuFileExport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ThoiKhoaBieuFileExport', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtThoiKhoaBieu:export') && socket.join('ThoiKhoaBieuFileExport');
        }),
    });

    const handleExportExcel = async (listMaHocPhan, funcExport) => {
        let workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
            worksheet = workBook.getWorksheet(1);
        for (let maHocPhan of listMaHocPhan) {
            workBook.addWorksheet(maHocPhan);
            let sheet = workBook.getWorksheet(maHocPhan);
            await app.excel.copyWorksheet(worksheet, sheet);
            sheet.name = maHocPhan;

            let cells = await funcExport(maHocPhan, sheet);
            app.excel.write(sheet, cells);
        }
        workBook.removeWorksheet(worksheet.id);
        const buffer = await workBook.xlsx.writeBuffer();
        return buffer;
    };

    app.get('/api/dt/thoi-khoa-bieu/download-multiple', app.permission.orCheck('staff:login', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            const get2 = (x) => ('0' + x).slice(-2);
            const { listMaHocPhan, kyThi, loaiFile } = req.query.data,
                printTime = new Date(),
                dd = get2(printTime.getDate()), mm = get2(printTime.getMonth() + 1), yyyy = printTime.getFullYear();

            switch (loaiFile) {
                case 'danhSachSinhVien': {
                    const buffer = await handleExportExcel(listMaHocPhan, app.model.dtThoiKhoaBieuGiangVien.exportDanhSachSinhVien);
                    res.send({ buffer, filename: `DANH_SACH_SINH_VIEN_${dd}_${mm}_${yyyy}.xlsx` });
                    break;
                }
                case 'lichDay': {
                    const buffer = await handleExportExcel(listMaHocPhan, app.model.dtThoiKhoaBieuGiangVien.exportLichDay);
                    res.send({ buffer, filename: `LICH_DAY_${dd}_${mm}_${yyyy}.xlsx` });
                    break;
                }
                case 'danhSachDiemDanh': {
                    const buffer = await handleExportExcel(listMaHocPhan, app.model.dtThoiKhoaBieuGiangVien.exportDiemDanh);
                    res.send({ buffer, filename: `DANH_SACH_DIEM_DANH_${dd}_${mm}_${yyyy}.xlsx` });
                    break;
                }
                case 'bangDiemThi': {
                    app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-thi'));
                    res.send({});
                    let dataToPrint = [];
                    for (let maHocPhan of listMaHocPhan) {
                        await app.model.dtThoiKhoaBieuGiangVien.exportDanhSachThi(maHocPhan, kyThi, dataToPrint);
                        app.io.to('ThoiKhoaBieuFileExport').emit('thoi-khoa-bieu-export-file', { user: req.session.user.email });
                    }
                    dataToPrint = dataToPrint.map((item, index) => ({
                        ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
                    }));
                    const outputFolder = app.path.join(app.assetPath, 'bang-diem-thi', `${printTime.getTime()}`);
                    app.fs.createFolder(outputFolder);
                    const source = app.path.join(__dirname, './resource', 'FormExam.docx');
                    let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') })
                        .then(buf => {
                            let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                            app.fs.writeFileSync(filepath, buf);
                            return filepath;
                        })
                    ));
                    let mergedPath = app.path.join(app.assetPath, 'bang-diem-thi', `output_${printTime.getTime()}.pdf`);
                    await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
                    app.fs.deleteFolder(outputFolder);
                    app.io.to('ThoiKhoaBieuFileExport').emit('thoi-khoa-bieu-export-file', { mergedPath, user: req.session.user.email, isDone: 1, filename: `DANH_SACH_THI_${dd}_${mm}_${yyyy}.pdf` });
                    break;
                }
                case 'bangDiemXacNhan': {
                    app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-xac-nhan'));
                    res.send({});
                    let listBarCodeImg = [], dataToPrint = [];
                    const outputFolder = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `${printTime.getTime()}`);
                    app.fs.createFolder(outputFolder);
                    for (let maHocPhan of listMaHocPhan) {
                        await app.model.dtThoiKhoaBieuGiangVien.exportBangDiemXacNhan(maHocPhan, kyThi, req.session.user.email, listBarCodeImg, dataToPrint);
                        app.io.to('ThoiKhoaBieuFileExport').emit('thoi-khoa-bieu-export-file', { user: req.session.user.email });
                    }
                    dataToPrint = dataToPrint.map((item, index) => ({
                        ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
                    }));
                    const source = app.path.join(__dirname, './resource', 'FormConfirm.docx'),
                        sourceQt = app.path.join(__dirname, './resource', 'FormConfirmQT.docx');
                    let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFileHasImage(data.kyThi == 'CK' ? source : sourceQt, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') }, [90, 93])
                        .then(buf => {
                            let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                            app.fs.writeFileSync(filepath, buf);
                            return filepath;
                        })
                    ));
                    let mergedPath = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `output_${printTime.getTime()}.pdf`);
                    await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
                    app.fs.deleteFolder(outputFolder);
                    listBarCodeImg.map(i => app.fs.deleteFile(i));
                    app.io.to('ThoiKhoaBieuFileExport').emit('thoi-khoa-bieu-export-file', { mergedPath, user: req.session.user.email, isDone: 1, filename: `BANG_DIEM_XAC_NHAN_${dd}_${mm}_${yyyy}.pdf` });
                    break;
                }
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/download-export', app.permission.orCheck('staff:login', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });

    const parseColumn = (items, typePrint) => {
        return items.map(item => {
            let ten = '', time = '', gv = '', lop = '', timeStart = '';

            if (item.isThi) {
                ten = `* THI HỌC KỲ - ${app.utils.parse(item.tenMonHoc || { vi: '' }).vi}`;
                time = typePrint == 3 ? `- ${dateformat(item.batDau, 'dd/mm/yyyy')} \r\n ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}` : `- Thời gian: ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                timeStart = dateformat(item.batDau, 'HH:MM');
            } else if (item.isTKB) {
                ten = `* ${app.utils.parse(item.tenMonHoc || { vi: '' }).vi}`;
                time = typePrint == 3 ? `- ${dateformat(item.ngayBatDau, 'dd/mm/yyyy')} - ${dateformat(item.ngayKetThuc, 'dd/mm/yyyy')} \r\n (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` : `- Thời gian: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`;
                timeStart = item.thoiGianBatDau;
                gv = item.dataTenGiangVien ? `- Giảng viên: ${item.dataTenGiangVien}` : '';
            } else if (item.isEvent) {
                ten = `* Sự kiện: ${item.ten}`;
                time = typePrint == 3 ? `- ${dateformat(item.batDau, 'dd/mm/yyyy')} - ${dateformat(item.ketThuc, 'dd/mm/yyyy')} \r\n (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` : `- Thời gian: ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                timeStart = dateformat(item.batDau, 'HH:MM');
            }

            return { value: ten + (time ? '\r\n' + time : '') + (lop ? '\r\n' + lop : '') + (gv ? '\r\n' + gv : ''), timeStart };
        });
    };

    const addEndInfo = (worksheet, cells, index, cellStart = 'I', cellEnd = 'L') => {
        worksheet.mergeCells(`${cellStart}${index + 13}:${cellEnd}${index + 13}`);
        cells.push({
            cell: cellStart + (index + 13), value: 'Ngày ... tháng ... năm ...',
            font: { size: 9 }, bold: true, alignment: { horizontal: 'center' }
        });

        worksheet.mergeCells(`${cellStart}${index + 14}:${cellEnd}${index + 14}`);
        cells.push({
            cell: cellStart + (index + 14), value: 'PHÒNG QUẢN LÝ ĐÀO TẠO',
            font: { size: 9 }, bold: true, alignment: { horizontal: 'center' }
        });
    };

    app.get('/api/dt/thoi-khoa-bieu/download-thoi-khoa-bieu-phong', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let { data } = req.query, cells = [];
            data = app.utils.parse(data);

            let ngayBatDau = parseInt(data.ngayBatDau),
                ngayKetThuc = parseInt(data.ngayKetThuc),
                { namHoc, hocKy, tuan, typePrint, isFree, isNotFree, numOfDays, listChoosen } = data;

            if (typePrint == 1) {
                const workBook = await app.excel.readFile(app.path.join(app.assetPath, 'dtResource', 'thoi-khoa-bieu-phong.xlsx')),
                    worksheet = workBook.getWorksheet(1);

                worksheet.getCell('A5').value = `Năm học:   ${namHoc}     Học kỳ:   ${hocKy}`;
                worksheet.getCell('A7').value = `Tuần: ${tuan} (Từ ngày ${app.date.viDateFormat(new Date(ngayBatDau))} - Đến ngày ${app.date.viDateFormat(new Date(ngayKetThuc))})`;

                for (let ngayHoc = ngayBatDau; ngayHoc <= ngayKetThuc; ngayHoc += 24 * 60 * 60 * 1000) {
                    let thuCheck = new Date(ngayHoc).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;
                    let column = app.excel.numberToExcelColumn((thuCheck - 1) * 2);
                    worksheet.getCell(`${column}9`).value = thuCheck == 8 ? `Chủ nhật (${app.date.viDateFormat(new Date(ngayHoc))})` : `Thứ ${thuCheck} (${app.date.viDateFormat(new Date(ngayHoc))})`;
                }

                let { rows, datathi, dataevent } = await app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify({ coSo: data.coSo, ngayBatDau, ngayKetThuc, batDau: ngayBatDau, ketThuc: new Date(ngayKetThuc).setHours(23, 59, 59, 999) }));
                rows = rows.filter(i => !i.isNghi);
                const listPhongUsed = [...rows.map(i => i.phong), ...datathi.map(i => i.phong), ...dataevent.map(i => i.phong)];

                if (Number(isFree) && !Number(isNotFree)) listChoosen = listChoosen.filter(i => !listPhongUsed.includes(i.phong));
                if (Number(isNotFree) && !Number(isFree)) listChoosen = listChoosen.filter(i => listPhongUsed.includes(i.phong));

                listChoosen.forEach((phong, index) => {
                    cells.push({
                        cell: 'A' + (index + 11), border: '1234', value: `${phong.phong}\r\n(SC: ${phong.sucChua || 0})`,
                        font: { size: 7 }, bold: true, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true, },
                    });
                    for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += 24 * 60 * 60 * 1000) {
                        let thuCheck = new Date(ngay).getDay() + 1;
                        if (thuCheck == 1) thuCheck = 8;
                        let items = [...rows, ...datathi, ...dataevent].filter(i => {
                            return i.phong == phong.phong && (new Date(i.batDau).setHours(0, 0, 0, 0) == ngay || new Date(i.ngayBatDau).setHours(0, 0, 0, 0) == ngay);
                        });
                        items.sort((a, b) => a.time - b.time);
                        items = parseColumn(items, typePrint);
                        items = items.filter(i => parseInt(i.timeStart) < 17);

                        const columnS = app.excel.numberToExcelColumn((thuCheck - 1) * 2),
                            columnC = app.excel.numberToExcelColumn((thuCheck - 1) * 2 + 1);

                        cells.push({
                            cell: `${columnS}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) < 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                        cells.push({
                            cell: `${columnC}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) >= 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                    }
                });

                addEndInfo(worksheet, cells, listChoosen.length);

                app.excel.write(worksheet, cells);
                app.excel.attachment(workBook, res, 'thoi-khoa-bieu-phong.xlsx');
            } else if (typePrint == 2) {
                const mapper = {
                    1: {
                        template: 'thoi-khoa-bieu-phong-1.xlsx',
                        column: num => num + 4,
                        columnS: num => num + 4,
                        columnC: num => num + 5,
                        cellStart: 'E',
                        cellEnd: 'E',
                    },
                    2: {
                        template: 'thoi-khoa-bieu-phong-2.xlsx',
                        column: num => num * 2 + 4,
                        columnS: num => num * 2 + 4,
                        columnC: num => num * 2 + 5,
                        cellStart: 'F',
                        cellEnd: 'F',
                    },
                    3: {
                        template: 'thoi-khoa-bieu-phong-3.xlsx',
                        column: num => num * 2 + 4,
                        columnS: num => num * 2 + 4,
                        columnC: num => num * 2 + 5,
                        cellStart: 'G',
                        cellEnd: 'H',
                    },
                    4: {
                        template: 'thoi-khoa-bieu-phong-4.xlsx',
                        column: num => num * 2 + 4,
                        columnS: num => num * 2 + 4,
                        columnC: num => num * 2 + 5,
                        cellStart: 'I',
                        cellEnd: 'J',
                    },
                    5: {
                        template: 'thoi-khoa-bieu-phong-5.xlsx',
                        column: num => num * 2 + 2,
                        columnS: num => num * 2 + 2,
                        columnC: num => num * 2 + 3,
                        cellStart: 'H',
                        cellEnd: 'J',
                    },
                    6: {
                        template: 'thoi-khoa-bieu-phong-6.xlsx',
                        column: num => num * 2 + 2,
                        columnS: num => num * 2 + 2,
                        columnC: num => num * 2 + 3,
                    },
                    7: {
                        template: 'thoi-khoa-bieu-phong.xlsx',
                        column: num => num * 2 + 2,
                        columnS: num => num * 2 + 2,
                        columnC: num => num * 2 + 3,
                    },
                };

                const workBook = await app.excel.readFile(app.path.join(app.assetPath, 'dtResource', mapper[numOfDays].template)),
                    worksheet = workBook.getWorksheet(1);

                worksheet.getCell('A5').value = `Năm học:   ${namHoc}     Học kỳ:   ${hocKy}`;
                worksheet.getCell('A7').value = `Lịch phòng từ ngày: ${app.date.viDateFormat(new Date(ngayBatDau))} - Đến ngày ${app.date.viDateFormat(new Date(ngayKetThuc))}`;

                for (let ngayHoc = ngayBatDau; ngayHoc <= ngayKetThuc; ngayHoc += 24 * 60 * 60 * 1000) {
                    let num = (ngayHoc - ngayBatDau) / (24 * 60 * 60 * 1000),
                        thuCheck = new Date(ngayHoc).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;

                    let column = app.excel.numberToExcelColumn(mapper[numOfDays].column(num));
                    worksheet.getCell(`${column}9`).value = thuCheck == 8 ? `Chủ nhật (${app.date.viDateFormat(new Date(ngayHoc))})` : `Thứ ${thuCheck} (${app.date.viDateFormat(new Date(ngayHoc))})`;
                }

                let { rows, datathi, dataevent } = await app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify({ coSo: data.coSo, ngayBatDau, ngayKetThuc, batDau: ngayBatDau, ketThuc: new Date(ngayKetThuc).setHours(23, 59, 59, 999) }));
                rows = rows.filter(i => !i.isNghi);
                const listPhongUsed = [...rows.map(i => i.phong), ...datathi.map(i => i.phong), ...dataevent.map(i => i.phong)];

                if (Number(isFree) && !Number(isNotFree)) listChoosen = listChoosen.filter(i => !listPhongUsed.includes(i.phong));
                if (Number(isNotFree) && !Number(isFree)) listChoosen = listChoosen.filter(i => listPhongUsed.includes(i.phong));

                listChoosen.forEach((phong, index) => {
                    if ([1, 2, 3, 4].includes(numOfDays)) worksheet.mergeCells(`A${index + 11}:C${index + 11}`);
                    cells.push({
                        cell: 'A' + (index + 11), border: '1234', value: `${phong.phong}\r\n(SC: ${phong.sucChua || 0})`,
                        font: { size: 7 }, bold: true, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true, },
                    });
                    for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += 24 * 60 * 60 * 1000) {
                        let num = (ngay - ngayBatDau) / (24 * 60 * 60 * 1000);

                        let items = [...rows, ...datathi, ...dataevent].filter(i => {
                            return i.phong == phong.phong && (new Date(i.batDau).setHours(0, 0, 0, 0) == ngay || new Date(i.ngayBatDau).setHours(0, 0, 0, 0) == ngay);
                        });
                        items.sort((a, b) => a.time - b.time);
                        items = parseColumn(items, typePrint);
                        items = items.filter(i => parseInt(i.timeStart) < 17);

                        const numberColumnS = mapper[numOfDays].columnS(num),
                            numberColumnC = mapper[numOfDays].columnC(num),
                            columnS = app.excel.numberToExcelColumn(numberColumnS),
                            columnC = app.excel.numberToExcelColumn(numberColumnC);

                        cells.push({
                            cell: `${columnS}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) < 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                        cells.push({
                            cell: `${columnC}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) >= 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                    }
                });

                addEndInfo(worksheet, cells, listChoosen.length, mapper[numOfDays].cellStart, mapper[numOfDays].cellEnd);

                app.excel.write(worksheet, cells);
                app.excel.attachment(workBook, res, 'thoi-khoa-bieu-phong.xlsx');
            } else if (typePrint == 3) {
                const workBook = await app.excel.readFile(app.path.join(app.assetPath, 'dtResource', 'thoi-khoa-bieu-phong.xlsx')),
                    worksheet = workBook.getWorksheet(1);

                worksheet.getCell('A5').value = `Năm học:   ${namHoc}     Học kỳ:   ${hocKy}`;
                worksheet.getCell('A7').value = `Lịch phòng từ ngày ${app.date.viDateFormat(new Date(ngayBatDau))} - đến ngày ${app.date.viDateFormat(new Date(ngayKetThuc))})`;

                const { rows, datathi, dataevent } = await app.model.dtThoiKhoaBieu.searchScheduleAll(app.utils.stringify({ coSo: data.coSo, ngayBatDau, ngayKetThuc }));
                const listPhongUsed = [...rows.map(i => i.phong), ...datathi.map(i => i.phong), ...dataevent.map(i => i.phong)];

                if (Number(isFree) && !Number(isNotFree)) listChoosen = listChoosen.filter(i => !listPhongUsed.includes(i.phong));
                if (Number(isNotFree) && !Number(isFree)) listChoosen = listChoosen.filter(i => listPhongUsed.includes(i.phong));

                listChoosen.forEach((phong, index) => {
                    cells.push({
                        cell: 'A' + (index + 11), border: '1234', value: `${phong.phong}\r\n(SC: ${phong.sucChua || 0})`,
                        font: { size: 7 }, bold: true, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true, },
                    });
                    for (let thuCheck of [2, 3, 4, 5, 6, 7, 8]) {
                        let items = [...rows, ...datathi, ...dataevent].filter(i => {
                            return i.phong == phong.phong && (i.thu == thuCheck || (i.batDau && ((new Date(i.batDau).getDay() + 1) == thuCheck || (thuCheck == 8 && (new Date(i.batDau).getDay() + 1) == 1))));
                        });

                        items = parseColumn(items, typePrint);
                        items = items.filter(i => parseInt(i.timeStart) < 17);

                        const columnS = app.excel.numberToExcelColumn((thuCheck - 1) * 2),
                            columnC = app.excel.numberToExcelColumn((thuCheck - 1) * 2 + 1);

                        cells.push({
                            cell: `${columnS}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) < 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                        cells.push({
                            cell: `${columnC}${index + 11}`, border: '1234', value: items.filter(i => parseInt(i.timeStart) >= 12).map(i => i.value).join(' \r\n '),
                            alignment: { wrapText: true, vertical: 'top' }, font: { size: 7 }
                        });
                    }
                });
                addEndInfo(worksheet, cells, listChoosen.length);

                app.excel.write(worksheet, cells);
                app.excel.attachment(workBook, res, 'thoi-khoa-bieu-phong.xlsx');
            }
        } catch (error) {
            app.consoleError(req, error);
        }
    });
};