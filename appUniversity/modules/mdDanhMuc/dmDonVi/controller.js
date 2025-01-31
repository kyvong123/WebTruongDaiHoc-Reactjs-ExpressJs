module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4023: { title: 'Danh sách Đơn vị', link: '/user/category/don-vi' },
        },
    };
    app.permission.add(
        { name: 'dmDonVi:read', menu },
        { name: 'dmDonVi:write' },
        { name: 'dmDonVi:delete' },
        { name: 'dmDonVi:upload' },
        { name: 'staff:login' },
    );
    app.get('/user/category/don-vi', app.permission.check('dmDonVi:read'), app.templates.admin);
    app.get('/user/category/don-vi/upload', app.permission.check('dmDonVi:write'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/don-vi/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmDonVi.searchPage(_pageNumber, _pageSize, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/don-vi/all', app.permission.check('user:login'), (req, res) => {
        let searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
            kichHoat = req.query.kichHoat || null;

        let statement = 'lower(ten) LIKE :searchTerm', parameter = { searchTerm: `%${searchTerm.toLowerCase()}%` };
        if (kichHoat) {
            statement = 'lower(ten) LIKE :searchTerm AND kichHoat = 1';
        }
        app.model.dmDonVi.getAll({ statement, parameter }, '*', 'maPl,ten', (error, items) => {
            items.unshift({ ma: 0, ten: 'Trường ĐH Khoa học Xã hội và Nhân văn - TPHCM' });
            res.send({ error, items });
        });
    });

    app.get('/api/danh-muc/don-vi/get-in-list', app.permission.orCheck('manager:read', 'staff:login'), async (req, res) => {
        try {
            if (!req.query.condition || !req.query.condition.length) throw 'Invalid argument';
            const items = await app.model.dmDonVi.getAll({
                statement: 'ma IN (:list)',
                parameter: { list: req.query.condition || [] }
            });
            res.send({ items });
        } catch (error) { res.send({ error }); }
    });

    app.get('/api/danh-muc/don-vi/item/:ma', app.permission.check('user:login'), (req, res) => {
        if (req.params.ma == 0) res.send({
            item: {
                ma: 0, ten: 'Trường ĐH Khoa học Xã hội và Nhân văn - TPHCM', homeLanguage: 'vi,en'
            }
        });
        else app.model.dmDonVi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/don-vi', app.permission.check('dmDonVi:write'), (req, res) => {
        let data = req.body.item;
        if (req.session.dmDonViImage) {
            const srcPath = req.session.dmDonViImage,
                imageLink = '/img/dmDonVi/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath),
                destPath = app.path.join(app.publicPath, imageLink);
            app.fs.copyFile(srcPath, destPath, () => {
                app.fs.deleteFile(srcPath);
                data.image = imageLink;
                app.model.dmDonVi.create(data, (error, item) => res.send({ error, item }));
            });
        } else {
            app.model.dmDonVi.create(data, (error, item) => res.send({ error, item }));
        }

    });

    app.put('/api/danh-muc/don-vi', app.permission.check('dmDonVi:write'), (req, res) => {
        app.model.dmDonVi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/don-vi', app.permission.check('dmDonVi:delete'), (req, res) => {
        app.model.dmDonVi.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/danh-muc/don-vi/upload', app.permission.check('dmDonVi:upload'), (req, res) => {
        app.model.dmDonVi.upload(req.body.upload, error => res.send({ error }));
    });
    app.get('/api/danh-muc/don-vi/faculty', app.permission.check('user:login'), (req, res) => {
        let condition = {
            statement: '( maPl = :maPl AND kichHoat = 1 )',
            parameter: {
                maPl: 1
            },
        };
        if (req.query.condition) {
            condition = {
                statement: '(maPl = 1 AND kichHoat = 1) AND (lower(ten) LIKE :searchText)',
                parameter: {
                    searchText: `%${req.query.condition.toLowerCase()}%`
                },
            };
        }
        app.model.dmDonVi.getAll(condition, 'ma,ten', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/don-vi/diem-ren-luyen', app.permission.check('user:login'), async (req, res) => {
        try {
            const condition = req.query.condition?.toLowerCase();
            const items = await app.model.dmDonVi.getAll({
                statement: '((maPl = 1 OR ma = 42) AND kichHoat = 1) AND (lower(ten) LIKE :searchText)',
                parameter: {
                    searchText: `%${condition ?? ''}%`
                }
            }, 'ma,ten', 'ma',);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/danh-muc/don-vi/phan-loai/:maPl', (req, res) => {
        const condition = { maPl: req.params.maPl, kichHoat: 1 };
        app.model.dmDonVi.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/don-vi/dao-tao', app.permission.check('user:login'), async (req, res) => {
        try {
            let statement = 'kichHoat = 1', parameter = {}, { user } = req.session;
            if (!(Number(user.isPhongDaoTao) || user.permissions.includes('developer:login'))) {
                statement += ' AND ma = :maDonVi';
                parameter.maDonVi = user.maDonVi;
            }
            if (req.query.condition) {
                statement += ' AND (lower(ten) LIKE :searchText)';
                parameter.searchText = `%${req.query.condition.toLowerCase()}%`;
            }

            if (req.query.maPl) {
                statement += ' AND maPl = :maPl';
                parameter.maPl = req.query.maPl;
            }

            const items = await app.model.dmDonVi.getAll({
                statement, parameter,
            }, 'ma,ten', 'ma');

            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/don-vi/mon-hoc', app.permission.check('user:login'), async (req, res) => {
        try {
            let maDonVi = '', { user } = req.session;
            if (!req.query.isAllDonVi && !(Number(user.isPhongDaoTao) || user.permissions.includes('developer:login'))) {
                maDonVi = user.maDonVi;
            }

            const items = await app.model.dmMonHoc.getDonVi(app.utils.stringify({ searchTerm: req.query.condition, maDonVi })).then(item => item.rows);

            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/don-vi/filter', app.permission.check('user:login'), async (req, res) => {
        try {
            let { user } = req.session, filter = {},
                statement = '(maPl = 1)',
                parameter = {};

            if (req.query.condition) {
                statement += ' AND (lower(ten) LIKE :searchText)';
                parameter.searchText = `%${req.query.condition.toLowerCase()}%`;
            }

            await app.model.dtAssignRole.getDataRole(req.query.role, user, filter);
            if (filter.listDonViFilter) {
                statement += ' AND (ma IN (:listDonVi))';
                parameter.listDonVi = filter.listDonViFilter.split(',');
            }
            const items = await app.model.dmDonVi.getAll({ statement, parameter }, 'ma,ten');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/dmDonVi'));
    app.fs.createFolder(app.path.join(app.publicPath, '/img/dmDonViImage'));


    const uploadDmDonViImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonVi:') && files.DmDonViImage && files.DmDonViImage.length > 0) {
            console.log('Hook: uploadDmDonViImage => news image upload');
            app.uploadComponentImage(req, 'dmDonVi', app.model.dmDonVi, fields.userData[0].substring(8), files.DmDonViImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDmDonViImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImage(req, fields, files, params, done), done, 'dmDonVi:write'));

    //New Data
    const uploadDmDonViImageDisplay = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonViImage:') && files.DmDonViImageDisplay && files.DmDonViImageDisplay.length > 0) {
            console.log('Hook: uploadDmDonViImageDisplay => news image upload');
            const maDonVi = fields.userData[0].substring(13),
                srcPath = files.DmDonViImageDisplay[0].path;
            let image = '/img/dmDonVi/' + maDonVi + '_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dmDonVi.get({ ma: maDonVi }, (error, donVi) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (donVi) {
                        app.fs.deleteFile(srcPath);
                        if (donVi.imageDisplay) app.fs.deleteFile(app.path.join(app.publicPath, donVi.imageDisplay));
                        app.model.dmDonVi.update({ ma: maDonVi }, { imageDisplay: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };
    app.uploadHooks.add('uploadDmDonViImageDisplay', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImageDisplay(req, fields, files, params, done), done, 'dmDonVi:write'));

    const uploadDmDonViImageDisplayTA = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonViImageTA:') && files.DmDonViImageDisplayTA && files.DmDonViImageDisplayTA.length > 0) {
            console.log('Hook: uploadDmDonViImageDisplayTA => news image upload');
            const maDonVi = fields.userData[0].substring(15),
                srcPath = files.DmDonViImageDisplayTA[0].path;
            let image = '/img/dmDonVi/' + maDonVi + 'TA_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dmDonVi.get({ ma: maDonVi }, (error, donVi) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (donVi) {
                        app.fs.deleteFile(srcPath);
                        if (donVi.imageDisplayTa) app.fs.deleteFile(app.path.join(app.publicPath, donVi.imageDisplayTa));
                        app.model.dmDonVi.update({ ma: maDonVi }, { imageDisplayTa: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };
    app.uploadHooks.add('uploadDmDonViImageDisplayTA', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImageDisplayTA(req, fields, files, params, done), done, 'dmDonVi:write'));

    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    // app.readyHooks.add('readyDmDonVi', {
    //     ready: () => app.database.oracle.connected!= null &&  app.model.dmDonVi,
    //     run: () => app.model.dmDonVi.count((error, numberOfDonVi) => app.data.numberOfDonVi = error ? 0 : numberOfDonVi),
    // });
};