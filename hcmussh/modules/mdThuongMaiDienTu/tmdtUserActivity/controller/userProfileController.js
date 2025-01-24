module.exports = app => {
    const { tmdtUserSanPhamHomePage } = require('../../permission.js')();

    app.get('/api/tmdt/user/profile', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const user = req.session.user;
            const resultRows = (await app.model.tmdtYshopUser.getProfile(user.email)).rows;
            if (resultRows.length > 0) {
                res.send({ item: resultRows[0] });
            } else {
                res.send({ error: 'Không tìm thấy thông tin người dùng' });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/user/profile', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const user = req.session.user;
            const { contactInfo, paymentInfo, maTinhThanh, maQuanHuyen, maPhuongXa, duongSoNha, ghiChuDiaChi, phone } = req.body;
            const checkProfile = await app.model.tmdtYshopUser.get({ email: user.email });

            if (!checkProfile) {
                const item = await app.model.tmdtYshopUser.create({ ho: user.lastName, ten: user.firstName, email: user.email, phone: phone ?? user.dienThoai, contactInfo, paymentInfo, maTinhThanh, maQuanHuyen, maPhuongXa, duongSoNha, ghiChuDiaChi });
                res.send({ item });
            } else {
                res.send({ error: 'Thông tin người dùng đã tồn tại' });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/user/profile', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const { id, contactInfo, paymentInfo, maTinhThanh, maQuanHuyen, maPhuongXa, duongSoNha, ghiChuDiaChi, phone } = req.body;
            const item = await app.model.tmdtYshopUser.update({ id }, { phone, contactInfo, paymentInfo, maTinhThanh, maQuanHuyen, maPhuongXa, duongSoNha, ghiChuDiaChi });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};