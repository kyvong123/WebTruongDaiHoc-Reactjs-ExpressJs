import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import { SelectAdapter_PhoTruongDonVi } from 'modules/mdTccb/qtChucVu/redux';

class ChungNhanDetailModal extends AdminModal {
    state = { customParam: [], model: []}

    onShow = (item) => {
        let { maDangKy, emailDangKy, tenDangKy, hoDangKy, mssvDangKy, tenFormDangKy, shccNguoiKy, noiNhan, model, dataCustom, ghiChu, lyDoTuChoi } = item ? item : { maDangKy: '', emailDangKy: '', tenDangKy: '', hoDangKy: '', mssvDangKy: '', tenFormDangKy: '', staffSign: '', noiNhan: '', model: '', dataCustom: '', ghiChu: '', lyDoTuChoi: '' };
        this.id.value(maDangKy);
        this.registerName.value(hoDangKy + ' ' + tenDangKy);
        this.registerEmail.value(emailDangKy);
        this.formType.value(tenFormDangKy);
        this.mssv.value(mssvDangKy);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.lyDoTuChoi.value(lyDoTuChoi ? lyDoTuChoi : '');
        this.nguoiKy.value(shccNguoiKy);
        this.noiNhan.value(noiNhan);
        dataCustom = JSON.parse(dataCustom);
        let customParam = [];
        model && JSON.parse(model).forEach(param => {
            customParam.push({
                'ma': param.ma,
                'tenBien': param.tenBien,
                'giaTri': dataCustom[param.ma]
            });
        });
        this.setState({ maDangKy, item, customParam }, () => {
            this.state.customParam.forEach(param => {
                this[param.ma].value(param.giaTri);
            });
        });
    };

    render = () => {
        return this.renderModal({
            title: 'Chi tiết chứng nhận',
            body: (<div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.id = e} label='Mã form' placeholder='Mã form' required readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.registerName = e} label='Sinh viên đăng ký' placeholder='Sinh viên đăng ký' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.registerEmail = e} label='Email đăng ký' placeholder='Email đăng ký' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.mssv = e} label='MSSV đăng ký' placeholder='Mã số sinh viên' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.formType = e} label='Loại form' placeholder='Loại form' readOnly={true} required />
                {
                    this.state.customParam.length ? this.state.customParam.map((param, index) => {
                        const field = <FormTextBox key={index} type='text' className='col-md-12' ref={e => this[param.ma] = e} label={param.tenBien} placeholder={param.tenBien} value={param.giaTri} readOnly={true} required />;
                        return field;
                    }) : []
                }
                <FormRichTextBox ref={ e => this.ghiChu = e } label='Thông tin bổ sung' className='form-group col-md-12' readOnly/>
                <FormRichTextBox ref={ e => this.lyDoTuChoi = e } style={{ display: this.state.item?.tinhTrang === 'R' ? '' : 'none' }} label='Lý do từ chối' className='form-group col-md-12' readOnly/>
                <FormTextBox type='text' className='col-md-12' ref={e => this.noiNhan = e} label='Nơi nhận kết quả' placeholder='Nơi nhận kết quả' readOnly={true} required />
                <FormSelect ref={e => this.nguoiKy = e} label='Cán bộ ký' disabled={this.state.kyKhuyetDanh ? true : false} className='col-md-12' data={SelectAdapter_PhoTruongDonVi(32)} onChange={this.changeChucVu} required readOnly/>
            </div>),
        });
    }
}

export default ChungNhanDetailModal;

