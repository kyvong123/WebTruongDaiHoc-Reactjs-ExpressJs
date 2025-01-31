import React from 'react';
import { AdminModal, getValue, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DssvDotDrl, createDrlGiaHanSinhVien } from 'modules/mdCongTacSinhVien/svDotDanhGiaDrl/redux';

export default class GiaHanSinhVienModal extends AdminModal {
    onShow = () => {
        this.mssv.value('');
        this.timeEnd.value('');
        this.reset.value(1);
        this.notify.value(1);
    }

    onSubmit = () => {
        const data = {
            idDot: this.props.idDot,
            mssv: getValue(this.mssv),
            timeEnd: getValue(this.timeEnd).getTime(),
            reset: this.reset.value(),
            notify: this.notify.value(),
        };
        if (data.timeEnd < Date.now()) return T.notify('Ngày kết thúc không hợp lệ!', 'danger');
        createDrlGiaHanSinhVien(data, () => {
            this.props.onSubmit?.call();
            this.hide();
        });
    }

    render = () => {
        // const { idDot } = this.props;
        return this.renderModal({
            title: 'Gia hạn sinh viên',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.mssv = e} data={SelectAdapter_DssvDotDrl({ idDot: this.props.idDot })} label='Sinh viên' required />
                <FormDatePicker className='col-md-6' ref={e => this.timeEnd = e} label='Ngày hết hạn' required type='date-mask' />
                <FormCheckbox className='col-md-12' ref={e => this.reset = e} label='Khởi tạo lại điểm sinh viên' value={1} />
                <FormCheckbox className='col-md-12' ref={e => this.notify = e} label='Thông báo đến sinh viên' value={1} />
            </div>
        });
    }
}