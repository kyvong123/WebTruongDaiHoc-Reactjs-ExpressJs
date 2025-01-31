module.exports = (app) => {
    const { userAddNotification, getEmailFromShcc, userUpdateStatusNotification } = require('../tools')(app);
    app.put('/api/hcth/cong-tac/can-bo/trang-thai', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const { trangThai } = req.body.changes;
            const { congTacItemId } = req.body;
            const shcc = req.session.user?.shcc;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);

            await app.model.hcthCanBoNhan.update({ ma: item.id, loai: 'CONG_TAC_ITEM', canBoNhan: shcc }, { trangThai });
            app.model.hcthCongTacLog.createLog(item.id, req);
            userUpdateStatusNotification(item, `${req.session.user.lastName} ${req.session.user.firstName}`.normalizedName(), trangThai, await getEmailFromShcc(app.model.hcthCongTacItem.getInchargeStaff(item)));
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/can-bo', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const { congTacItemId, canBoNhan } = req.body;
            const lichHop = await app.model.hcthCongTacItem.getItem(congTacItemId);
            const userShcc = req.session.user.shcc;
            if (![lichHop.chuTri, lichHop.nguoiTao].includes(userShcc) && !req.session.user.permissions.includes('hcthCongTac:write')) {
                throw 'Bạn ko đủ quyền xóa cán bộ';
            }
            await app.model.hcthCanBoNhan.delete({ ma: lichHop.id, canBoNhan, loai: 'CONG_TAC_ITEM' });
            app.model.hcthCongTacLog.createLog(lichHop.id, req);
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/can-bo/:id', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const { rows: items } = await app.model.hcthCanBoNhan.getAllFrom(Number(req.params.id), 'CONG_TAC_ITEM');
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/can-bo', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const { vaiTro } = req.body.changes;
            const { congTacItemId, shcc } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật cán bộ';
            }
            await app.model.hcthCanBoNhan.update({ ma: congTacItemId, loai: 'CONG_TAC_ITEM', canBoNhan: shcc }, { vaiTro });
            app.model.hcthCongTacLog.createLog(item.id, req);

            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-tac/can-bo/invite', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { shcc, congTacItemId } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật cán bộ';
            }

            if (!shcc) {
                //  gửi mời tất cả cán bộ
                userAddNotification(item, `${req.session.user.lastName} ${req.session.user.firstName}`.normalizedName(), await getEmailFromShcc(item.thanhPhan.map(i => i.shccCanBoNhan)));
                await app.model.hcthCanBoNhan.update({
                    statement: 'ma = :congTacItemId and trangThai = :trangThaiCanBo and loai=:loai',
                    parameter: {
                        congTacItemId, trangThaiCanBo: 'PENDING', loai: 'CONG_TAC_ITEM'
                    }
                }, { trangThai: 'INVITED', });
            } else {
                userAddNotification(item, `${req.session.user.lastName} ${req.session.user.firstName}`.normalizedName(), await getEmailFromShcc([shcc]));
                await app.model.hcthCanBoNhan.update({
                    statement: 'ma = :congTacItemId and trangThai = :trangThaiCanBo and canBoNhan =:shcc and loai=:loai',
                    parameter: {
                        congTacItemId, trangThaiCanBo: 'PENDING', shcc, loai: 'CONG_TAC_ITEM'
                    }
                }, { trangThai: 'INVITED', });
            }
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-tac/can-bo', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { shccList, vaiTro, congTacItemId } = req.body.data;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật cán bộ';
            }
            if (vaiTro == 'CHU_TRI' && shccList.length > 1) {
                throw 'Lịch họp chỉ được một chủ trì';
            }
            let duplicate = await app.model.hcthCanBoNhan.get({
                statement: 'canBoNhan in (:shccList) and loai=:loaiCanBo and ma=:idLichHop',
                parameter: {
                    idLichHop: Number(congTacItemId), loaiCanBo: 'CONG_TAC_ITEM', shccList
                }
            });
            if (duplicate) {
                throw `Cán bộ ${duplicate.canBoNhan} đã có trong lịch họp`;
            }
            const maxOrdinal = await app.model.hcthCanBoNhan.get({ ma: congTacItemId, loai: 'CONG_TAC_ITEM' }, 'ordinal', 'ordinal desc').then(i => i ? i.ordinal + 1 : 0);
            const items = await app.model.hcthCanBoNhan.listCreate(shccList.map((i, index) => ({
                canBoNhan: i, loai: 'CONG_TAC_ITEM', 'ma': congTacItemId, vaiTro, nguoiTao: req.session.user.shcc, trangThai: 'PENDING', ordinal: maxOrdinal + index
            })));
            app.model.hcthCongTacLog.createLog(item.id, req);

            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/can-bo/ordinal', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { congTacItemId, updateList } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật cán bộ';
            }
            await Promise.all(updateList.map(async ({ id, ordinal }) => {
                await app.model.hcthCanBoNhan.update({ ma: item.id, id }, { ordinal });
            }));
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('DsCanBoThamGia', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadListCanBo(req, fields, files, params, done), done, 'staff:login'));

    const uploadListCanBo = async (req, fields, files, params, done) => {
        if (files.DsCanBoThamGia?.length) {
            try {
                const srcPath = files.DsCanBoThamGia[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (!workbook) throw 'No workbook!';
                app.fs.deleteFile(srcPath);
                let worksheet = workbook.getWorksheet(1);
                if (!worksheet) throw 'No worksheet!';
                const items = [];
                const failed = [];
                let index = 2;
                while (true) {
                    if (!worksheet.getCell('A' + index).text) {
                        done && done({ items, failed });
                        break;
                    }
                    const shcc = worksheet.getCell('A' + index).text?.toString().trim() || '';
                    const item = await app.model.tchcCanBo.get({ shcc });
                    if (!item) {
                        failed.push({ index, message: `Không tìm thấy mã cán hộ ${shcc}!` });
                    } else {
                        items.push(shcc);
                    }
                    index++;
                }
                console.log({ items, failed });
                done && done({ items, failed });
            }
            catch (error) {
                console.error(req.method, req.url, error);
                done && done({ error });
            }

        }
    };
};