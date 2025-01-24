// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtAssignRoleNhapDiem.foo = async () => { };
    app.model.dtAssignRoleNhapDiem.parseData = async (filter, _pageNumber = 1, _pageSize = 25) => {
        let items = await app.model.dtAssignRoleNhapDiem.getData(_pageNumber, _pageSize, app.utils.stringify(filter));
        items = items.rows.map((item) => {
            const tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
            return {
                ...item, totalItem: items.totalitem, pageTotal: items.pagetotal, pageNumber: items.pagenumber, pageSize: items.pagesize,
                tpDiem: tpDiem ? app.utils.parse(tpDiem) : [],
                roleNhapDiem: item.roleNhapDiem ? app.utils.parse(item.roleNhapDiem) : [],
                exam: item.exam ? app.utils.parse(item.exam) : [],
            };
        });
        items = items.flatMap(item => {
            const { maHocPhan, maMonHoc, tenMonHoc, namHoc, hocKy, loaiHinhDaoTao, tpDiem, exam, roleNhapDiem, giangVien, countDiem, tenGiangVien, totalItem, pageTotal, pageNumber, pageSize, maLop, tenDonVi } = item,
                data = { maHocPhan, maMonHoc, tenMonHoc, namHoc, hocKy, loaiHinhDaoTao, roleNhapDiem, giangVien, countDiem, tenGiangVien, tpDiem, totalItem, pageTotal, pageNumber, pageSize, maLop, tenDonVi };
            if (!tpDiem.length) return data;
            else {
                let tpCuoiKy = tpDiem.filter(i => i.thanhPhan == 'CK'),
                    tpQuaTrinh = tpDiem.filter(i => i.thanhPhan != 'CK');

                tpQuaTrinh.sort((a, b) => Number(a.priority) - Number(b.priority));

                tpQuaTrinh = tpQuaTrinh.slice(0, 1);

                return [...tpCuoiKy, ...tpQuaTrinh].flatMap(tp => {
                    let listExam = exam.filter(ex => ex.kyThi == tp.thanhPhan);
                    if (listExam.length) {
                        return listExam.map(ex => {
                            const { caThi, phong, batDau, ketThuc, idExam } = ex,
                                { thanhPhan, tenThanhPhan, phanTram } = tp;
                            return { ...data, caThi, phong, batDau, ketThuc, thanhPhan, tenThanhPhan, idExam, phanTram, roleNhapDiem: roleNhapDiem.filter(i => i.idExam == idExam) };
                        });
                    } else {
                        const { thanhPhan, tenThanhPhan, phanTram } = tp;
                        return { ...data, thanhPhan, tenThanhPhan, phanTram, roleNhapDiem: roleNhapDiem.filter(i => i.kyThi == thanhPhan) };
                    }
                });
            }
        });
        return items;
    };

    app.model.dtAssignRoleNhapDiem.updateThanhPhan = async ({ maHocPhan, maMonHoc, namHoc, hocKy }) => {
        const dataAssign = await app.model.dtAssignRoleNhapDiem.getAll({ maHocPhan, maMonHoc }, 'namHoc, maHocPhan, maMonHoc, hocKy, kyThi, idExam, loaiHinhDaoTao, shcc, userModified, timeModified');

        await app.model.dtAssignRoleNhapDiem.delete({ maHocPhan, maMonHoc });
        let listTpAssign = await app.model.dtAssignRoleNhapDiem.parseData({ maHocPhan, namHoc, hocKy });
        for (let data of listTpAssign.filter(i => i.thanhPhan)) {

            if (data.thanhPhan == 'CK') {
                await Promise.all(dataAssign.filter(i => data.idExam ? (i.idExam == data.idExam) : (i.kyThi == 'CK')).map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign })));
            } else {
                let list = dataAssign.filter(i => i.kyThi != 'CK');
                if (data.thanhPhan != 'GK') {
                    list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
                    await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, idExam: '', kyThi: data.thanhPhan })));
                }
                else {
                    list = list.filter(i => !i.idExam || i.idExam == data.idExam);
                    list = list.filter((value, index, self) => self.findIndex(id => id.shcc == value.shcc) === index);
                    await Promise.all(list.map(assign => app.model.dtAssignRoleNhapDiem.create({ ...assign, kyThi: 'GK', idExam: data.idExam || '' })));
                }
            }
        }
    };
};