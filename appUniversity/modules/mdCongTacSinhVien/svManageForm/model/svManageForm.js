// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svManageForm.foo = () => { };
    app.model.svManageForm.initForm = async (id) => {
        let { rows: [formData] } = await app.model.svManageForm.getData(id);
        if (!formData) {
            throw 'Không tồn tại mã đăng ký!';
        } else {
            const source = app.path.join(app.assetPath, 'form-type', formData.namHoc, formData.tenFile);
            let { rows: [data] } = await app.model.fwStudent.getDataForm(formData.mssv, id, formData.kieuForm);
            data.drl = data.drl ? JSON.parse(data.drl) : '';
            let customData = formData.dataCustom ? JSON.parse(formData.dataCustom) : {};
            let customParam = formData.paramCustom ? JSON.parse(formData.paramCustom) : [];
            customParam.forEach(param => data[param] = ''); //Th những form trước chưa được kê khai biến, khởi tạo là biến rỗng
            data = app.clone({}, data, customData);
            Object.keys(data).forEach(key => {
                data[key] = data[key] ?? '';
            });
            const buffer = await app.docx.generateFile(source, data);
            return { buffer, filename: `${formData.maForm}_${formData.mssv}` };
        }
    };
};