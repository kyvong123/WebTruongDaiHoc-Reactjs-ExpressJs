import React from 'react';

import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';

// const yearDatas = () => {
//     return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
// };

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam} - ${nam + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export default class EditModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        const { id, namHoc, hocKy, ten } = item ? item : { id: '', namHoc: '', hocKy: '', ten: '' };
        this.setState({ id, namHoc, hocKy, ten }, () => {
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.ten.value(ten);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            ten: this.ten.value()
        };

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
        else {
            this.setState({ isSubmitting: true }, () => {
                if (this.state.id) {
                    if (this.state.namHoc == data.namHoc && this.state.hocKy == data.hocKy && this.state.ten == data.ten) {
                        T.notify('Không có thay đổi thông tin', 'danger');
                    }
                    else {
                        this.props.update(
                            { id: this.state.id },
                            {
                                namHoc: data.namHoc,
                                hocKy: data.hocKy,
                                ten: data.ten
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
            </div>
        }
        );
    }
}