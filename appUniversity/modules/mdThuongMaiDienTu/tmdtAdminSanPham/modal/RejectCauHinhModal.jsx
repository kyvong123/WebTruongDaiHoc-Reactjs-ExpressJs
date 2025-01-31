import React from 'react';
import {  AdminModal, FormTextBox, getValue, FormRichTextBoxV2 } from 'view/component/AdminPage';

export default class RejectModal extends AdminModal {
    state = {};

    onShow = (item) => {
        const { id, tenCauHinh, tenSanPham, giaCauHinh } = item ? item : { id: null, tenCauHinh: '', maCauHinh: '', tenSanPham: '', maSanPham: '' };
        this.setState({ id }, () => {
            this.tenCauHinh.value(tenCauHinh || '');
            this.tenSanPham.value(tenSanPham || '');
            this.giaCauHinh.value(giaCauHinh || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const id = this.state.id;
            const rejectComment = getValue(this.rejectComment);
            if (rejectComment == '') {
                this.ten.focus();
                T.notify('Không được để lý do reject trống!', 'danger');
            } else {
                this.props.reject(id, rejectComment);
                this.hide();
            }
        } catch (error) {
            console.error('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Reject upload thông tin cấu hình sản phẩm',
            size: 'elarge',
            body: <div className='row'>
                <FormRichTextBoxV2 maxLen={1600} readOnly={false} className='col-12' ref={e => this.rejectComment = e} label='Lý do reject sản phẩm' required placeholder='Lý do reject sản phẩm' />
                <FormTextBox readOnly={true} className='col-12' ref={e => this.tenCauHinh = e} label='Tên cấu hình' required placeholder='Nhập tên cấu hình' />
                <FormTextBox type='number' readOnly={true} className='col-12' ref={e => this.giaCauHinh = e} label='Giá cấu hình (VNĐ)' required placeholder='Nhập giá cấu hình sản phẩm' />
                <FormTextBox readOnly={true} className='col-12' ref={e => this.tenSanPham = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
            </div>
        });
    };
}