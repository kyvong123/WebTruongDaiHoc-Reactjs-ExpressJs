// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svShcdLich.foo = async () => { };
    app.model.svShcdLich.deleteCascade = async (condition) => {
        const items = await app.model.svShcdLich.getAll(condition),
            listId = items.map(item => item.id);
        await app.model.svShcdLich.delete(condition);
        listId.length && (await Promise.all([
            app.model.svShcdLichSinhVien.delete({ statement: 'lichId in (:listId)', parameter: { listId } }),
            app.model.svShcdLichNganh.delete({ statement: 'lichId in (:listId)', parameter: { listId } }),
            app.model.svShcdMeetLink.delete({ statement: 'lichId in (:listId)', parameter: { listId } })
        ]));
    };

    app.model.svShcdLich.getListStudent = async (lichId) => {
        const lichData = await app.model.svShcdLich.get({ id: lichId });
        const [listNganh, dataShcd, listHeDaoTao] = await Promise.all([
            app.model.svShcdLichNganh.getAll({ lichId }),
            app.model.svSinhHoatCongDan.get({ id: lichData.shcdId }),
            app.model.svShcdNoiDungHdt.getAll({ noiDungId: lichData.noiDungId })
        ]);
        const { rows: items } = await app.model.fwStudent.searchAll('', app.utils.stringify({
            tinhTrang: 1, listKhoaSinhVien: dataShcd.khoaSinhVien,
            listHeDaoTao: listHeDaoTao.map(item => item.heDaoTao).toString(),
            listNganh: listNganh.map(item => item.maNganh).toString()
        }));
        return items;
    };
};