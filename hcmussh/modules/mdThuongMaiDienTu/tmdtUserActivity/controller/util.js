module.exports = (app) => ({
    sendNotificationToSeller: async (maDaiLy, { maDon, trangThai, userEmail }) => {
        const thanhVienDaiLy = await app.model.tmdtThanhVienDaiLy.getAll({ maDaiLy });
        let title, subTitle;
        switch (trangThai.toString()) {
            case '1':
                title = 'Bạn nhận được đơn hàng mới';
                subTitle = `Đơn hàng #${maDon} vừa được đặt bởi ${userEmail}`;
                break;
            case '4':
                title = 'Hoàn tất đơn hàng mới';
                subTitle = `Đơn hàng #${maDon} đã được xác nhận hoàn tất`;
                break;
        }
        if (title) {
            for (const { email } of thanhVienDaiLy) {
                const newNotification = { email, notificationCategory: 'Y-Shop', title, subTitle, icon: 'fa-check', iconColor: '#28a745', targetLink: '', buttonLink: '', sendTime: new Date().getTime() };
                app.model.fwNotification.create(newNotification);
            }

            app.firebase.sendToEmails({ listEmail: thanhVienDaiLy.map(thanhVien => thanhVien.email), title, body: subTitle });
        }
    }
});