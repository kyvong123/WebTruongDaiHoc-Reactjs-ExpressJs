import React from 'react';

import { AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export default class EditModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        const { id, namHoc, hocKy, ten, ngayBatDau, ngayKetThuc } = item ? item : { id: '', namHoc: '', hocKy: '', ten: '', ngayBatDau: '', ngayKetThuc: '' };
        this.setState({ id, namHoc, hocKy, ten, ngayBatDau, ngayKetThuc }, () => {
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.ten.value(ten);
            this.ngayBatDau.value(ngayBatDau || '');
            this.ngayKetThuc.value(ngayKetThuc || '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            ten: this.ten.value(),
            ngayBatDau: this.ngayBatDau.value(),
            ngayKetThuc: this.ngayKetThuc.value(),
        };

        data.ngayBatDau = data.ngayBatDau.setHours(0, 0, 0, 0);
        data.ngayKetThuc = data.ngayKetThuc.setHours(23, 59, 59, 999);

        if (!data.namHoc) {
            T.notify('Năm học không được trống!', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ không được trống!', 'danger');
            this.hocKy.focus();
        }
        else if (data.ten == '') {
            T.notify('Tên đợt đóng không được trống!', 'danger');
            this.ten.focus();
        }
        else if (data.ngayBatDau == '') {
            T.notify('Ngày bắt đầu không được trống!', 'danger');
            this.ngayBatDau.focus();
        }
        else if (data.ngayKetThuc == '') {
            T.notify('Ngày bắt đầu không được trống!', 'danger');
            this.ngayKetThuc.focus();
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                if (this.state.id) {
                    if (this.state.namHoc == data.namHoc && this.state.hocKy == data.hocKy && this.state.ten == data.ten && this.state.ngayBatDau == data.ngayBatDau && this.state.ngayKetThuc == data.ngayKetThuc) {
                        T.notify('Không có thay đổi thông tin', 'danger');
                    }
                    else {
                        this.props.update(
                            { id: this.state.id },
                            {
                                namHoc: data.namHoc,
                                hocKy: data.hocKy,
                                ten: data.ten,
                                ngayBatDau: data.ngayBatDau,
                                ngayKetThuc: data.ngayKetThuc,
                            },
                            () => this.hide()
                        );
                    }
                }
                else {
                    this.props.create(data, () => this.hide());
                }
                this.setState({ isSubmitting: false });
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;

        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa đợt đóng học phí' : 'Thêm đợt đóng học phí',
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} type='text' data={yearDatas().reverse()} className='col-md-6' ref={e => this.namHoc = e} label='Năm học' placeholder='Năm học' readOnly={readOnly} required />
                <FormSelect disabled={this.state.isSubmitting} type='text' data={termDatas} className='col-md-6' ref={e => this.hocKy = e} label='Học kỳ' placeholder='Học kỳ' readOnly={readOnly} required />
                <FormTextBox disabled={this.state.isSubmitting} type='text' className='col-md-12' ref={e => this.ten = e} label='Tên đợt đóng học phí' placeholder='Tên đợt đóng học phí' readOnly={readOnly} required />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' placeholder='Ngày bắt đầu' readOnly={readOnly} required />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' placeholder='Ngày kết thúc' readOnly={readOnly} required />
            </div>
        }
        );
    }
}