module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7609: { title: 'Thống kê', link: '/user/sau-dai-hoc/tuyen-sinh/thong-ke', icon: 'fa-table', backgroundColor: '#f1a242', groupIndex: 1, parentKey: 7544 }
        }
    };

    app.permission.add(
        { name: 'sdhTsThongKe:manage', menu }
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/thong-ke', app.permission.check('sdhTsThongKe:manage'), app.templates.admin);


    app.get('/api/sdh/ts-thong-ke/detail', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            let { filter, searchTerm = '' } = req.query;
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
            res.send({ items, dot, searchTerm });
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.readyHooks.add('addSocketListener:sdhTsThongKeExportData', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('sdhTsThongKeExportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('sdhTsThongKe:manage')) {
                socket.join('sdhTsThongKeExportData');
            }
        }),
    });
    //EXPORT

    const FONT = {
        title: { name: 'Times New Roman', family: 4, size: 13, bold: true },
        header: { name: 'Times New Roman', family: 4, size: 12, bold: false },
        subHeader: { name: 'Times New Roman', family: 4, size: 11, bold: true },
        signature: { name: 'Times New Roman', family: 4, size: 12, bold: true },
        primary: { name: 'Times New Roman', family: 4, size: 11, bold: false },
        italic: { name: 'Times New Roman', family: 4, size: 11, bold: false, italic: true },
        primaryBIU: { name: 'Times New Roman', family: 4, size: 11, bold: true, italic: true, underline: true },
        note: { name: 'Times New Roman', family: 4, size: 11, bold: true, italic: true },
    };

    app.get('/api/sdh/ts-thong-ke/export-dsts', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {


        const getCellsDangKy = (items) => {
            try {
                let data = [];
                if (items && items.length) {
                    let listIdNganh = Object.keys(items.groupBy('idNganh'));
                    let i = 7; let j = 0;
                    for (let idNganh of listIdNganh) {
                        let list = items.groupBy('idNganh')[idNganh],
                            mergeText = 'NGÀNH: ' + list[0].tenNganh?.toUpperCase();
                        if (list && list.length) {
                            data.push({ cell: `A${i}:L${i}`, value: mergeText, border: '1234', font: FONT.primary, bold: true, alignment: { vertical: 'middle', wrapText: true } });
                            let sub = list.map((item, index) => {
                                let cells = [
                                    { cell: 'A' + (i + 1 + index), value: i == 7 ? (index + 1) : (j + 1 + index), border: '1234', alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'B' + (i + 1 + index), value: item.sbd, border: '1234', alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'C' + (i + 1 + index), value: `${item.ho} ${item.ten}`, border: '1234', alignment: { vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'D' + (i + 1 + index), value: app.utils.parse(item.gioiTinh).vi, border: '1234', alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'E' + (i + 1 + index), value: app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy'), border: '1234', alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'F' + (i + 1 + index), value: item.tenTinhThanhPho, border: '1234', alignment: { vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'G' + (i + 1 + index), value: item.nganhTnThs || item.nganhTnDh, border: '1234', font: FONT.primary, alignment: { vertical: 'middle', wrapText: true } },
                                    { cell: 'H' + (i + 1 + index), value: item.btkt == 1 ? String.fromCharCode(0x2611) : String.fromCharCode(0x2610), border: '1234', font: { size: 15 }, alignment: { vertical: 'middle', horizontal: 'center' } },
                                    { cell: 'I' + (i + 1 + index), value: item.dknn ? item.dknn : 'XT Ngoại ngữ', border: '1234', alignment: { vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'J' + (i + 1 + index), value: item.doiTuongUuTien, border: '1234', alignment: { vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'K' + (i + 1 + index), value: item.ccnn, border: '1234', alignment: { vertical: 'middle', wrapText: true }, font: FONT.primary },
                                    { cell: 'L' + (i + 1 + index), value: `${item.ghiChuTTCB || ''} ${item.listGhiChuCCNN ? (',' + item.listGhiChuCCNN) : ''}`, border: '1234', font: FONT.primary, alignment: { vertical: 'middle', wrapText: true } },
                                ];
                                return cells;
                            });
                            data = data.concat(...sub);
                            j += sub.length;
                            i += sub.length + 1;
                        }
                    }
                    return data;
                } else throw 'Không có dữ liệu!';
            } catch (error) {
                return error;
            }
        };

        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);
            const workBook = await app.excel.readFile(app.path.join(app.assetPath, 'sdh/tuyen/sinh/DSTS_Template.xlsx')),
                workSheet = workBook.getWorksheet('DSTS');
            let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
            let cells = getCellsDangKy(items);
            if (Array.isArray(cells) && cells.length) {
                let mergeCell = cells.filter(item => typeof item?.value == 'string' && item?.value?.includes('NGÀNH')).map(i => i.cell);
                mergeCell.map(item => workSheet.mergeCells(item));
                let header = [
                    { cell: 'A4', value: `DANH SÁCH THÍ SINH ${items[0]?.tenHinhThuc.toUpperCase()} ${items[0]?.tenPhanHe.toUpperCase()} ĐỢT ${items[0]?.maDot?.slice(-1)} NĂM ${items[0]?.maDot?.slice(0, 4)}` },
                    { cell: 'A2', value: `HỘI ĐỒNG TS SĐH ${items[0]?.maDot?.slice(0, 4)}` }
                ];
                const lastIndex = 2 + Number(cells.slice(-1)[0]?.cell.slice(1) || 0);
                let footer = [
                    { cell: 'A' + lastIndex, value: `Tổng số thí sinh: ${items.length}`, alignment: { vertical: 'middle', } },
                    { cell: 'I' + lastIndex, value: 'TP. Hồ Chí Minh, ngày        tháng       năm       ', alignment: { vertical: 'middle', horizontal: 'center' } },
                    { cell: 'I' + (lastIndex + 1), value: 'TM HỘI ĐỒNG TUYỂN SINH', alignment: { vertical: 'middle', horizontal: 'center' } },
                    { cell: 'I' + (lastIndex + 2), value: 'CHỦ TỊCH', alignment: { vertical: 'middle', horizontal: 'center' } },
                    { cell: 'I' + (lastIndex + 7), value: 'HIỆU TRƯỞNG', alignment: { vertical: 'middle', horizontal: 'center' } },
                ];

                workSheet.mergeCells(`I${lastIndex}:L${lastIndex}`);
                workSheet.mergeCells(`I${lastIndex + 1}:L${lastIndex + 1}`);
                workSheet.mergeCells(`I${lastIndex + 2}:L${lastIndex + 2}`);
                workSheet.mergeCells(`I${lastIndex + 7}:L${lastIndex + 7}`);

                app.excel.write(workSheet, header);
                app.excel.write(workSheet, cells);
                app.excel.write(workSheet, footer);
                workSheet.getRow(1).font = FONT.header;
                workSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
                workSheet.getRow(2).font = FONT.subHeader;
                workSheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center' };
                workSheet.getRow(4).font = FONT.title;
                workSheet.getRow(4).alignment = { vertical: 'middle', horizontal: 'center' };
                workSheet.getRow(lastIndex).font = FONT.italic;
                workSheet.getRow(lastIndex + 1).font = FONT.signature;
                workSheet.getRow(lastIndex + 2).font = FONT.signature;
                workSheet.getRow(lastIndex + 7).font = FONT.signature;
            }
            app.excel.attachment(workBook, res);
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-thong-ke/export-phieu-bao', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            let { filter } = req.query;
            const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/phieu_bao_template.docx');
            if (filter.sbd) {
                let { ho, ten, ngaySinh, gioiTinh, sbd, tenTinhThanhPho = '', tenNganh, lichThiByMon, tenPhanHe, maDot } = filter;
                const dataCoBan = {
                    hoTen: `${ho} ${ten}`,
                    gioiTinh: app.utils.parse(gioiTinh, { vi: '' }).vi,
                    ngaySinh: app.date.dateTimeFormat(new Date(Number(ngaySinh)), 'dd/mm/yyyy'),
                    sbd, tenTinhThanhPho, tenNganh
                };
                const dataLichThi = { diaDiemThi: [], thoiGianThi: [] };
                lichThiByMon = app.utils.parse(lichThiByMon);
                let isCCNN = await app.model.sdhTsNgoaiNgu.getAll({ id: filter.id });
                for (let { loaiMonThi, lichThiList } of lichThiByMon) {
                    let lichThiKyNang = lichThiList.filter(item => item.kyNang),
                        common = lichThiList.filter(item => !item.kyNang);
                    if (common.length) {
                        for (let item of common) {
                            let diaChiThi = app.utils.parse(item.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}: ${diaChiThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${item.maMonThi == 'XHS' ? 'Bài luận' : loaiMonThi}: ${item.tenMon}, ${app.date.viTimeFormat(new Date(Number(item.ngayThi)))} ${app.date.dateFormat(new Date(Number(item.ngayThi)), 'dd/mm/yyyy')}, Phòng ${item.phongThi} `);
                        }
                    } else {
                        if (!isCCNN.length) {
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${loaiMonThi}`);
                            for (let kyNang of lichThiKyNang) {
                                let diaChiThi = app.utils.parse(kyNang.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                                dataLichThi.diaDiemThi.push(`\t + ${kyNang.kyNang}: ${diaChiThi}`);
                                dataLichThi.thoiGianThi.push(`+  ${kyNang.kyNang}: ${app.date.viTimeFormat(new Date(Number(kyNang.ngayThi)))} ${app.date.dateFormat(new Date(Number(kyNang.ngayThi)), 'dd/mm/yyyy')}, Phòng ${kyNang.phongThi} `);
                            }
                        }
                    }
                }
                if (isCCNN.length) {
                    dataLichThi.diaDiemThi.push('- Môn Ngoại ngữ: Xét tuyển');
                    dataLichThi.thoiGianThi.push('- Môn Ngoại ngữ: Xét tuyển');
                }
                let data = {
                    phanHe: tenPhanHe?.toUpperCase(),
                    tenDot: `${maDot?.slice(-1) || ''}`,
                    nam: `${maDot?.slice(0, 4) || ''}`,
                    ...dataCoBan,
                    diaDiemThi: dataLichThi.diaDiemThi.join('\n'),
                    lichThi: dataLichThi.thoiGianThi.join('\n'),
                };
                const buffer = await app.docx.generateFile(source, data);
                res.send({ buffer, fileName: data.sbd + '.docx' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-thong-ke/download-export', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            let { fileName } = req.query;
            let zipPath = app.path.join(app.assetPath, '/sdh/') + fileName;

            if (app.fs.existsSync(zipPath) && zipPath.endsWith('.zip')) {
                res.download(zipPath, fileName);
            } else {
                res.send({ error: 'Not found!' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sdh/ts-thong-ke/export-phieu-bao', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            let { filter } = req.body;
            const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/phieu_bao_template.docx');
            let items = filter;
            let writeData = [];
            for (const item of items) {
                let { ho, ten, ngaySinh, gioiTinh, sbd, tenTinhThanhPho = '', tenNganh, lichThiByMon, tenPhanHe, maDot } = item;
                const dataCoBan = {
                    hoTen: `${ho} ${ten}`,
                    gioiTinh: app.utils.parse(gioiTinh, { vi: '' }).vi,
                    ngaySinh: app.date.dateTimeFormat(new Date(Number(ngaySinh)), 'dd/mm/yyyy'),
                    sbd, tenTinhThanhPho, tenNganh
                };
                const dataLichThi = { diaDiemThi: [], thoiGianThi: [] };
                lichThiByMon = app.utils.parse(lichThiByMon);
                let isCCNN = await app.model.sdhTsNgoaiNgu.getAll({ id: item.id });
                const skillMapper = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }];
                for (let { maMonThi, loaiMonThi, lichThiList } of lichThiByMon) {
                    let lichThiKyNang = lichThiList.filter(item => item.kyNang),
                        common = lichThiList.filter(item => !item.kyNang);
                    if (common.length) {
                        for (let item of common) {
                            let diaChiThi = app.utils.parse(item.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}: ${diaChiThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${(maMonThi == 'XHS') ? 'Bài luận' : (loaiMonThi)}: ${maMonThi == 'XHS' || maMonThi == 'VD' ? '' : (item.tenMon + ',')} ${app.date.viTimeFormat(new Date(Number(item.ngayThi)))} ${app.date.dateFormat(new Date(Number(item.ngayThi)), 'dd/mm/yyyy')}, Phòng ${item.phongThi} `);
                        }
                    } else {
                        if (!isCCNN.length) {
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${loaiMonThi}`);
                            for (let kyNang of lichThiKyNang) {
                                let diaChiThi = app.utils.parse(kyNang.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                                dataLichThi.diaDiemThi.push(`\t + ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${diaChiThi}`);
                                dataLichThi.thoiGianThi.push(`\t+ ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${app.date.viTimeFormat(new Date(Number(kyNang.ngayThi)))} ${app.date.dateFormat(new Date(Number(kyNang.ngayThi)), 'dd/mm/yyyy')}, Phòng ${kyNang.phongThi} `);
                            }
                        }
                    }
                }
                if (isCCNN.length) {
                    dataLichThi.diaDiemThi.push('- Môn Ngoại ngữ: Xét tuyển');
                    dataLichThi.thoiGianThi.push('- Môn Ngoại ngữ: Xét tuyển');
                }
                let data = {
                    phanHe: tenPhanHe?.toUpperCase(),
                    tenDot: `${maDot?.slice(-1) || ''}`,
                    nam: `${maDot?.slice(0, 4) || ''}`,
                    ...dataCoBan,
                    diaDiemThi: dataLichThi.diaDiemThi.join('\n'),
                    lichThi: dataLichThi.thoiGianThi.join('\n'),
                };
                writeData.push(data);
            }
            let folderPath = app.path.join(app.assetPath, '/sdh/phieu-bao');

            await Promise.all(writeData.map(data => app.docx.generateFile(source, { ...data })
                .then(buf => {
                    app.fs.createFolder(folderPath);
                    app.fs.writeFileSync(folderPath + `/${data.sbd}.docx`, buf);
                })
            ));
            let fileName = `${Date.now()}_PB.zip`;
            let zipPath = app.path.join(app.assetPath, '/sdh/') + fileName;

            await app.fs.zipDirectory(folderPath, zipPath);
            await app.fs.deleteFolder(folderPath);
            if (app.fs.existsSync(zipPath) && zipPath.endsWith('.zip')) {
                res.send({ fileName });
            } else {
                res.send({ error: 'Lỗi generate zip!' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-thong-ke/data-select-adapter', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            const { filter, response } = req.query;
            let data = await app.model.sdhTsInfoTime.dataAdapterTk(app.utils.stringify(filter));
            const items = data.rows;
            res.send({ items, response });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    // exportCCNN
    app.get('/api/sdh/ts/thong-ke/cong-nhan-chung-chi-nn/export', async (req, res) => {
        try {
            res.end();
            let { filter } = req.query;
            const result = await app.model.sdhTsInfoTime.exportCCNN(app.utils.stringify(filter));
            let { rows, dataHeader } = result;
            //groupBy method
            dataHeader[0].phanHe = dataHeader[0].phanHe.toUpperCase();
            dataHeader[0].tenDot = dataHeader[0].tenDot.toUpperCase();
            rows = rows.reduce((group, thiSinh) => {
                const { tenNganh = 'Ngành khác' } = thiSinh;
                group[tenNganh] = group[tenNganh] ?? [];
                group[tenNganh].push(thiSinh);
                return group;
            }, {});
            await app.fs.createFolder(app.path.join(app.assetPath, 'sdh'), app.path.join(app.assetPath, 'sdh', 'chung-nhan-ngoai-ngu'));
            const zipToPrintFolder = app.path.join(app.assetPath, 'sdh/chung-nhan-ngoai-ngu');
            const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'cong_nhan_chung_chi_ngoai_ngu_template.docx');
            let total = 0;
            rows = Object.keys(rows).map((i) => {
                let index = 1;
                total += rows[i].length;
                rows[i].forEach(item => {
                    item.gioiTinh == '01' ? item.gioiTinh = 'Nam' : item.gioiTinh = 'Nữ';
                    item.R = index;
                    index++;
                });
                return {
                    tenNganh: i,
                    dataThiSinh: rows[i]
                };
            });
            let data = {
                ...dataHeader[0],
                nganh: rows,
                total
            };
            const buffer = await app.docx.generateFile(source, data);
            let printTime = Date.now();
            const filePdfPath = `${zipToPrintFolder}/danh-sach-thi-sinh-dat-ccnn-${printTime}.pdf`;
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            // await app.fs.writeFileSync(filePdfPath, pdfBuffer);
            const mapperPhanHe = { '01': 'NCS', '02': 'CH', '03': 'DBTS', '04': 'LT' };
            const fileNameUser = `danh-sach-dat-ccnn-${mapperPhanHe[filter.maPhanHe]}-${dataHeader[0].maDot}`;
            app.io.to('sdhTsThongKeExportData').emit('export-ccnn-done', { path: filePdfPath, fileName: fileNameUser, buffer: pdfBuffer, requester: req.session.user.email });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/thong-ke/download-export', app.permission.check('sdhTsThongKe:manage'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });
    //endExportCCNN
};




