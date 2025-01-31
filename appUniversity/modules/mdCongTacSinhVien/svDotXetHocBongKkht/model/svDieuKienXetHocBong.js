// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svDieuKienXetHocBong.foo = async () => { };
    app.model.svDieuKienXetHocBong.deleteCascade = async (condition) => {
        await app.model.svDieuKienXetHocBong.deleteDsNhom(condition);
        await app.model.svDieuKienXetHocBong.delete(condition);
    };

    app.model.svDieuKienXetHocBong.deleteDsNhom = async (condition) => {
        const ids = await app.model.svDieuKienXetHocBong.getAll(condition, 'id');
        const nhomIds = await app.model.svHocBongNhom.getAll({
            statement: 'idDieuKien in (:ids)',
            parameter: {
                ids: ids.length ? ids.map(dk => dk.id) : ['-1']
            }
        }, 'id');

        await Promise.all([
            app.model.svHocBongKhoa.delete({
                statement: 'idNhom in (:listNhom)',
                parameter: {
                    listNhom: nhomIds.length ? nhomIds.map(nhom => nhom.id) : ['-1']
                }
            }),
            app.model.svHocBongNganh.delete({
                statement: 'idNhom in (:listNhom)',
                parameter: {
                    listNhom: nhomIds.length ? nhomIds.map(nhom => nhom.id) : ['-1']
                }
            }),
            app.model.svHocBongNhom.delete({
                statement: 'idDieuKien in (:listDieuKien)',
                parameter: {
                    listDieuKien: ids.length ? ids.map(nhom => nhom.id) : ['-1']
                }
            }),

        ]);
    };
};