module.exports = app => {

    const MA_CTSV = '32';

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6108: { title: 'Loại biểu mẫu', icon: 'fa-file-text-o', link: '/user/ctsv/category-forms', groupIndex: 3 }
        }
    };

    app.permission.add(
        { name: 'svDmFormType:read', menu: menuCtsv },
        'svDmFormType:write',
        'svDmFormType:delete'
    );

    app.permissionHooks.add('staff', 'addRoleSvDmFormType', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_CTSV) {
            app.permissionHooks.pushUserPermission(user, 'svDmFormType:read', 'svDmFormType:write', 'svDmFormType:delete');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/category-forms', app.permission.check('svDmFormType:read'), app.templates.admin);
    app.get('/user/ctsv/category-forms/cau-hinh', app.permission.check('svDmFormType:read'), app.templates.admin);

    // API --------------------------------------------------------------------
    app.get('/api/ctsv/form-type/all', app.permission.check('svDmFormType:read'), async (req, res) => {
        try {
            let year = req.query.year,
                user = req.session.user;
            if (!user.permissions.includes('developer:login')) {
                // Cán bộ phòng CTSV / phòng SĐH
                if (user.staff.maDonVi == MA_CTSV) {
                    const heDaoTao = 'DH';
                    const data = await app.model.svDmFormType.getAll({ namHoc: year, heDaoTao }, '*', 'kichHoat desc');
                    const listParams = await app.model.fwParameter.getAll({ kichHoat: 1 }, 'bien,chuThich', 'model');
                    const listMaForm = data.map(item => item.ma);
                    const condition = listMaForm.length > 0 ? {
                        statement: 'maForm in (:listMaForm)',
                        parameter: { listMaForm: data.map(item => item.ma) }
                    } : [];
                    const customParamList = await app.model.svFormCustom.getAll(condition, '*', 'ID ASC');
                    data.map(item => {
                        item.customParam = customParamList.filter(param => param.maForm == item.ma);
                    });
                    res.send({ items: { data, listParams } });
                } else {
                    const heDaoTao = 'SDH';
                    const items = await app.model.svDmFormType.getAll({ namHoc: year, heDaoTao }, '*', 'kichHoat desc');
                    res.send({ items });
                }
            } else {
                const data = await app.model.svDmFormType.getAll({ namHoc: year }, '*', 'kichHoat desc');
                const listParams = await app.model.fwParameter.getAll({ kichHoat: 1 }, 'bien,chuThich');
                const listMaForm = data.map(item => item.ma);
                const condition = listMaForm.length > 0 ? {
                    statement: 'maForm in (:listMaForm)',
                    parameter: { listMaForm: data.map(item => item.ma) }
                } : [];
                const customParamList = await app.model.svFormCustom.getAll(condition, '*', 'ID ASC');
                data.map(item => {
                    item.customParam = customParamList.filter(param => param.maForm == item.ma);
                });
                res.send({ items: { data, listParams } });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/form-type/adapter', app.permission.check('svDmFormType:read'), async (req, res) => {
        try {
            const { kieuForm, namHoc } = req.query;
            const items = await app.model.svDmFormType.getAll({ kieuForm, namHoc, kichHoat: 1 });
            const condition = items.length > 0 ? {
                statement: 'maForm in (:listMaForm)',
                parameter: { listMaForm: items.map(item => item.ma) }
            } : {};
            const customParamList = await app.model.svFormCustom.getAll(condition, '*', 'ID ASC');
            items.map(item => {
                item.customParam = customParamList.filter(param => param.maForm == item.ma);
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/form-type/quyet-dinh', app.permission.check('svDmFormType:read'), async (req, res) => {
        try {
            const { kieuForm, namHoc } = req.query;
            let items = [];
            if (!kieuForm) {
                items = await app.model.svDmFormType.getAll({ statement: 'kieuForm in (1,2) and namHoc = :namHoc and kichHoat = 1', parameter: { namHoc } });
            } else if ([1, 2].includes(Number(kieuForm))) {
                items = await app.model.svDmFormType.getAll({ namHoc, kieuForm, kichHoat: 1 });
            }
            const condition = items.length > 0 ? {
                statement: 'maForm in (:listMaForm)',
                parameter: { listMaForm: items.map(item => item.ma) }
            } : {};
            const customParamList = await app.model.svFormCustom.getAll(condition, '*', 'ID ASC');
            items.map(item => {
                item.customParam = customParamList.filter(param => param.maForm == item.ma);
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/form-type/item', app.permission.orCheck('student:login', 'staff:login'), async (req, res) => {
        try {
            const { ma } = req.query;
            const item = await app.model.svDmFormType.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    const removeTrashFile = async (namHoc) => {
        let dir = app.path.join(app.assetPath, 'form-type', namHoc.toString());
        let allCurrentFile = await app.model.svDmFormType.getAll({ namHoc }, 'srcPath');
        allCurrentFile = allCurrentFile.map(item => item.srcPath);

        let allFilePathRemove = app.fs.readdirSync(dir)
            .filter(item => !allCurrentFile.includes(item))
            .map(item => app.path.join(dir, item));
        allFilePathRemove.forEach(path => app.fs.deleteFile(path));
    };

    app.post('/api/ctsv/form-type', app.permission.check('svDmFormType:write'), async (req, res) => {
        try {
            const data = req.body.data,
                user = req.session.user;
            if (!user.permissions.includes('developer:login')) {
                // Cán bộ phòng CTSV / phòng SĐH
                if (user.staff.maDonVi == MA_CTSV) {
                    const heDaoTao = 'DH';
                    const item = await app.model.svDmFormType.create({ ...data, heDaoTao });
                    let customParam = data.customParam ? data.customParam : [];
                    await Promise.all([
                        ...customParam.map(param => {
                            delete param.id;
                            return app.model.svFormCustom.create({ ...param, ma: param.maBien, maForm: item.ma });
                        })
                    ]);
                    res.send({ item });
                } else {
                    const heDaoTao = 'SDH';
                    const item = await app.model.svDmFormType.create({ ...data, heDaoTao });
                    let customParam = data.customParam ? data.customParam : [];
                    await Promise.all([
                        ...customParam.map(param => {
                            delete param.id;
                            return app.model.svFormCustom.create({ ...param, ma: param.maBien, maForm: item.ma });
                        })
                    ]);
                    res.send({ item });
                }
            } else {
                const item = await app.model.svDmFormType.create(data);
                let customParam = data.customParam ? data.customParam : [];
                await Promise.all([
                    ...customParam.map(param => {
                        delete param.id;
                        return app.model.svFormCustom.create({ ...param, ma: param.maBien, maForm: item.ma });
                    })
                ]);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/form-type', app.permission.check('svDmFormType:write'), async (req, res) => {
        try {
            const { changes, ma } = req.body,
                user = req.session.user,
                modifier = user.email, timeModified = Date.now();
            if (!user.permissions.includes('developer:login')) {
                // Cán bộ phòng CTSV / phòng SĐH
                if (user.staff.maDonVi == MA_CTSV) {
                    const heDaoTao = 'DH';
                    const item = await app.model.svDmFormType.update({ ma }, { ...changes, heDaoTao, modifier, timeModified });
                    if (changes.isSubmit) {
                        let customParam = changes.customParam ? changes.customParam : [];
                        await app.model.svFormCustom.delete({ maForm: ma });
                        await Promise.all([
                            ...customParam.map(item => {
                                delete item.id;
                                return app.model.svFormCustom.create({ ...item, ma: item.maBien, maForm: changes.ma });
                            })
                        ]);
                    }
                    res.send({ item });
                } else {
                    const heDaoTao = 'SDH';
                    const item = await app.model.svDmFormType.create({ ma }, { ...changes, heDaoTao, modifier, timeModified });
                    if (changes.isSubmit) {
                        let customParam = changes.customParam ? changes.customParam : [];
                        await app.model.svFormCustom.delete({ maForm: ma });
                        await Promise.all([
                            ...customParam.map(item => {
                                delete item.id;
                                return app.model.svFormCustom.create({ ...item, ma: item.maBien, maForm: changes.ma });
                            })
                        ]);
                    }
                    res.send({ item });
                }
            } else {
                const item = await app.model.svDmFormType.update({ ma }, changes);
                if (changes.isSubmit) {
                    let customParam = changes.customParam ? changes.customParam : [];
                    await app.model.svFormCustom.delete({ maForm: ma });
                    await Promise.all([
                        ...customParam.map(item => {
                            delete item.id;
                            return app.model.svFormCustom.create({ ...item, ma: item.maBien, maForm: changes.ma });
                        })
                    ]);
                }
                res.send({ item });
            }
            await removeTrashFile(changes.namHoc);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/form-type/multiple', app.permission.check('svDmFormType:write'), async (req, res) => {
        try {
            const data = req.body.data,
                namHoc = data[0].namHoc;
            let dsCustomParam = [];
            app.fs.createFolder(app.path.join(app.assetPath, 'form-type', namHoc));
            let listPromise = data.map(form => {
                if (form.customParam !== undefined) dsCustomParam = dsCustomParam.concat(form.customParam);
                const srcPath = app.path.join(app.assetPath, 'form-type', form.namHocGoc, form.srcPath), destPath = app.path.join(app.assetPath, 'form-type', form.namHoc, form.srcPath);
                if (app.fs.existsSync(srcPath)) {
                    app.fs.copyFile(srcPath, destPath, error => {
                        if (error) {
                            res.send({ error });
                        }
                    });
                }
                return app.model.svDmFormType.create(form);
            });
            await Promise.all(listPromise, dsCustomParam.map(param => {
                delete param.id;
                return app.model.svFormCustom.create(param);
            }));
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Upload hooks ----------------------------------------------------
    app.uploadHooks.add('fwFormTypeUpload', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwFormTypeUpload(req, fields, files, params, done), done, 'svDmFormType:write'));

    app.fs.createFolder(app.path.join(app.assetPath, 'form-type'));
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');

    const getValidParameter = async (content) => {
        // let regExp = /\{[a-zA-Z1-9]+?\}/g;
        let regExp = /\{.+?\}/g;
        let matches = content.match(regExp), result = [];
        if (!matches) throw 'Không tìm thấy bất kỳ biến nào!';
        for (let i = 0; i < matches.length; i++) {
            let str = matches[i],
                parameter = `{${str.substring(1, str.length - 1)}}`;
            //Biến tự nhập dạng <bien> không check database
            if (/\{[a-zA-Z1-9]+?\}/.test(parameter)) {
                const item = await app.model.fwParameter.get({ bien: parameter });
                if (!item) throw `Biến ${parameter} chưa được cấp. Vui lòng liên hệ developer!`;
                else result.push(parameter);
            } else {
                result.push(parameter);
            }
        }
        return result;
    };

    const fwFormTypeUpload = async (req, fields, files, params, done) => {
        try {
            if (files.FormTypeUpload && files.FormTypeUpload.length > 0) {
                const { namHoc, ma } = params;
                app.fs.createFolder(app.path.join(app.assetPath, 'form-type', namHoc));
                const file = files.FormTypeUpload[0],
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');
                const srcPath = files.FormTypeUpload[0].path,
                    destFolder = app.path.join(app.assetPath, 'form-type', namHoc),
                    destPath = app.path.join(destFolder, fileName);
                app.fs.renameSync(srcPath, destPath);

                const content = app.fs.readFileSync(destPath, 'binary');
                const zip = new PizZip(content);
                const doc = new Docxtemplater(zip);

                const contentUpload = doc.getFullText();
                let parameters = await getValidParameter(contentUpload);
                let user = req.session.user,
                    modifier = user.email,
                    timeModified = Date.now();
                if (ma) {
                    await app.model.svDmFormType.update({ ma }, { srcPath: fileName, parameters: parameters.toString(), modifier, timeModified });
                    done && done({ fileName, parameters, timeModified, modifier });
                    await removeTrashFile(namHoc);
                } else {
                    done && done({ fileName, parameters, timeModified, modifier });
                }

            }
        } catch (error) {
            done && done({ error });
        }
    };

    app.get('/api/ctsv/form-type/download', app.permission.check('svDmFormType:write'), async (req, res) => {
        try {
            let ma = req.query.ma;
            const item = await app.model.svDmFormType.get({ ma });
            if (!item) {
                res.send({ error: 'Không tồn tại form' });
            } else {
                const path = app.path.join(app.assetPath, 'form-type', item.namHoc.toString(), item.srcPath);
                if (app.fs.existsSync(path)) res.download(path, `${app.toEngWord(item.ten)}${app.path.extname(item.srcPath)}`);
                else res.send({ error: 'Không tồn tại form' });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};