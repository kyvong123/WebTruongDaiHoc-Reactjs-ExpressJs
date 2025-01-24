module.exports = app => {
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7510: {
                title: 'Môn học cũ (trước 2022)',
                link: '/user/sau-dai-hoc/mon-hoc', icon: 'fa-list',
                parentKey: 7542
            },
        },
    };
    app.permission.add(
        { name: 'dmMonHocSdh:manage', menu: menuSdh },
        { name: 'dmMonHocSdh:write' },
        { name: 'dmMonHocSdh:delete' },
    );
    app.get('/user/sau-dai-hoc/mon-hoc', app.permission.check('dmMonHocSdh:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/mon-hoc/upload', app.permission.check('dmMonHocSdh:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: '', parameter: {} };
        let advance = req.query.advance || {};

        if (req.query.condition) {
            condition = {
                statement: 'lower(tenTiengViet) LIKE :text',
                parameter: { text: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        if (advance.ma) {
            if (condition.statement == '') {
                condition.statement += 'lower(ma) LIKE :text1';
            } else {
                condition.statement += ' AND lower(ma) LIKE :text1';
            }
            condition.parameter.text1 = `%${advance.ma.toLowerCase()}%`;
        }
        if (advance.khoaSdh) {
            if (condition.statement == '') {
                condition.statement += 'lower(khoaSdh) LIKE :text2';
            } else {
                condition.statement += ' AND lower(khoaSdh) LIKE :text2';
            }
            condition.parameter.text2 = `${advance.khoaSdh.toLowerCase()}`;
        }
        if (advance.tenTiengViet) {
            if (condition.statement == '') {
                condition.statement += 'lower(tenTiengViet) LIKE :text3';
            } else {
                condition.statement += ' AND lower(tenTiengViet) LIKE :text3';
            }
            condition.parameter.text3 = `%${advance.tenTiengViet.toLowerCase()}%`;
        }
        if (advance.tenTiengAnh) {
            if (condition.statement == '') {
                condition.statement += 'lower(tenTiengAnh) LIKE :text4';
            } else {
                condition.statement += ' AND lower(tenTiengAnh) LIKE :text4';
            }
            condition.parameter.text4 = `%${advance.tenTiengAnh.toLowerCase()}%`;
        }

        app.model.dmMonHocSdh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/sdh/mon-hoc/all', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        app.model.dmMonHocSdh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/mon-hoc/item/:ma', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        app.model.dmMonHocSdh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/mon-hoc', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sdh/mon-hoc', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/mon-hoc', app.permission.check('dmMonHocSdh:delete'), (req, res) => {
        app.model.dmMonHocSdh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/sdh/mon-hoc/multiple', app.permission.check('dmMonHocSdh:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let khoaMapper = {};
            const khoaList = await app.model.dmKhoaSauDaiHoc.getAll('', 'ma, ten');
            (khoaList || []).forEach(item => khoaMapper[item.ten.toLowerCase()] = item.ma);

            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                const newData = {
                    ma: item.ma,
                    tenTiengViet: item.tenTiengViet,
                    tenTiengAnh: item.tenTiengAnh || '',
                    tcLyThuyet: item.tcLyThuyet || 0,
                    tcThucHanh: item.tcThucHanh || 0,
                    khoaSdh: item.khoaSdh ? khoaMapper[item.khoaSdh.toLowerCase()] : '',
                    kichHoat: 1
                };
                let dmMonHocSdh = await app.model.dmMonHocSdh.get({ ma: item.ma });
                if (!dmMonHocSdh) await app.model.dmMonHocSdh.create(newData);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/mon-hoc/download-template', app.permission.check('staff:login'), async (req, res) => {
        let khoaList = await app.model.dmKhoaSauDaiHoc.getAll('', 'ten');
        let khoaMapper = khoaList.map(ele => ele.ten);
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Sdh_Mon_hoc_Template');
        const defaultColumns = [
            { header: 'Mã môn học', key: 'ma', width: 15 },
            { header: 'Tên tiếng việt', key: 'tenTiengViet', width: 50 },
            { header: 'Tên tiếng anh', key: 'tenTiengAnh', width: 50 },
            { header: 'TC Lý thuyết', key: 'tcLyThuyet', width: 15 },
            { header: 'TC Thực hành', key: 'tcThucHanh', width: 30 },
            { header: 'Khoa', key: 'khoa', width: 30 }
        ];
        ws.columns = defaultColumns;
        const { dataRange: khoaSdh } = workBook.createRefSheet('Khoa', khoaMapper);
        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('khoa').dataValidation = { type: 'list', allowBlank: true, formulae: [khoaSdh] };
        });
        app.excel.attachment(workBook, res, 'Sdh_Mon_hoc_Template.xlsx');
    });

    // Download Danh sach mon ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/mon-hoc/download-danh-sach', app.permission.check('staff:login'), async (req, res) => {
        try {
            let condition = { statement: '', parameter: {} };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(tenTiengViet) LIKE :text',
                    parameter: { text: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            if (req.query.ma) {
                if (condition.statement == '') {
                    condition.statement += 'lower(ma) LIKE :text1';
                } else {
                    condition.statement += ' AND lower(ma) LIKE :text1';
                }
                condition.parameter.text1 = `%${req.query.ma.toLowerCase()}%`;
            }
            if (req.query.khoaSdh) {
                if (condition.statement == '') {
                    condition.statement += 'lower(khoaSdh) LIKE :text2';
                } else {
                    condition.statement += ' AND lower(khoaSdh) LIKE :text2';
                }
                condition.parameter.text2 = `${req.query.khoaSdh.toLowerCase()}`;
            }
            if (req.query.tenTiengViet) {
                if (condition.statement == '') {
                    condition.statement += 'lower(tenTiengViet) LIKE :text3';
                } else {
                    condition.statement += ' AND lower(tenTiengViet) LIKE :text3';
                }
                condition.parameter.text3 = `%${req.query.tenTiengViet.toLowerCase()}%`;
            }
            if (req.query.tenTiengAnh) {
                if (condition.statement == '') {
                    condition.statement += 'lower(tenTiengAnh) LIKE :text4';
                } else {
                    condition.statement += ' AND lower(tenTiengAnh) LIKE :text4';
                }
                condition.parameter.text4 = `%${req.query.tenTiengAnh.toLowerCase()}%`;
            }
            let data = await app.model.dmMonHocSdh.getAll(condition);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Sdh_Danh_sach_mon_hoc');
            ws.columns = [
                { header: 'Mã môn học', key: 'ma', width: 15 },
                { header: 'Tên tiếng việt', key: 'tenTiengViet', width: 50 },
                { header: 'Tên tiếng anh', key: 'tenTiengAnh', width: 50 },
                { header: 'TC Lý thuyết', key: 'tcLyThuyet', width: 15 },
                { header: 'TC Thực hành', key: 'tcThucHanh', width: 30 },
                { header: 'Khoa', key: 'khoaSdh', width: 30 }
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = { name: 'Times New Roman' };
            const khoaList = await app.model.dmKhoaSauDaiHoc.getAll('', 'ma, ten');
            let khoaMapper = {};
            khoaList.forEach((item) => {
                khoaMapper[item.ma] = item.ten;
            });
            data.forEach((item) => {
                ws.addRow({
                    ma: item.ma,
                    tenTiengViet: item.tenTiengViet,
                    tenTiengAnh: item.tenTiengAnh,
                    tcLyThuyet: item.tcLyThuyet,
                    tcThucHanh: item.tcThucHanh,
                    khoaSdh: khoaMapper[item.khoaSdh]
                }, 'i');
            });
            const fileName = 'Sdh_Danh_sach_mon_hoc.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmMonHocSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmMonHocSdhImportData(req, fields, files, params, done), done, 'dmMonHocSdh:write'));

    const dmMonHocSdhImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmMonHocSdhImportData' && files.dmMonHocSdhFile && files.dmMonHocSdhFile.length > 0) {
            const srcPath = files.dmMonHocSdhFile[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const value = worksheet.getRow(index).values;
                    if (value.length == 0 || index == totalRow + 1) {
                        app.fs.deleteFile(srcPath);
                        done({ element });
                    } else {
                        let data = {
                            ma: value[1],
                            tenTiengViet: value[2] ? value[2].trim() : '',
                            tenTiengAnh: value[3] ? value[3].trim() : '',
                            tcLyThuyet: value[4],
                            tcThucHanh: value[5],
                            khoaSdh: value[6]
                        };
                        element.push(data);
                        handleUpload(index + 1);
                    }
                };
                handleUpload();
            } else {
                app.fs.deleteFile(srcPath);
                done({ error: 'Error' });
            }
        }
    };
};