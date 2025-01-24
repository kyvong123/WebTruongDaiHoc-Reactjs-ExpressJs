import React from 'react';

import { AdminModal, FormDatePicker, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';

export default class EditModal extends AdminModal {
    state = { isSubmitting: false, onCreate: true }

    onShow = (item) => {
        this.setState({ onCreate: item ? false : true });
        const { id, mssv, lyDo, soTienThuTruoc, thoiHanThanhToan, ghiChu } = item ? item : { id: '', mssv: '', lyDo: '', soTienThuTruoc: '', thoiHanThanhToan: '', ghiChu: '' };
        this.setState({ id }, () => {
            this.mssv.value(mssv);
            this.lyDo.value(lyDo);
            this.soTienThuTruoc.value(soTienThuTruoc);
            this.thoiHanThanhToan.value(thoiHanThanhToan);
            this.ghiChu.value(ghiChu);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let item = {
            mssv: this.mssv.value(),
            lyDo: this.lyDo.value(),
            thoiHanThanhToan: this.thoiHanThanhToan.value(),
            soTienThuTruoc: this.soTienThuTruoc.value(),
            ghiChu: this.ghiChu.value()
        };
        if (!item.mssv) {
            this.mssv.focus();
            T.notify('Vui lòng chọn sinh viên thực hiện hoãn đóng học phí', 'danger');
        }
        else if (!item.lyDo) {
            this.lyDo.focus();
            T.notify('Vui lòng điền lý do xin hoãn', 'danger');
        }
        else if (!item.thoiHanThanhToan) {
            this.thoiHanThanhToan.focus();
            T.notify('Vui lòng chọn thời hạn thanh toán', 'danger');
        }
        else {
            item.thoiHanThanhToan = T.dateToNumber(item.thoiHanThanhToan, 23, 59, 59, 999);
            if (this.state.onCreate) {
                this.props.create(item, () => this.hide());
            }
            else {
                this.props.update({ id: this.state.id }, item, error => {
                    if (!error) this.hide();
                });
            }
        }
    }


    render = () => {
        // const permission = this.props.permission;

        return this.renderModal({
            title: this.state.onCreate ? 'Thêm đơn hoãn đóng học phí' : 'Chỉnh sửa đơn hoãn đóng học phí',
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} data={SelectAdapter_FwStudent} className='col-md-12' ref={e => this.mssv = e} label='Sinh viên' readOnly={!this.state.onCreate} required />
                <FormRichTextBox disabled={this.state.isSubmitting} type='text' className='col-md-12' ref={e => this.lyDo = e} label='Lý do xin hoãn đóng' required />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.thoiHanThanhToan = e} label='Thời hạn thanh toán' required />
                <FormTextBox disabled={this.state.isSubmitting} type='number' className='col-md-6' ref={e => this.soTienThuTruoc = e} label='Số tiền thanh toán trước (VNĐ)' />
                <FormRichTextBox disabled={this.state.isSubmitting} type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />

                {/* <div className='col-md-12'>
                    <div className='tile'>{tableLoaiPhi}</div>
                </div> */}

            </div>
        }
        );
    }
}