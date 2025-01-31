// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtAssignRole.foo = async () => { };
    app.model.dtAssignRole.getDataRole = async (role, user, filter) => {
        if (role) {
            if (user.permissions.includes('developer:login')) return;
            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc: user.shcc, role: `%${role}%` }
            });


            if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
                filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
                filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
            }

            if (!Number(user.isPhongDaoTao)) {
                let listKhoa = roles.filter(i => i.khoa).flatMap(i => i.khoa.split(','));
                listKhoa.push(user.maDonVi);
                filter.listDonViFilter = [...new Set(listKhoa)].toString();
            }
        }
    };
};