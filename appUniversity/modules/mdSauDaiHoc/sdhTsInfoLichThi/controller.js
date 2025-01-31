module.exports = (app) => {
    const { PDFDocument } = require('pdf-lib');

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7611: {
                title: 'Quản lý lịch thi',
                link: '/user/sau-dai-hoc/tuyen-sinh/lich-thi',
                parentKey: 7544,
                icon: 'fa-calendar',
                backgroundColor: '#0fd9c5',
            }
        }
    };

    app.permission.add(
        { name: 'sdhTuyenSinhLichThi:read', menu },
        { name: 'sdhTuyenSinhLichThi:manage', menu },
        { name: 'sdhTuyenSinhLichThi:write', menu },
        { name: 'sdhTuyenSinhLichThi:export', menu },
        'sdhTuyenSinhLichThi:delete'
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/lich-thi', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write', 'sdhTuyenSinhLichThi:export'), app.templates.admin);
    app.get('/user/sau-dai-hoc/tuyen-sinh/lich-thi/danh-sach/:idPhongThi', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write', 'sdhTuyenSinhLichThi:export'), app.templates.admin);

    //------API--------------s

    app.post('/api/sdh/ts-info/lich-thi', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let item = await app.model.sdhTsInfoLichThi.create({ ...data });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/lich-thi', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const dataInfoLichThi = req.body.data;
            const id = req.body.id;
            await app.model.sdhTsInfoLichThi.update({ id }, { ...dataInfoLichThi });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/lich-thi', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            await app.model.sdhTsInfoLichThi.delete({ id });
            await app.model.sdhTsInfoCaThiThiSinh.delete({ idLichThi: id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/lich-thi/multiple', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const listId = req.body.listId;
            await app.model.sdhTsInfoLichThi.delete({
                statement: 'id IN (:listLichThi)',
                parameter: { listLichThi: listId }
            });
            await app.model.sdhTsInfoCaThiThiSinh.delete({
                statement: 'idLichThi IN (:listLichThi)',
                parameter: { listLichThi: listId }
            });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/item/:id', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const id = req.body.params.id;
            let item = await app.model.sdhTsInfoLichThi.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/page/:pageNumber/:pageSize', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const idDot = filter && filter != '%%%%%%%%' ? filter.idDot : '';
            const sort = filter && filter != '%%%%%%%%' ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoLichThi.searchPage(pagenumber, pagesize, filter, searchTerm, idDot);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/chua-xep/page/:pageNumber/:pageSize', app.permission.orCheck('sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter && filter ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoLichThi.unscheduledListPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/danh-sach-mon-thi', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { dataPhong, dataNganh } = req.query;
            let phong = await app.model.sdhTsDmPhongThi.getAll({
                statement: 'id IN (:dataPhong)',
                parameter: { dataPhong }
            });
            const listNganh = Object.values(dataNganh).map(item => {
                return item.map(i => i.id).join(',');
            }).join(',');
            let listMonThi = await app.model.sdhTsInfoLichThi.getMonThi(listNganh);
            res.send({ phong, monThi: listMonThi.rows });
            // let items = await app.model.sdhTsInfoLichThi.getByFilter(filter);
            // res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/lich-thi/multiple', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            for (let item of data) {
                await app.model.sdhTsInfoLichThi.create(item);
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/lich-thi/multiple/new', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            let { duLieu } = req.body;
            const { listMonThi, soLuongToiDa, listPhong, coSo, idDot, tenCumPhong } = duLieu;
            for (let key of Object.keys(listMonThi)) {
                let listThiSinh = listMonThi[key].listThiSinh;
                for (let phong of listPhong) {
                    let listSbd = app.clone(listThiSinh);
                    if (listThiSinh && listThiSinh.length > soLuongToiDa) {
                        listSbd = listThiSinh.slice(0, soLuongToiDa);
                        listThiSinh = listThiSinh.slice(soLuongToiDa);
                    } else {
                        listThiSinh = [];
                    }
                    let data = {
                        ngayThi: Number(listMonThi[key].gioThi),
                        thoiLuong: listMonThi[key].thoiLuong,
                        nganh: duLieu.listNganh,
                        phongThi: phong,
                        coSo,
                        siSo: soLuongToiDa,
                        maToHop: key,
                        idToHop: listMonThi[key].idToHop,
                        idDot,
                        tenCumPhong
                    };
                    const phongCreated = await app.model.sdhTsInfoLichThi.create(data);
                    listSbd && listSbd.length ? await Promise.all(listSbd.map(async thiSinh => {
                        const monThi = await app.model.sdhTsInfoCaThiThiSinh.getTenMonThi(thiSinh.id, phongCreated.idToHop);
                        return app.model.sdhTsInfoCaThiThiSinh.create({ idThiSinh: thiSinh.id, sbd: thiSinh.sbd, idLichThi: phongCreated.id, maMonThi: monThi.rows[0].maMonThi || '', maHinhThuc: thiSinh.hinhThuc });
                    })) : null;
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.readyHooks.add('addSocketListener:ListenResultExportSdhDsDanPhong', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ExportSdhDsDanPhong', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('sdhTuyenSinhLichThi:export') && socket.join('ExportSdhDsDanPhong');
        }),
    });
    app.get('/api/sdh/ts/lich-thi/danh-sach-thi-sinh/export', async (req, res) => {
        try {
            res.end();
            let filter = req.query.data;
            const type = filter.type;
            filter.listPhong = filter.listPhong.join(',');
            const requester = req.session.user.email;
            const result = await app.model.sdhTsInfoLichThi.exportLichThi(app.utils.stringify(filter));
            let { rows, dataHeader } = result;
            if (!rows.length) {
                return app.io.to('ExportSdhDsDanPhong').emit('export-ds-dan-phong-sdh-ts-error', { err: 'Không tìm được phòng thi', requester });
            }
            const dataHead = dataHeader[0];
            const source = type == 'danPhong' ? app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh-ts-ds-dan-phong-template.docx') : app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh-ts-ds-ky-ten-template.docx');
            let index = 0;
            let numberFile = rows.length;
            let pdfBuffer = '';
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
            let listPdfBuffer = [];
            for (let item of rows) {
                let total = 0;
                item.namTs = dataHead.namTs;
                item.maDot = dataHead.maDot;
                const ngayThi = new Date(item.ngayThi);
                item.ngayThi = app.date.dateFormat(ngayThi) + ' ' + app.date.viTimeFormat(ngayThi);
                const dataNganh = await app.model.sdhTsInfoLichThi.exportThiSinhPhongThi(item.id);
                item.nganh = dataNganh.rows;
                let count = 0;
                item.nganh = item.nganh.map((i) => {
                    if (i.dataThiSinh) {
                        i.dataThiSinh = app.utils.parse(i.dataThiSinh);
                        total += i.dataThiSinh.length;
                        i.dataThiSinh = i.dataThiSinh.map((i) => {
                            count++;
                            return { ...i, ghiChu: i.ghiChu == '0' ? '' : 'XT ngoại ngữ', R: count };
                        });
                    }
                    return i;
                });
                item.total = total;
                const buffer = await app.docx.generateFile(source, item);
                pdfBuffer = await app.docx.toPdfBuffer(buffer);
                listPdfBuffer.push(pdfBuffer);
                index = index + 1;
                app.io.to('ExportSdhDsDanPhong').emit('export-ds-dan-phong-sdh-ts-one', { process: `${(index / numberFile).toFixed(2) * 100}%`, requester });
            }
            const buffer = listPdfBuffer.length != 1 ? await mergePdfBuffers(listPdfBuffer) : pdfBuffer;
            const fileNameUser = (type == 'danPhong') ? `danh-sach-dan-phong-${dataHeader[0].maDot}` : `danh-sach-ky-ten-${dataHeader[0].maDot}`;
            app.io.to('ExportSdhDsDanPhong').emit('export-ds-dan-phong-sdh-ts-done', { buffer, fileName: fileNameUser, requester });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/lich-thi/download-export', app.permission.check('sdhTuyenSinhLichThi:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/transferData', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            let listSelectedNganh = req.query.data;
            if (!listSelectedNganh.length) return res.send({ error: 'Vui lòng chọn ngành dự thi' });
            let listToHopChung = [];
            for (let item of listSelectedNganh) {
                let listToHop = item.toHop ? item.toHop.split(',') : [], listMaToHop = item.maToHop?.split(','), listIdToHop = item.idToHop?.split(',');
                let toHop = {};
                for (let i = 0; i < listToHop.length; i++) {
                    const key = listMaToHop[i];
                    const value = listToHop[i];
                    const idToHop = listIdToHop[i];
                    let filter = {
                        maToHop: key,
                        listNganh: listSelectedNganh.map(i => i.id).join(',')
                    };
                    const listThiSinh = await app.model.sdhTsInfoLichThi.getThiSinhThem(app.utils.stringify(filter));
                    toHop[`${key}`] = { tenToHop: value, listThiSinh: listThiSinh.rows.filter(i => i.thoaDieuKien == '1').sort((a, b) => a.sbd - b.sbd), idToHop };
                }
                listToHopChung.push(toHop);
            }
            let result = {};
            const listKey = Object.keys(listToHopChung[[0]]);
            listKey.forEach(item => {
                let check = true;
                listToHopChung.forEach(j => {
                    if (!j.hasOwnProperty(item)) {
                        check = false;
                        return;
                    }
                });
                if (check) result[item] = listToHopChung[0][item];
            });
            res.send({ items: result });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/lich-thi/ma-tui/all', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const { filter, response } = req.query;
            let data = await app.model.sdhTsInfoLichThi.getMaTuiAll(app.utils.stringify(filter));
            const items = data.rows;
            res.send({ items, response });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/thi-sinh/single', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { data } = req.body;
            app.model.sdhTsInfoCaThiThiSinh.create(data).catch(error => console.log(error));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/lich-thi/single', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const { data: filter } = req.query;
            let data = await app.model.sdhTsInfoLichThi.getRoomForSingle(app.utils.stringify(filter));
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
