// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.svDrlGiaHanKhoa.notifyCtsv = async (data) => {
        const { emailDrl } = await app.model.svSetting.getValue('emailDrl');
        if (data.tinhTrang == 'A') {
            const notification = {
                toEmail: data.nguoiDangKy,
                title: 'Đăng ký gia hạn thời gian chấm điểm rèn luyện đã được chấp nhận',
                subTitle: 'Vui lòng đánh giá trước thời hạn kết thúc.',
                icon: 'fa-check',
                iconColor: 'success',
                link: '/user/khoa/quan-ly-drl'
            };
            app.notification.send(notification);
        } else if (data.tinhTrang == 'R') {
            const notification = {
                toEmail: data.nguoiDangKy,
                title: 'Đăng ký gia hạn thời gian chấm điểm rèn luyện đã bị từ chối',
                subTitle: 'Vui lòng vào trang đăng ký để xem lý do',
                icon: 'fa-times',
                iconColor: 'danger',
                link: '/user/khoa/quan-ly-drl'
            };
            app.notification.send(notification);
        } else {
            const notification = {
                toEmail: emailDrl,
                title: `Khoa ${data.tenKhoa} đã đăng ký gia hạn thời gian chấm điểm rèn luyện`,
                subTitle: 'Vui lòng kiểm tra',
                icon: 'fa-bell',
                iconColor: 'info',
                link: `/user/ctsv/dot-danh-gia-drl/edit/${data.idDot}`
            };
            await app.notification.send(notification);
        }
    };

    app.model.svDrlGiaHanKhoa.notifyStudents = async (data) => {
        let notification = {};
        if (data.tinhTrang == 'A') {
            notification = {
                title: 'Bạn đã được gia hạn đánh giá điểm rèn luyện',
                subTitle: 'Vui lòng đánh giá trước thời hạn kết thúc.',
                icon: 'fa-check',
                iconColor: 'success',
                link: '/user/danh-gia-drl'
            };
        } else if (data.tinhTrang == 'R') {
            notification = {
                title: 'Kiến nghị gia hạn điểm rèn luyện đã bị từ chối',
                subTitle: 'Bấm vào để chuyển đến trang kiến nghị.',
                icon: 'fa-times',
                iconColor: 'danger',
                link: '/user/danh-gia-drl'
            };
        }
        if (data.dsSinhVien && !Array.isArray(data.dsSinhVien)) {
            data.dsSinhVien = [data.dsSinhVien];
        }
        data.dsSinhVien && data.dsSinhVien.length && await Promise.all(data.dsSinhVien.map(mssv => {
            app.notification.send({ ...notification, toEmail: mssv.toString().toLowerCase() + '@hcmussh.edu.vn' });
        }));
    };
};