module.exports = app => {
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7511: {
                title: 'Môn học mới (sau 2022)',
                link: '/user/sau-dai-hoc/mon-hoc-moi', icon: 'fa-list',
                parentKey: 7542
            },
        },
    };
    app.permission.add(
        { name: 'dmMonHocSdhMoi:manage', menu: menuSdh },
        { name: 'dmMonHocSdhMoi:write' },
        { name: 'dmMonHocSdhMoi:delete' },
    );
    app.get('/user/sau-dai-hoc/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/mon-hoc-moi/upload', app.permission.check('dmMonHocSdhMoi:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesMonHocSdhMoi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmMonHocSdhMoi:manage', 'dmMonHocSdhMoi:write', 'dmMonHocSdhMoi:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/mon-hoc-moi/page/:pageNumber/:pageSize', app.permission.check('dmMonHocSdhMoi:manage'), async (req, res) => {
        const _pageNumber = parseInt(req.params.pageNumber),
            _pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = req.query.filter || {}, sort = filter.sort || 'tenTV_ASC';
        filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
        let page = await app.model.sdhDmMonHocMoi.searchPage(_pageNumber, _pageSize, filter, searchTerm);
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
    });

    app.get('/api/sdh/mon-hoc-moi/all', app.permission.check('dmMonHocSdhMoi:manage'), (req, res) => {
        app.model.sdhDmMonHocMoi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/mon-hoc-moi/item/:ma', app.permission.check('dmMonHocSdhMoi:manage'), (req, res) => {
        app.model.sdhDmMonHocMoi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:write'), (req, res) => {
        app.model.sdhDmMonHocMoi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sdh/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:write'), (req, res) => {
        app.model.sdhDmMonHocMoi.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:delete'), (req, res) => {
        app.model.sdhDmMonHocMoi.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/sdh/mon-hoc-moi/multiple', app.permission.check('dmMonHocSdhMoi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let khoaMapper = {};
            const khoaList = await app.model.dmKhoaSauDaiHoc.getAll('', 'ma, ten');
            (khoaList || []).forEach(item => khoaMapper[item.ten.toLowerCase()] = item.ma);
            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                const newData = {
                    ma: item.maMonHoc,
                    tenTiengViet: item.tenTiengViet,
                    tenTiengAnh: item.tenTiengAnh || '',
                    tcLyThuyet: parseInt(item.tcLyThuyet),
                    tcThucHanh: parseInt(item.tcThucHanh),
                    tongTinChi: parseInt(item.tcLyThuyet) + parseInt(item.tcThucHanh),
                    tietLt: parseInt(item.tcLyThuyet) * 15,
                    tietTh: parseInt(item.tcThucHanh) * 30,
                    tongTiet: parseInt(item.tcLyThuyet) * 15 + parseInt(item.tcThucHanh) * 30,
                    khoaSdh: item.khoaSdh,
                    kichHoat: 1
                };
                await app.model.sdhDmMonHocMoi.create(newData);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });


    app.put('/api/sdh/mon-hoc-moi/khoa', app.permission.check('dmMonHocSdhMoi:write'), async (req, res) => {
        try {
            let { listMa, khoaSdh } = req.body;
            listMa = listMa.split(', ');
            for (let ma of listMa) {
                await app.model.sdhDmMonHocMoi.update({ ma }, { khoaSdh });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    // Download Template ---------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/mon-hoc-moi/download-template', app.permission.check('dmMonHocSdhMoi:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const wsDK = workBook.addWorksheet('Mon_hoc_Sdh_Template'),
                wsKhoa = workBook.addWorksheet('Danh_sach_khoa_Sdh');
            let defaultColumnsDK = [
                { cell: 'A1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'B1', value: 'TÊN MÔN TIẾNG VIỆT', bold: true, border: '1234' },
                { cell: 'C1', value: 'TÊN MÔN TIẾNG ANH', bold: true, border: '1234' },
                { cell: 'D1', value: 'MÃ KHOA/BỘ MÔN', bold: true, border: '1234' },
                { cell: 'E1', value: 'TÍN CHỈ LÝ THUYẾT', bold: true, border: '1234' },
                { cell: 'F1', value: 'TÍN CHỈ THỰC HÀNH', bold: true, border: '1234' },

                { cell: 'A2', value: 'AR6001', border: '1234' },
                { cell: 'B2', value: 'Phương pháp luận nghiên cứu khoa học chuyên ngành', border: '1234' },
                { cell: 'C2', value: '', border: '1234' },
                { cell: 'D2', value: '20', border: '1234' },
                { cell: 'E2', value: '2', border: '1234' },
                { cell: 'F2', value: '0', border: '1234' },
            ],
                defaultColKhoa = [
                    { cell: 'A1', value: 'MÃ KHOA', bold: true, border: '1234' },
                    { cell: 'B1', value: 'TÊN KHOA/ĐƠN VỊ', bold: true, border: '1234' },
                ];
            let data = await app.model.dmKhoaSauDaiHoc.getAll({ kichHoat: 1 }, '*', 'ma ASC');
            for (let [index, item] of data.entries()) {
                defaultColKhoa.push({ cell: 'A' + (index + 2), border: '1234', value: item.ma });
                defaultColKhoa.push({ cell: 'B' + (index + 2), border: '1234', value: item.ten });
            }
            app.excel.write(wsDK, defaultColumnsDK);
            app.excel.write(wsKhoa, defaultColKhoa);
            app.excel.attachment(workBook, res, 'Mon_hoc_Sdh_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    // Download Danh sach mon ---------------------------------------------------------------------------------------------------------------------------------

    const getCells = async (filter) => {
        let page = await app.model.sdhDmMonHocMoi.searchPage(1, 10000, filter, '');
        let cells = [
            { cell: 'A1', value: 'MÃ', bold: true, border: '1234' },
            { cell: 'B1', value: 'TÊN MÔN HỌC', bold: true, border: '1234' },
            { cell: 'C1', value: 'TỔNG TC', bold: true, border: '1234' },
            { cell: 'D1', value: 'TC LT', bold: true, border: '1234' },
            { cell: 'E1', value: 'TC TH', bold: true, border: '1234' },
            { cell: 'F1', value: 'TỔNG TIẾT', bold: true, border: '1234' },
            { cell: 'G1', value: 'TIẾT LT', bold: true, border: '1234' },
            { cell: 'H1', value: 'TIẾT TH', bold: true, border: '1234' },
            { cell: 'I1', value: 'KHOA/BÔ MÔN', bold: true, border: '1234' },
            { cell: 'J1', value: 'KÍCH HOẠT', bold: true, border: '1234' },
        ];

        for (let [index, item] of page.rows.entries()) {
            let kichHoat = item.kichHoat == 1 ? 'Có' : 'Không';
            cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.ma });
            cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.tenTiengViet });
            cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.tongTinChi });
            cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tcLyThuyet });
            cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tcThucHanh });
            cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tongTiet });
            cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tietLt });
            cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tietTh });
            cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenKhoa });
            cells.push({ cell: 'J' + (index + 2), border: '1234', value: kichHoat });
        }
        return cells;
    };
    app.get('/api/sdh/mon-hoc-moi/download-danh-sach', app.permission.check('staff:login'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('MON_HOC_SDH_TU_2022');
            let fileName = 'MON_HOC_SDH_TU_2022.xlsx';
            let cellsMonHoc = await getCells(filter);
            app.excel.write(ws, cellsMonHoc);
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmMonHocSdhMoiImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmMonHocSdhMoiImportData(req, fields, files, params, done), done, 'dmMonHocSdhMoi:write'));

    const dmMonHocSdhMoiImportData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmMonHocSdhMoiImportData' && files.dmMonHocSdhMoiImportData && files.dmMonHocSdhMoiImportData.length) {
            const srcPath = files.dmMonHocSdhMoiImportData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const listMaMonHoc = [],
                        successItems = [],
                        falseItem = [],
                        listItems = [];
                    let index = 2;
                    try {
                        while (true) {
                            const maMonHoc = worksheet.getCell('A' + index).text?.toString().trim() || '',
                                tenTiengViet = worksheet.getCell('B' + index).text?.toString().trim() || '',
                                tenTiengAnh = worksheet.getCell('C' + index).text?.toString().trim() || '',
                                khoa = worksheet.getCell('D' + index).text?.toString(),
                                tcLyThuyet = worksheet.getCell('E' + index).text,
                                tcThucHanh = worksheet.getCell('F' + index).text;
                            if (!maMonHoc) break;

                            let data = { stt: index, maMonHoc, tenTiengViet, tenTiengAnh, khoa, tcLyThuyet, tcThucHanh, ghiChu: '', isCheck: false };
                            listItems.push(data);

                            if (listMaMonHoc.includes(maMonHoc)) {
                                let list = listItems.filter(e => e.maMonHoc == maMonHoc);
                                data.ghiChu = `Mã môn học đã được nhập ở dòng ${list[0].stt}.`;
                                falseItem.push(data);
                            } else {
                                listMaMonHoc.push(maMonHoc);
                                let monHoc = await app.model.sdhDmMonHocMoi.get({ ma: maMonHoc });
                                if (monHoc) {
                                    data.ghiChu = 'Mã học phần đã tồn tại.';
                                    falseItem.push(data);
                                } else if (!tenTiengViet) {
                                    data.ghiChu = 'Tên môn học (tiếng Việt) bị trống.';
                                    falseItem.push(data);
                                } else if (!khoa) {
                                    data.ghiChu = 'Khoa/bộ môn bị trống.';
                                    falseItem.push(data);
                                } else {
                                    let tenKhoa = await app.model.dmKhoaSauDaiHoc.get({ ma: khoa });
                                    if (!tenKhoa) {
                                        data.ghiChu = 'Không tìm thấy khoa/bộ môn.';
                                        falseItem.push(data);
                                    } else {
                                        tenKhoa = tenKhoa.ten;
                                        data.tenKhoa = tenKhoa;
                                        if ((parseInt(tcLyThuyet) + parseInt(tcThucHanh)) <= 0) {
                                            data.ghiChu = 'Tổng số tín chỉ phải lớn hơn 0.';
                                            falseItem.push(data);
                                        } else {
                                            if (data.ghiChu != '') falseItem.push(data);
                                            else {
                                                data.isCheck = true;
                                                successItems.push(data);
                                            }
                                        }
                                    }
                                }
                            }

                            index++;
                        }
                        done({ successItems, falseItem });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };
};