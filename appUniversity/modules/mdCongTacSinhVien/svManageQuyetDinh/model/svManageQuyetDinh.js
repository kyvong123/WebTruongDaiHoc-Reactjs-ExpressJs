// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svManageQuyetDinh.foo = () => { };
    app.model.svManageQuyetDinh.initForm = async (id) => {
        let { rows: [formData] } = await app.model.svManageQuyetDinh.getData(id);
        if (!formData) throw 'Không tồn tại mã đăng ký!';
        else {
            const source = app.path.join(app.assetPath, 'form-type', formData.namHoc, formData.tenFile);
            let { rows: [data = {}] } = await app.model.fwStudent.getDataForm(formData.mssv, id, formData.kieuForm);
            let customParam = formData.dataCustom ? JSON.parse(formData.dataCustom) : {};
            data = app.clone({}, data, customParam, formData);
            Object.keys(data).forEach(key => { data[key] = data[key] ?? ''; });
            const buffer = await app.docx.generateFile(source, data);
            return { buffer, filename: `${formData.maForm}_${formData.mssv}` };
        }
    };



    app.model.svManageQuyetDinh.saveForm = async (id, type, destPath) => {
        try {
            // 0: Chứng nhận
            // 1: Quyết định
            let buffer;
            switch (type) {
                case 0:
                    ({ buffer } = await app.model.svManageForm.initForm(id));
                    break;
                case 1:
                    ({ buffer } = await app.model.svManageQuyetDinh.initForm(id));
                    break;
                default:
                    throw 'Type không hợp lệ';
            }
            if (buffer) {
                app.fs.writeFileSync(destPath, buffer);
                return true;
            }
            throw 'Không tạo được buffer';
        } catch (error) {
            console.error(error);
            return false;
        }
    };
};