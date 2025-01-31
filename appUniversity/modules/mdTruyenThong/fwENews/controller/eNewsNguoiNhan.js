module.exports = app => {
    app.get('/user/truyen-thong/e-news/nguoi-nhan', app.permission.check('fwENews:read'), app.templates.admin);
    app.get('/user/truyen-thong/e-news/nguoi-nhan/import', app.permission.check('fwENews:write'), app.templates.admin);

    app.get('/api/tt/e-news/nguoi-nhan/page/:pageNumber/:pageSize', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
            const result = await app.model.fwENewsNguoiNhan.searchPage(pageNumber, pageSize, '', JSON.stringify({}));

            res.send({ page: { pageNumber: result.pagenumber, pageSize: result.pagesize, totalItem: result.totalitem, pageTotal: result.pagetotal, list: result.rows } });
        } catch (error) {
            console.error('GET /api/tt/e-news/nguoi-nhan/page/:pageNumber/:pageSize', error);
            res.send({ error });
        }
    });

    app.post('/api/tt/e-news/nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const item = await app.model.fwENewsNguoiNhan.create(req.body.item);

            res.send({ item });
        } catch (error) {
            console.error('POST /api/tt/e-news/nguoi-nhan', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news/nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const item = await app.model.fwENewsNguoiNhan.update({ id: req.body.id }, req.body.changes);

            res.send({ item });
        } catch (error) {
            console.error('PUT /api/tt/e-news/nguoi-nhan', error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/e-news/nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            await app.model.fwENewsNguoiNhan.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error('DELETE /api/tt/e-news/nguoi-nhan', error);
            res.send({ error });
        }
    });

    app.post('/api/tt/e-news/nguoi-nhan/import/save-all', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const items = await Promise.all(data.map(async (item) => {
                const check = await app.model.fwENewsNguoiNhan.get({ email: item.email });
                if (!check) return await app.model.fwENewsNguoiNhan.create(item);
                else return;
            }));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/e-news/nguoi-nhan/import/download-template', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            let dataNguoiNhan = await app.model.fwENewsDmLoaiNguoiNhan.getAll({ kichHoat: 1 });
            dataNguoiNhan = dataNguoiNhan.map(ele => ele.tenLoai);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('ENews_Import_Template');
            const defaultColumns = [
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Họ', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 20 },
                { header: 'Loại người nhận', key: 'loaiNguoiNhan', width: 20 },
                { header: 'Ghi chú', key: 'ghiChu', width: 40 },
            ];
            ws.columns = defaultColumns;
            const { dataRange: nguoiNhanFormulae } = workBook.createRefSheet('Loai_Nguoi_Nhan', dataNguoiNhan);
            const rows = ws.getRows(2, 5000);
            rows.forEach((row) => {
                row.getCell('loaiNguoiNhan').dataValidation = { type: 'list', allowBlank: true, formulae: [nguoiNhanFormulae] };
            });
            app.excel.attachment(workBook, res, 'ENews_Import_Template.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('eNewsNguoiNhanUploadFile', (req, fields, files, params, done) => app.permission.has(req, () => eNewsNguoiNhanUploadFile(req, fields, files, params, done), done, 'fwENews:write'));

    const validateRow = async (row) => {
        const { email, ho, ten, loaiNguoiNhan, ghiChu } = row;
        const errors = [];
        if (!email || !ho || !ten || !loaiNguoiNhan) {
            errors.push('Thiếu dữ liệu');
        } else {
            if (!app.email.validateEmail(email)) {
                errors.push('Email không hợp lệ');
            } else {
                const checkEmail = await app.model.fwENewsNguoiNhan.get({ email });
                if (checkEmail) errors.push('Email người nhận đã tồn tại');
                else {
                    const checkLoaiNguoNhan = await app.model.fwENewsDmLoaiNguoiNhan.get({ tenLoai: loaiNguoiNhan });
                    if (!checkLoaiNguoNhan) errors.push('Loại người nhận không hợp lệ');
                    else {
                        return { email, ho, ten, idLoaiNguoiNhan: checkLoaiNguoNhan.id, loaiNguoiNhan, ghiChu, errors };
                    }
                }

            }
        }
        return { email, ho, ten, idLoaiNguoiNhan: '', loaiNguoiNhan, ghiChu, errors };

    };
    const eNewsNguoiNhanUploadFile = async (req, fields, files, params, done) => {
        if (files.ENewsNguoiNhan && files.ENewsNguoiNhan.length) {
            const srcPath = files.ENewsNguoiNhan[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                let worksheet = workbook.getWorksheet('ENews_Import_Template');
                let index = 2, items = [];
                try {
                    while (true) {
                        if (!worksheet.getCell('A' + index).value) {
                            break;
                        } else {
                            const
                                email = `${worksheet.getCell('A' + index).text}`.trim(),
                                ho = `${worksheet.getCell('B' + index).text}`.trim(),
                                ten = worksheet.getCell('C' + index).text,
                                loaiNguoiNhan = worksheet.getCell('D' + index).text,
                                ghiChu = worksheet.getCell('E' + index).text;
                            const row = { email, ho, ten, loaiNguoiNhan, ghiChu };
                            const checkedRow = await validateRow(row);
                            index++;
                            items.push(checkedRow);
                        }
                    }
                    done && done({ items });
                } catch (error) {
                    return done({ error });
                }
            } else done({ error: 'No workbook!' });
        }
    };
};