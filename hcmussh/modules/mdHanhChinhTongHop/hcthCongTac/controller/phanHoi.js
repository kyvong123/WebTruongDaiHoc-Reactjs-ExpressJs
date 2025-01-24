module.exports = app => {
    app.post('/api/hcth/cong-tac/phan-hoi', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { noiDung, congTacItemId } = req.body.data;
            const shcc = req.session.user.shcc;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isReadable()) {
                throw 'Bạn không có quyền cập nhật cán bộ';
            }
            const phanHoi = await app.model.hcthPhanHoi.create({ canBoGui: shcc, noiDung, ngayTao: Date.now(), key: item.id, loai: 'LICH_HOP' });
            app.model.hcthCongTacLog.createLog(item.id, req);

            res.send({ phanHoi });

        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/phan-hoi/:congTacItemId', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacItem.getItem(req.params.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isReadable()) {
                throw 'Bạn không đủ quyền';
            }
            const { rows: items } = await app.model.hcthPhanHoi.getAllFrom(item.id, 'LICH_HOP');
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

};