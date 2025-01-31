module.exports = app => {
    app.permission.add('hcthVanBanDiStatusSystemDetail:write', 'hcthVanBanDiStatusSystemDetail:manage', 'hcthVanBanDiStatusSystemDetail:delete');

    const checkArray = (data) => {
        if (!Array.isArray(data))
            return [];
        return data;
    };

    const arrayKey = app.model.hcthCongVanDi.statusArrayKey;

    app.post('/api/hcth/trang-thai-van-ban-di/detail', app.permission.check('hcthVanBanDiStatusSystemDetail:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthVanBanDiStatusDetail.create(data);
            await Promise.all(arrayKey.map(async key => {
                const items = checkArray(data[key]).map(maDoiTuong => ({ maDoiTuong, loai: key, trangThaiId: item.id }));
                await app.model.hcthDoiTuongTrangThai.bulkCreate(items);
            }));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/trang-thai-van-ban-di/detail/item/:id', app.permission.check('hcthVanBanDiStatusSystemDetail:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const changes = req.body.changes;
            delete changes.id;
            delete changes.systemId;
            let item;
            if (!parseInt(id) || !(item = await app.model.hcthVanBanDiStatusDetail.get({ id }))) {
                throw 'Dữ liệu không tồn tại';
            }
            await Promise.all(arrayKey.map(async key => {
                await app.model.hcthDoiTuongTrangThai.delete({ loai: key, trangThaiId: item.id });
                const items = checkArray(changes[key]).map(maDoiTuong => ({ maDoiTuong, loai: key, trangThaiId: item.id }));
                delete changes[key];
                await app.model.hcthDoiTuongTrangThai.bulkCreate(items);
            }));
            item = await app.model.hcthVanBanDiStatusDetail.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/trang-thai-van-ban-di/detail/item/:id', app.permission.orCheck('hcthVanBanDiStatusSystemDetail:write', 'staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            let item;
            if (!parseInt(id) || !(item = await app.model.hcthVanBanDiStatusDetail.get({ id }))) {
                throw 'Dữ liệu không tồn tại';
            }
            await Promise.all(arrayKey.map(async key => {
                const data = await app.model.hcthDoiTuongTrangThai.getAll({ loai: key, trangThaiId: item.id });
                item[key] = data.map(i => i.maDoiTuong);
            }));
            item.trangThaiObject = await app.model.hcthVanBanDiStatus.get({ ma: item.trangThai });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/trang-thai-van-ban-di/detail/item/:systemId/:trangThai', app.permission.orCheck('hcthVanBanDiStatusSystemDetail:write', 'staff:login'), async (req, res) => {
        try {
            const { systemId, trangThai } = req.params;
            let item;
            if (!parseInt(systemId) || !(item = await app.model.hcthVanBanDiStatusDetail.get({ systemId, trangThai }))) {
                throw 'Dữ liệu không tồn tại';
            }
            await Promise.all(arrayKey.map(async key => {
                const data = await app.model.hcthDoiTuongTrangThai.getAll({ loai: key, trangThaiId: item.id });
                item[key] = data.map(i => i.maDoiTuong);
            }));
            item.trangThaiObject = await app.model.hcthVanBanDiStatus.get({ ma: item.trangThai });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/trang-thai-van-ban-di/detail/item/:id', app.permission.check('hcthVanBanDiStatusSystemDetail:write'), async (req, res) => {
        try {
            const id = req.params.id;
            let item;
            if (!parseInt(id) || !(item = await app.model.hcthVanBanDiStatusDetail.get({ id }))) {
                throw 'Dữ liệu không tồn tại';
            }
            await app.model.hcthVanBanDiStatusDetail.delete({ id: item.id });
            await app.model.hcthDoiTuongTrangThai.delete({ trangThaiId: item.id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });


};