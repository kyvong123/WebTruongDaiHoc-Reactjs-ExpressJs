module.exports = app => {
    //index later
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7562: {
                title: 'Môn thi tuyển sinh', link: '/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh', parentKey: 7544, groupIndex: 2
            }
        }
    };
    app.permission.add(
        { name: 'sdhMonThiTuyenSinh:read', menu },
        { name: 'sdhMonThiTuyenSinh:write' },
        { name: 'sdhMonThiTuyenSinh:delete' }
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh', app.permission.check('sdhMonThiTuyenSinh:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh/upload', app.permission.check('sdhMonThiTuyenSinh:write'), app.templates.admin);



    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/mon-thi-tuyen-sinh/all', app.permission.check('sdhMonThiTuyenSinh:read'), async (req, res) => {
        try {
            let items = await app.model.sdhMonThiTuyenSinh.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    // app.get('/api/sdh/mon-thi-tuyen-sinh/adapter', app.permission.check('sdhMonThiTuyenSinh:read'), async (req, res) => {
    //     try {
    //         const maToHop = req.query.maToHop;
    //         let items = await app.model.sdhMonThiTuyenSinh.getAll({ loaiMonThi: maToHop }, '*', 'ma');
    //         res.send({ items });
    //     } catch (error) {
    //         res.send({ error });
    //     }

    // });
    app.get('/api/sdh/mon-thi-tuyen-sinh/ngoai-ngu/all', app.permission.orCheck('sdhMonThiTuyenSinh:read', 'sdhDsTs:read'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const condition = {
                statement: '(lower(ten) LIKE :searchTerm OR ma = :searchTerm) AND kichHoat = 1',
                parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
            };
            let items = await app.model.sdhMonThiTuyenSinh.getAll(condition);
            if (items && items.length) {
                items = items.filter(item => item.isNgoaiNgu == 1);
                res.send({ items });
            } else {
                throw 'Không tìm thấy dữ liệu';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/mon-thi/adapter', app.permission.check('sdhMonThiTuyenSinh:read'), (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const condition = {
            statement: '(lower(ten) LIKE :searchTerm OR ma = :searchTerm) AND kichHoat = 1',
            parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
        };
        app.model.sdhMonThiTuyenSinh.getAll(condition, (error, items) => {
            res.send({ error, items: items.filter(item => item.ma != 'VD' && item.ma != 'XHS') });
        });
    });
    app.get('/api/sdh/mon-thi-tuyen-sinh/item/:ma', app.permission.check('sdhMonThiTuyenSinh:read'), async (req, res) => {
        try {
            let item = await app.model.sdhMonThiTuyenSinh.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/mon-thi-tuyen-sinh', app.permission.check('sdhMonThiTuyenSinh:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            data.userModified = req.session.user.email;
            data.lastModified = Date.now();
            let item = await app.model.sdhMonThiTuyenSinh.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/mon-thi-tuyen-sinh', app.permission.check('sdhMonThiTuyenSinh:write'), async (req, res) => {
        try {
            let data = req.body.data;
            data.userModified = req.session.user.email;
            data.lastModified = Date.now();
            const item = await app.model.sdhMonThiTuyenSinh.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/mon-thi-tuyen-sinh', app.permission.check('sdhMonThiTuyenSinh:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await Promise.all([
                app.model.sdhMonThiTuyenSinh.delete({ ma }),
                app.model.sdhTsInfoMonThi.delete({ maMonThi: ma }),
                app.model.sdhTsInfoLichThi.delete({ monThi: ma }),
                app.model.sdhTsInfoCaThiThiSinh.delete({ maMonThi: ma }),
                app.model.sdhTsDonPhucTra.delete({ maMonThi: ma })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/mon-thi-tuyen-sinh/multiple', app.permission.check('sdhMonThiTuyenSinh:write'), async (req, res) => {
        try {
            let { data, isOverwrite } = req.body;
            const items = await app.model.sdhMonThiTuyenSinh.getAll();
            const db = items.map(item => item.ma);
            let updateList = [], createList = [];
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            if (data && data.length) {
                for (const item of data) {
                    let updateItem = app.clone(item);
                    if (db.includes(item.ma)) {
                        let old = items.find(_item => _item.ma == item.ma);
                        let log = {
                            overwrite: `${isOverwrite} on ${dot?.maDot}`,
                            ma: item.ma,
                            ten: item.ten && item.ten != old.ten ? `${old.ten} -> ${item.ten}` : old.ten,
                            tenTiengAnh: item.tenTiengAnh && item.tenTiengAnh != old.tenTiengAnh ? `${old.tenTiengAnh} -> ${item.tenTiengAnh}` : old.tenTiengAnh,
                        };
                        updateItem.log = app.utils.stringify(log);
                        updateItem.userModified = req.session.user.email;
                        updateItem.lastModified = Date.now();
                        updateList.push(updateItem);
                    } else {
                        item.userModified = req.session.user.email;
                        item.lastModified = Date.now();
                        createList.push(item);
                    }
                }
                await Promise.all(updateList.map(item => {
                    let oldMa = db.find(_item => _item == item.ma);
                    return Promise.all([
                        app.model.sdhMonThiTuyenSinh.update({ ma: oldMa }, item),
                    ]);
                }).concat(createList.map(item => Promise.all([
                    app.model.sdhMonThiTuyenSinh.create(item),

                ]))));
            } else throw 'Empty list';
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }

    });

    app.get('/api/sdh/mon-thi-template/download', app.permission.check('sdhDsTs:import'), async (req, res) => {
        try {
            const fileName = 'SDH_Mon_thi_template.xlsx', path = app.path.join(__dirname, 'resources', fileName);
            if (app.fs.existsSync(path)) {
                res.download(path, fileName);
            } else {
                console.error(req.url, req.method, { error: `Không tìm thấy đường dẫn: ${path}` });
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });


    //----Hook-----------------
    app.uploadHooks.add('sdhTsMonThiImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => sdhTsMonThiImportData(req, fields, files, params, done), done, 'sdhMonThiTuyenSinh:write'));

    const sdhTsMonThiImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'sdhTsMonThiImportData' && files.sdhTsMonThiFile && files.sdhTsMonThiFile.length > 0) {
            const srcPath = files.sdhTsMonThiFile[0].path;
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
                            ma: value[2],
                            ten: value[3],
                            tenTiengAnh: value[4],
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