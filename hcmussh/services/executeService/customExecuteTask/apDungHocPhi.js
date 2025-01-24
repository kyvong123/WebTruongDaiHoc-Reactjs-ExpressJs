module.exports = app => {
    app.executeTask.apDungHocPhi = async ({ data }) => {
        let listAddSinhVienMonHoc = [];
        let listSinhVienAll = [];

        for (let loaiPhi of data.loaiPhi) {
            let { listSV, listSinhVienMonHoc } = await app.model.tcDotDong.apDungLoaiPhiPreview(data.idDotDong, loaiPhi, data.imssv, data.apDung, data.taiApDung, null, data.bacDaoTao, data.heDaoTao, data.khoaSinhVien);
            listAddSinhVienMonHoc = listAddSinhVienMonHoc.concat(listSinhVienMonHoc);
            listSinhVienAll = listSinhVienAll.concat(listSV);
        }

        await app.model.tcDotDong.apDungLoaiPhi(listSinhVienAll, listAddSinhVienMonHoc, data.hienThi);

        return {};
    };
};
