module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3003: { title: 'Form văn bản', link: '/user/tccb/form-van-ban', icon: 'fa-file-text-o', backgroundColor: '#4297ff', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'formVanBan:read', menu },
        { name: 'formVanBan:write' },
        { name: 'formVanBan:delete' },
    );
    app.get('/user/tccb/form-van-ban', app.permission.check('formVanBan:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleFormVanBan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'formVanBan:read', 'formVanBan:write', 'formVanBan:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/form-van-ban/all', app.permission.check('formVanBan:read'), async (req, res) => {
        try {
            const data = await app.model.tccbFormVanBan.getAll();
            const listParams = await app.model.fwParameterCanBo.getAll({ kichHoat: 1 }, 'bien,chuThich');
            const listMaForm = data.map(item => item.ma);
            const condition = listMaForm.length > 0 ? {
                statement: 'maForm in (:listMaForm)',
                parameter: { listMaForm: data.map(item => item.ma) }
            } : [];
            const customParamList = await app.model.tccbFormCustom.getAll(condition, '*', 'id ASC');
            data.map(item => {
                item.customParam = customParamList.filter(param => param.maForm == item.ma);
            });
            res.send({ items: { data, listParams } });
        } catch (error) {
            res.send({ error });
        }
    });


    const removeTrashFile = async () => {
        let dir = app.path.join(app.assetPath, 'form-van-ban');
        let allCurrentFile = await app.model.tccbFormVanBan.getAll('srcPath');
        allCurrentFile = allCurrentFile.map(item => item.srcPath);

        let allFilePathRemove = app.fs.readdirSync(dir)
            .filter(item => !allCurrentFile.includes(item))
            .map(item => app.path.join(dir, item));
        allFilePathRemove.forEach(path => app.fs.deleteFile(path));
    };

    app.post('/api/tccb/form-van-ban', app.permission.check('formVanBan:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.tccbFormVanBan.create(data);
            let customParam = data.customParam ? data.customParam : [];
            await Promise.all([
                ...customParam.map(param => {
                    delete param.id;
                    return app.model.tccbFormCustom.create({ ...param, ma: param.maBien, maForm: item.ma });
                })
            ]);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/form-van-ban', app.permission.check('formVanBan:write'), async (req, res) => {
        try {
            const { changes, ma } = req.body,
                user = req.session.user,
                modifier = user.email, timeModified = Date.now();
            const item = await app.model.tccbFormVanBan.update({ ma }, { ...changes, modifier, timeModified });
            let customParam = changes.customParam ? changes.customParam : [];
            await app.model.tccbFormCustom.delete({ maForm: ma });
            await Promise.all([
                ...customParam.map(item => {
                    delete item.id;
                    return app.model.tccbFormCustom.create({ ...item, ma: item.maBien, maForm: changes.ma });
                })
            ]);
            res.send({ item });
            // }
            await removeTrashFile(changes);
        } catch (error) {
            res.send({ error });
        }
    });

    // Upload hooks ----------------------------------------------------
    app.uploadHooks.add('fwFormVanBanUpload', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwFormVanBanUpload(req, fields, files, params, done), done, 'formVanBan:write'));

    app.fs.createFolder(app.path.join(app.assetPath, 'form-van-ban'));
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');

    const getValidParameter = async (content) => {
        let regExp = /\{.+?\}/g;
        let matches = content.match(regExp), result = [];
        if (!matches) throw 'Không tìm thấy bất kỳ biến nào!';
        for (let i = 0; i < matches.length; i++) {
            let str = matches[i],
                parameter = `{${str.substring(1, str.length - 1)}}`;
            if (/\{[a-zA-Z1-9]+?\}/.test(parameter)) {
                const item = await app.model.fwParameterCanBo.get({ bien: parameter });
                if (!item) throw `Biến ${parameter} chưa được cấp. Vui lòng liên hệ developer!`;
                else result.push(parameter);
            } else {
                result.push(parameter);
            }
        }
        return result;
    };

    const fwFormVanBanUpload = async (req, fields, files, params, done) => {
        try {
            if (files.FormVanBanUpload && files.FormVanBanUpload.length > 0) {
                const { ma } = params;
                app.fs.createFolder(app.path.join(app.assetPath, 'form-van-ban'));
                const file = files.FormVanBanUpload[0],
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');
                const srcPath = files.FormVanBanUpload[0].path,
                    destFolder = app.path.join(app.assetPath, 'form-van-ban'),
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
                    await app.model.tccbFormVanBan.update({ ma }, { srcPath: fileName, parameters: parameters.toString(), modifier, timeModified });
                    done && done({ fileName, parameters, timeModified, modifier });
                    await removeTrashFile();
                } else {
                    done && done({ fileName, parameters, timeModified, modifier });
                }

            }
        } catch (error) {
            done && done({ error });
        }
    };

    app.get('/api/tccb/form-van-ban/download', app.permission.check('formVanBan:write'), async (req, res) => {
        try {
            let ma = req.query.ma;
            const item = await app.model.tccbFormVanBan.get({ ma });
            if (!item) {
                res.send({ error: 'Không tồn tại form' });
            } else {
                const path = app.path.join(app.assetPath, 'form-van-ban', item.srcPath);
                if (app.fs.existsSync(path)) res.download(path, `${item.ten}${app.path.extname(item.srcPath)}`);
                else res.send({ error: 'Không tồn tại form' });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};