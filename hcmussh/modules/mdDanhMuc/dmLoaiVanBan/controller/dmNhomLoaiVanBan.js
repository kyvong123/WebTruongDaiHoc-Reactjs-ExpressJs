module.exports = app => {
    app.permission.add('dmNhomLoaiVanBan:read', 'dmNhomLoaiVanBan:write', 'dmNhomLoaiVanBan:delete');

    app.get('/api/danh-muc/loai-van-ban/nhom/all', app.permission.check('dmNhomLoaiVanBan:read'), async (req, res) => {
        try {
            const items = await app.model.dmNhomLoaiVanBan.getAll();
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/loai-van-ban/nhom/item/:ma', app.permission.check('dmNhomLoaiVanBan:read'), async (req, res) => {
        try {
            const item = await app.model.dmNhomLoaiVanBan.get({ ma: req.params.ma });
            if (!item) throw 'Nhóm không tồn tại';
            item.items = await app.model.dmNhomLoaiVanBan.getItems(item.ma).then(res => res.rows);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/loai-van-ban/nhom', app.permission.check('dmNhomLoaiVanBan:write'), async (req, res) => {
        try {
            const data = req.body;
            const item = await app.model.dmNhomLoaiVanBan.create(data);
            const loaiVanBanItems = await app.model.dmLoaiVanBan.getAll();
            if (loaiVanBanItems.length)
                await Promise.all(loaiVanBanItems.map(async (loaiVanBan) => {
                    return await app.model.dmNhomLoaiVanBanItem.create({ maNhom: item.ma, nhomOrdinal: 1, maLoaiVanBan: loaiVanBan.ma });
                }));
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/danh-muc/loai-van-ban/nhom', app.permission.check('dmNhomLoaiVanBan:write'), async (req, res) => {
        try {
            const { ma, ...data } = req.body;
            const item = await app.model.dmNhomLoaiVanBan.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/loai-van-ban/nhom/item', app.permission.check('dmNhomLoaiVanBan:write'), async (req, res) => {
        try {
            const { itemData: { maNhom, maLoaiVanBan }, mode } = req.body;
            const item = await app.model.dmNhomLoaiVanBanItem.get({ maNhom, maLoaiVanBan });
            if (!item) {
                throw 'Loại văn bản không tồn tại';
            }
            let newOrdinal = null;
            if (mode == 'increase') {
                const nextOrdinal = await app.model.dmNhomLoaiVanBanItem.get({
                    statement: 'maNhom = :maNhom and nhomOrdinal > :ordinal',
                    parameter: { maNhom, ordinal: item.nhomOrdinal }
                }, 'nhomOrdinal', 'nhomOrdinal asc');
                if (!nextOrdinal) {
                    newOrdinal = item.nhomOrdinal + 1;
                } else {
                    newOrdinal = nextOrdinal.nhomOrdinal;
                }
            } else if (mode == 'decrease') {
                const nextOrdinal = await app.model.dmNhomLoaiVanBanItem.get({
                    statement: 'maNhom = :maNhom and nhomOrdinal < :ordinal',
                    parameter: { maNhom, ordinal: item.nhomOrdinal }
                }, 'nhomOrdinal', 'nhomOrdinal desc');
                if (!nextOrdinal) {
                    newOrdinal = item.nhomOrdinal - 1;
                } else {
                    newOrdinal = nextOrdinal.nhomOrdinal;
                }
            }

            if (newOrdinal == null || newOrdinal < 1) {
                throw 'Thao tác không hợp lệ';
            } else if (item.nhomOrdinal == 1) {
                const items = await app.model.dmNhomLoaiVanBanItem.getAll({ maNhom: maNhom, nhomOrdinal: 1 });
                if (items.length == 1)
                    throw 'Phân nhóm 1 không được trống';
            }

            await app.model.dmNhomLoaiVanBanItem.update({ ...item }, { nhomOrdinal: newOrdinal });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};