// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svQuanLyLop.foo = () => { };
    app.model.svQuanLyLop.getBanCanSu = async (maLop) => {
        try {
            let items = await app.model.svQuanLyLop.getAll({ maLop }, '*', 'maChucVu ASC'),
                dsChuNhiem = items.filter(item => item.maChucVu == 'CN'),
                dsBanCanSu = items.filter(item => item.maChucVu != 'CN');
            let [dsChuNhiemSelect, dsBanCanSuSelect] = await Promise.all([
                app.model.tchcCanBo.getAll({
                    statement: 'shcc in (:dsShcc)',
                    parameter: { dsShcc: dsChuNhiem.length ? dsChuNhiem.map(item => item.userId) : ['-1'] }
                }, 'shcc,ho,ten'),
                app.model.fwStudent.getAll({
                    statement: 'mssv in (:dsMssv)',
                    parameter: { dsMssv: dsBanCanSu.length ? dsBanCanSu.map(item => item.userId) : ['-1'] }
                }, 'mssv,ho,ten'),
            ]);
            items.forEach(doiTuong => {
                if (doiTuong.maChucVu == 'CN') {
                    doiTuong.hoTen = dsChuNhiemSelect.find(item => item.shcc == doiTuong.userId);
                } else doiTuong.hoTen = dsBanCanSuSelect.find(item => item.mssv == doiTuong.userId);
            });
            return items;
        } catch (error) {
            return [];
        }
    };

    app.model.svQuanLyLop.createBanCanSu = async (data) => {
        let { userId, maChucVu, maLop } = data;
        let [userRoles, chucVu] = await Promise.all([
            app.model.svQuanLyLop.getAllBanCanSu(maLop, app.utils.stringify({ userId })).then(ref => ref.rows),
            app.model.svDmCanBoLop.get({ ma: maChucVu }),
        ]);
        if (userRoles.some(i => i.maChucVu == maChucVu)) throw 'Trùng lặp chức vụ!';
        if (chucVu.isMain && userRoles.some(i => i.isMain == 1)) throw 'Đối tượng đã có một chức vụ chính';
        let item = await app.model.svQuanLyLop.create(data);
        return item;
    };
};