module.exports = (app) => {
    const { PDFDocument } = require('pdf-lib');// print preview sau

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7614: {
                title: 'Đánh phách', link: '/user/sau-dai-hoc/tuyen-sinh/danh-phach', parentKey: 7544, icon: 'fa-pencil', backgroundColor: '#fc8803'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsDanhPhach:manage', menu },
        { name: 'sdhTsDanhPhach:write', menu },
        { name: 'sdhTsDanhPhach:export', menu },
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/danh-phach', app.permission.orCheck('sdhTsDanhPhach:export', 'sdhTsDanhPhach:write', 'sdhTsDanhPhach:manage'), app.templates.admin);

    //------API--------------s

    app.post('/api/sdh/ts/danh-phach', app.permission.check('sdhTsDanhPhach:write'), async (req, res) => {
        try {
            const { step, maTui, maMonThi, kyNang } = req.body.changes;
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            let filter = { idDot: dot.id, maMonThi, kyNang, sortKey: 'sbd' };
            filter = app.utils.stringify(filter);
            const { rows: data } = await app.model.sdhTsInfoCaThiThiSinh.getPhach(filter);
            let arr = app.clone(data), i = 0, result = [];
            //ngắt đoạn
            while (i != data.length) {
                let cursor = Math.floor(Math.random() * arr.length);
                if (arr.length <= Number(step)) cursor = 0;
                let segment = arr.slice(cursor, cursor + Number(step));
                if (arr.length > Number(step)) {
                    while (cursor + Number(step) > arr.length) {
                        if (cursor == 0) break;
                        cursor = cursor - 1;
                    }
                    segment = arr.slice(cursor, cursor + Number(step));
                }
                segment.forEach(_item => {
                    _item.maPhach = ++i;
                    _item.maTui = `${maTui}`;
                });
                result.push(segment);
                arr.splice(cursor, Number(step));
            }
            result = result.flat();
            if (result.length == 0 || data.length == 0) throw 'Lỗi đánh phách';
            await Promise.all([
                Promise.all(result && result.map(item => {
                    return app.model.sdhTsInfoCaThiThiSinh.update({ idLichThi: item.idLichThi, idThiSinh: item.idThiSinh }, { maPhach: item.maPhach, maTui: item.maTui });
                }) || []),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ds-phach/page/:pageNumber/:pageSize', app.permission.check('sdhTsDanhPhach:export'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.dsPhachSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/bai-thi/page/:pageNumber/:pageSize', app.permission.check('sdhTsDanhPhach:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.donTuiSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    //tich hợp print preview
    app.readyHooks.add('addSocketListener:ListenResultExportSdhDanhPhach', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ExportSdhDanhPhach', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('sdhTsDanhPhach:export') && socket.join('ExportSdhDanhPhach');
        }),
    });

    app.get('/api/sdh/ts/danh-phach/export', app.permission.check('sdhTsDanhPhach:export'), async (req, res) => {
        try {
            res.end();
            const { maMonThi, type, kyNang } = req.query.data;
            const requester = req.session.user.email;
            let listPdfBuffer = [];
            const defaultSkill = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }];

            const mergePdfBuffers = async (pdfBuffers) => {
                try {
                    const mergedPdf = await PDFDocument.create();
                    for (const pdfBuffer of pdfBuffers) {
                        const pdfDoc = await PDFDocument.load(pdfBuffer);
                        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        copiedPages.forEach((page) => {
                            mergedPdf.addPage(page);
                        });
                    }
                    const mergedBuffer = await mergedPdf.save();
                    return mergedBuffer;
                } catch (error) {
                    console.error('Error merging PDF buffers:', error);
                    throw error;
                }
            };
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            let filter = { maMonThi, idDot: dot.id, sortKey: 'maPhach' };
            filter = app.utils.stringify(filter);
            let { rows: list } = await app.model.sdhTsInfoCaThiThiSinh.getPhach(filter);
            if (kyNang) {
                const lichThi = await app.model.sdhTsInfoLichThi.getAll({ monThi: maMonThi, kyNang });
                let idLichThi = lichThi.map(item => item.id.toString());
                list = list.filter(item => idLichThi?.includes(item.idLichThi));
            }
            const total = list.length;
            // const maMonThi = 'MT0004', type = 'doi-chieu', kyNang = ''; test data
            if (type == 'doi-chieu') {
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/doi_chieu_phach_template.docx');
                const middle = Math.ceil(list.length / 2);
                let doan2 = list.splice(0, middle), doan1 = list;
                let writeData = {
                    tenDot: dot?.maDot?.slice(-1),
                    nam: dot?.maDot?.slice(0, 4) || '',
                    tenMon: list[0]?.tenMonThi || '',
                    maTui: list[0]?.maTui || '',
                    tongBai: total,
                    kyNang: defaultSkill.find(item => item.id == list[0]?.kyNang)?.text ? `KỸ NĂNG: ${defaultSkill.find(item => item.id == list[0]?.kyNang)?.text}` : '',
                };
                //chia 1 bảng toàn bộ mã phách của 1 môn thi thành 2 bảng gọn biểu mẫu
                writeData['doan1'] = {
                    dataDoan: doan1.map(item => ({ sbd: item.sbd, maPhach: item.maPhach }))
                };
                writeData['doan2'] = {
                    dataDoan: doan2.map(item => ({ sbd: item.sbd, maPhach: item.maPhach }))
                };
                const docxBuffer = await app.docx.generateFile(source, writeData);
                const pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);
                //listPdfBuffer dùng cho print preview

                listPdfBuffer.push(pdfBuffer);
                const buffer = listPdfBuffer.length != 1 ? await mergePdfBuffers(listPdfBuffer) : pdfBuffer;

                app.io.to('ExportSdhDanhPhach').emit('export-doi-chieu-done', { docxBuffer, buffer: buffer, fileName: `SDH_TS_BẢNG_ĐỐI_CHIẾU_PHÁCH_${maMonThi}`, requester });

                // res.send({ buffer: docxBuffer, fileName: `SDH_TS_BẢNG_ĐỐI_CHIẾU_PHÁCH_${Date.now()}.docx` });
            } else {
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/bien_bang_cham_template.docx');
                list = list.sort((a, b) => Number(a.maPhach) < Number(b.maPhach) ? -1 : 1);
                let writeData = {
                    tenDot: dot?.maDot?.slice(-1),
                    nam: dot?.maDot?.slice(0, 4) || '',
                    tenMon: list[0]?.tenMonThi || '',
                    tongBai: total,
                    startP: list[0]?.maPhach,
                    endP: list.slice(-1)[0]?.maPhach,
                    kyNang: defaultSkill.find(item => item.id == list[0]?.kyNang)?.text ? `KỸ NĂNG: ${defaultSkill.find(item => item.id == list[0]?.kyNang)?.text}` : '',
                };


                writeData['data'] = list.map(item => ({ maPhach: item.maPhach || '###error' }));

                const docxBuffer = await app.docx.generateFile(source, writeData);

                const pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);

                listPdfBuffer.push(pdfBuffer);
                const buffer = listPdfBuffer.length != 1 ? await mergePdfBuffers(listPdfBuffer) : pdfBuffer;
                app.io.to('ExportSdhDsDanPhong').emit('export-bieu-mau-cham-done', { docxBuffer, buffer: buffer, fileName: `SDH_TS_BIÊN_BẢNG_CHẤM_${list[0]?.maTui}`, requester });
                // res.send({ buffer: docxBuffer, fileName: `SDH_TS_BIÊN_BẢNG_CHẤM_${list[0]?.maTui}.docx` });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });
    app.get('/api/sdh/ts/danh-phach/mon-thi', app.permission.orCheck('sdhTsDanhPhach:write', 'sdhTsDanhPhach:export'), async (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const idDot = req.query.idDot,
            filter = { idDot },
            data = await app.model.sdhTsInfoCaThiThiSinh.getMonThiDanhPhach(app.utils.stringify(filter));
        let listMonThi = data.rows;
        const checkTinhTrang = (maMonThi, listData) => {
            const check = listData?.filter(item => item.maMonThi == maMonThi && item.maPhach);
            if (!check || check.length == listData.length) return '(Đã đánh phách)';
            else if (check.length != data.length && check.length) return '(Chưa đánh hết)';
            else return '(Chưa đánh phách)';
        };
        listMonThi = listMonThi.map(item => {
            const listData = app.utils.parse(item.listPhach);
            item.tinhTrang = !item.isNgoaiNgu ? checkTinhTrang(item.ma, listData) : '';
            return item;
        });
        let ret = searchTerm ? listMonThi.filter(item => item.ten?.toLowerCase().includes(searchTerm.toLowerCase()) || item.tinhTrang?.toLowerCase().includes(searchTerm.toLowerCase())) : listMonThi;
        res.send({ items: ret });
    });

    app.get('/api/sdh/ts/danh-phach/mon-thi/item/:maMonThi', app.permission.orCheck('sdhTsDanhPhach:write', 'sdhTsDanhPhach:export'), async (req, res) => {
        const { maMonThi } = req.params;
        const { id: idDot } = await app.model.sdhTsInfoTime.get({ processing: 1 });
        const filter = { idDot },
            data = await app.model.sdhTsInfoCaThiThiSinh.getMonThiDanhPhach(app.utils.stringify(filter));
        let listMonThi = data.rows;
        const checkTinhTrang = (maMonThi, listData) => {
            const check = listData?.filter(item => item.maMonThi == maMonThi && item.maPhach);
            if (!check || check.length == listData.length) return '(Đã đánh phách)';
            else if (check.length != data.length && check.length) return '(Chưa đánh hết)';
            else return '(Chưa đánh phách)';
        };
        let item = listMonThi.find(item => item.ma == maMonThi);
        const listData = app.utils.parse(item.listPhach);
        item.tinhTrang = !item.isNgoaiNgu ? checkTinhTrang(item.ma, listData) : '';
        res.send({ item });
    });
};
