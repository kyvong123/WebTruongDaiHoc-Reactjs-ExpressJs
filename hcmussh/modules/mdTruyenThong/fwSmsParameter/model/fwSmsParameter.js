// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwSmsParameter.foo = () => { };
    const xoaDau = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        return str;
    };
    app.model.fwSmsParameter.replaceAllContent = async (id, mssv) => {
        let template = await app.model.fwSmsTemplate.get({ id });
        let listParams = await app.model.fwSmsParameter.getAll({
            statement: 'id IN (:listId)',
            parameter: { listId: template.thamSo.split(',') }
        });
        let colMapper = {};
        listParams.forEach(item => colMapper[item.ten] = item.columnName);

        listParams = listParams.groupBy('modelName');
        Object.keys(listParams).forEach(key => {
            listParams[key] = listParams[key].map(item => item.columnName);
        });

        let returnData = {};
        for (const model of Object.keys(listParams)) {
            let item = {};
            switch (model) {
                case 'fwStudents':
                    item = await app.model.fwStudent.get({ mssv }, listParams.fwStudents.join(','));
                    break;
                case 'tcHocPhi':
                    item = await app.model.tcHocPhi.get({ mssv }, listParams.tcHocPhi.join(',')), 'namHoc DESC, hocKy DESC';
                    break;
                case 'tcSetting':
                    item = await app.model.tcSetting.getValue(...listParams.tcSetting);
                    break;
                case 'tcHocPhiTransaction':
                    item = await app.model.tcHocPhiTransaction.get({ customerId: mssv }, listParams.tcHocPhiTransaction.join(','), 'transDate DESC');
                    break;
                default: break;
            }
            returnData = Object.assign({}, returnData, item);
        }
        let content = template.content;
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
        const shortNamHoc = (namHoc) => {
            return `${(parseInt(namHoc).toString().slice(-2))}-${((parseInt(namHoc) + 1).toString().slice(-2))}`;
        };
        Object.keys(colMapper).forEach(key => {
            let data = returnData[colMapper[key]];
            if (key == '{trans_date}') content = content.replaceAll(key, app.date.dateTimeFormat(new Date(parseInt(data)), 'HH:MM:ss dd/mm/yyyy'));
            else if (key == '{nam_hoc}') content = content.replaceAll(key, shortNamHoc(namHoc)); //TODO: cho nguoi dung config
            else if (key == '{hoc_ky}') content = content.replaceAll(key, hocKy); //
            else if (key == '{hoc_phi}') content = content.replaceAll(key, data.toString().numberDisplay());
            else content = content.replaceAll(key, returnData[colMapper[key]]);
        });

        if (!template.isTiengViet) content = content.split('').map(item => xoaDau(item)).join('');
        return content;
    };
};