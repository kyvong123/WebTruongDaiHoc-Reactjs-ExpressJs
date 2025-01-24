module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7528: {
                title: 'Ngành đào tạo',
                parentKey: 7540,
                link: '/user/sau-dai-hoc/danh-sach-nganh'
            },
            7632: {
                title: 'Ngành đào tạo',
                parentKey: 7544,
                link: '/user/sau-dai-hoc/danh-sach-nganh', groupIndex: 2
            },
        },
    };
    app.permission.add(
        { name: 'dmNganhSdh:manage', menu }, 'dmNganhSdh:write', 'dmNganhSdh:delete'
    );
    app.get('/user/sau-dai-hoc/danh-sach-nganh', app.permission.check('dmNganhSdh:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/danh-sach-nganh/upload', app.permission.check('dmNganhSdh:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/danh-sach-nganh/page/:pageNumber/:pageSize', app.permission.check('dmNganhSdh:manage'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
                if (req.query.kichHoat) {
                    condition.statement += ' AND kichHoat = :kichHoat';
                    condition.parameter.kichHoat = req.query.kichHoat;
                }
                if (req.query.maKhoaSdh) {
                    condition.statement += ' AND maKhoa = :maKhoa';
                    condition.parameter.maKhoa = req.query.maKhoaSdh;
                }
            } else if (req.query.kichHoat) {
                condition = {
                    statement: 'kichHoat = :kichHoat',
                    parameter: { kichHoat: req.query.kichHoat }
                };
                if (req.query.maKhoaSdh) {
                    condition.statement += ' AND maKhoa = :maKhoa';
                    condition.parameter.maKhoa = req.query.maKhoaSdh;
                }
            } else if (req.query.maKhoaSdh) {
                condition = {
                    maKhoa: req.query.maKhoaSdh
                };
            }
            let page = await app.model.dmNganhSauDaiHoc.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }

    });

    app.get('/api/sdh/danh-sach-nganh/all', app.permission.check('dmNganhSdh:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            filter = JSON.stringify(filter);
            let phanHe = req.query.phanHe;
            let items = await app.model.dmNganhSauDaiHoc.searchAll(phanHe, filter);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/danh-sach-nganh/item/:ma', app.permission.orCheck('dmNganhSdh:manage', 'dmNganhSdh:write', 'studentSdh:login', 'sdhTuyenSinhLichThi:read'), (req, res) => {
        app.model.dmNganhSauDaiHoc.get({ maNganh: req.params.ma }, (error, item) => res.send({ error, item }));
    });
    app.get('/api/sdh/danh-sach-nganh/phanHe/:phanHe', app.permission.orCheck('dmNganhSdh:manage', 'dmNganhSdh:write', 'studentSdh:login'), async (req, res) => {
        try {
            let items = await app.model.dmNganhSauDaiHoc.getAll({ phanHe: req.params.phanHe });
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.post('/api/sdh/danh-sach-nganh', app.permission.check('dmNganhSdh:write'), async (req, res) => {
        try {
            await app.model.dmNganhSauDaiHoc.create(req.body.item);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/sdh/danh-sach-nganh', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.update({ maNganh: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/danh-sach-nganh', app.permission.check('dmNganhSdh:delete'), (req, res) => {
        app.model.dmNganhSauDaiHoc.delete({ maNganh: req.body.ma }, errors => res.send({ errors }));
    });

    app.post('/api/sdh/danh-sach-nganh/multiple', app.permission.check('dmNganhSdh:write'), async (req, res) => {
        try {
            const data = req.body.data;
            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                const newData = {
                    maNganh: item.ma,
                    ten: item.ten,
                };
                let data = await app.model.dmNganhSauDaiHoc.get({ maNganh: item.ma });
                if (!data) await app.model.dmNganhSauDaiHoc.create(newData);
            }
            res.end();
        } catch (error) { res.send({ error }); }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmNganhSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmNganhSdhImportData(req, fields, files, params, done), done, 'dmNganhSdh:write'));

    const dmNganhSdhImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmNganhSdhImportData' && files.dmNganhSdhFile && files.dmNganhSdhFile.length > 0) {
            const srcPath = files.dmNganhSdhFile[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const value = worksheet.getRow(index).values;
                    if (value.length == 0 || index == totalRow + 1) {
                        app.fs.deleteFile(srcPath);
                        done({ element });
                    } else {
                        let data = {
                            maNganh: value[1],
                            ten: value[2] ? value[2].trim() : '',
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