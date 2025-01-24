module.exports = app => {
    app.permission.add(
        'sdhTsLoaiBieuMau:manage', 'sdhTsLoaiBieuMau:write', 'sdhTsLoaiBieuMau:delete'
    );
    app.permissionHooks.add('staff', 'addRolesLoaiBieuMau', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhTsLoaiBieuMau:write', 'sdhTsLoaiBieuMau:delete', 'sdhTsLoaiBieuMau:manage');
            resolve();
        } else resolve();
    }));

    app.get('/api/sdh/tuyen-sinh/loai-bieu-mau/get', async (req, res) => {
        try {
            const { maPhanHe, maHinhThuc } = req.query;
            const item = await app.model.sdhTsLoaiBieuMau.get({ maPhanHe, maHinhThuc });
            if (item.id) {
                res.send({ item });
            } else {
                res.send({ error: 'Lỗi cấu hình loại biểu mẫu!' });
            }            
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};

