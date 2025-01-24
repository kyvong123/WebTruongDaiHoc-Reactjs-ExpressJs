import React from 'react';
import { AdminModal, FormDatePicker, getValue } from 'view/component/AdminPage';

export default class ThanhToanGiangVienModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (filter) => {
        this.setState({ filter });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            ngayThanhToan: getValue(this.ngayThanhToan) ? T.dateToNumber(getValue(this.ngayThanhToan), 0, 0, 0, 0) : ''
        };

        const filter = this.state?.filter || {};
        this.props.getLength(T.stringify(filter), length => {
            T.confirm('Xác nhận', `Ngày thanh toán cho giảng viên sẽ được cập nhật cho ${length} sinh viên. Bạn có chắc chắn cập nhật không?`, true, isConfirm => {
                isConfirm && T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                isConfirm && this.props.update(T.stringify(filter), data, result => {
                    T.alert(`Đã cập nhật cho ${result} sinh viên thành công`, 'success', false, 1000);
                    this.hide();
                });
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Cập nhật thời gian thanh toán cho giảng viên',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Cập nhật',
            body: <div className='row'>
                <FormDatePicker className='col-md-12' ref={e => this.ngayThanhToan = e} label='Ngày thanh toán' />
            </div>
        });
    }
}


