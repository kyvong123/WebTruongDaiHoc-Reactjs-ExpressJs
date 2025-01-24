// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svDrlKienNghiGiaHan.foo = async () => { };

    app.model.svDrlKienNghiGiaHan.giaHanSinhVien = async (req, data) => {
        const { mssv, timeEnd, idDot, reset, notify } = data,
            user = req.session.user,
            now = Date.now();
        await app.model.svDrlKienNghiGiaHan.create({ mssv, idDot, timeEnd, timeSubmit: now, timeStart: now, timeHandle: now, tinhTrang: 'A', staffHandle: user.email, isReset: reset, isNotify: notify });
        await Promise.all([
            reset == 1 && app.model.svDrlDanhGia.resetDiem(mssv, idDot),
            notify == 1 && app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: 'A', mssv }),
        ]);
    };

    app.model.svDrlKienNghiGiaHan.chapNhanKienNghi = async (req, data) => {
        let { id, idDot, timeEnd, reset, notify } = data,
            user = req.session.user;
        const now = Date.now();
        if (id && !Array.isArray(id)) {
            id = [id];
        }
        if (id && id.length) {
            let condition = {
                statement: 'id in (:id)',
                parameter: { id }
            };
            const dsSinhVien = await app.model.svDrlKienNghiGiaHan.getAll(condition, 'mssv').then(list => list.map(item => item.mssv));
            await app.model.svDrlKienNghiGiaHan.update({
                statement: 'id in (:id)',
                parameter: { id }
            }, {
                timeStart: now, timeEnd, tinhTrang: 'A', timeHandle: now, staffHandle: user.email
            }).catch(error => {
                console.error('Chap nhan kien nghi: Invalid id', app.utils.stringify({ data }));
                throw error;
            });
            await Promise.all([
                reset == 1 && app.model.svDrlDanhGia.resetDiem(dsSinhVien, idDot),
                notify == 1 && app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: 'A', dsSinhVien }),
            ]);
        }
    };

    app.model.svDrlKienNghiGiaHan.notifyCanBoQuanLy = async (user) => {
        const { khoa: faculty, khoaSV, loaiHinhDaoTao } = user.data;
        const canBoQuanLy = [];
        canBoQuanLy.push(await app.model.qtChucVu.getTruongKhoaEmail(faculty));
        canBoQuanLy.push(...(await app.model.tccbDrlRole.getStaffs(khoaSV.toString(), loaiHinhDaoTao.toString())));
        await Promise.all([
            ...canBoQuanLy.map(email => app.notification.send({
                toEmail: email,
                title: 'Sinh viên yêu cầu gia hạn đánh giá ĐRL',
                icon: 'fa-info',
                iconColor: 'info',
                subTitle: 'Vui lòng vào trang ',
                link: '/user/khoa/quan-ly-drl'
            }))
        ]);
    };
};