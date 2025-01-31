// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svManageMienGiam.foo = () => { };
    app.model.svManageMienGiam.initForm = async (id) => {
        let { dssinhvien: dsSinhVien, rows: [formData] } = await app.model.svManageMienGiam.getData(id);
        // let dsSinhVien = formData.dssinhvien.filter(item => (item.namHoc == namHoc && item.hocKy == hocKy)).map((sv, index) => ({ ...sv, stt: index + 1 }));
        if (!formData) {
            throw 'Không tồn tại mã đăng ký!';
        } else {
            const source = app.path.join(app.assetPath, 'form-type', formData.namHoc, formData.tenFile);
            let data = {
                ...formData,
                dsSinhVien,
                soLuongSinhVien: `${dsSinhVien.length.toString().padStart(2, '0')} (${app.utils.numberToVnText(dsSinhVien.length)} )`
            };
            data = app.clone({}, data);
            const buffer = await app.docx.generateFile(source, data);
            return buffer;
        }
    };
};