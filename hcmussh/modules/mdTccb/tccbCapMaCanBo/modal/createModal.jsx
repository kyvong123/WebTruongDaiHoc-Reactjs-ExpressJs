import React from 'react';

import { AdminModal, FormDatePicker, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_TccbLoaiCanBo } from '../redux';

export default class CreateModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.ho.value('');
        this.ten.value('');
        this.gioiTinh.value('');
        this.ngaySinh.value('');
        this.maDonVi.value('');
        this.emailCaNhan.value('');
        this.loaiCanBo.value('');
        this.emailTruongSuggest.value('');
    }

    onSubmit = () => {
        const data = {
            ho: getValue(this.ho),
            ten: getValue(this.ten),
            gioiTinh: getValue(this.gioiTinh),
            ngaySinh: getValue(this.ngaySinh) ? T.dateToNumber(getValue(this.ngaySinh), 12, 0, 0, 0) : '',
            emailCaNhan: getValue(this.emailCaNhan),
            maDonVi: getValue(this.maDonVi),
            loaiCanBo: getValue(this.loaiCanBo),
            emailTruongSuggest: getValue(this.emailTruongSuggest),
        };
        this.props.check(data, result => {
            const content = result.reduce((res, curr) => {
                return res + '\n   - ' + curr;
            }, '');
            T.confirm('Cảnh báo',
                result.length ? `<div style="white-space: break-spaces; text-align: left">Hệ thống phát hiện trùng lặp thông tin: ${content}\n\nBạn có đồng ý xác nhận cấp mã số cho cán bộ này?</div>`
                    : 'Bạn có đồng ý xác nhận cấp mã số cho cán bộ này?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            this.props.create(data, () => {
                                this.hide();
                                T.alert('Cấp mới mã số cán bộ thành công!', 'success', false, 800);
                            });
                        }
                    });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu cấp Mã số cán bộ',
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.ho = e} label='Họ' />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.ten = e} label='Tên' required />
                <FormSelect disabled={this.state.isSubmitting} data={[{ id: 0, text: 'Nữ' }, { id: 1, text: 'Nam' }]} className='col-md-2' ref={e => this.gioiTinh = e} label='Giới tính' required />
                <FormDatePicker type='date-mask' disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.ngaySinh = e} label='Ngày sinh' required />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.emailCaNhan = e} label='Email cá nhân' required />
                <FormSelect disabled={this.state.isSubmitting} data={SelectAdapter_DmDonVi} className='col-md-8' ref={e => this.maDonVi = e} label='Đơn vị yêu cầu' required />
                <FormSelect disabled={this.state.isSubmitting} data={SelectAdapter_TccbLoaiCanBo} className='col-md-4' ref={e => this.loaiCanBo = e} label='Loại cán bộ' required />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.emailTruongSuggest = e} label='Email trường (đề xuất)' required />
            </div>
        });
    }
}