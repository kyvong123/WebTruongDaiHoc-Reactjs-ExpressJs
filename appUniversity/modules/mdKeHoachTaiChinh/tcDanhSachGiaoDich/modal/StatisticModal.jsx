
import React from 'react';
import { AdminModal, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';

export default class StatisticModal extends AdminModal {

    onShow = () => {
        this.setState({ isLoading: false });
    }

    onSubmit = () => {
        const data = { loaiPhi: this.state.loaiPhi };
        try {
            const checkField = ['batDau', 'ketThuc'];
            checkField.forEach(key => {
                data[key] = this[key].value();
                if ((data[key] == null || (Array.isArray(data[key]) && !data[key].length)) && this[key].props.required) {
                    T.notify(`${this[key].props.label} trống`, 'danger');
                    throw new Error();
                }
            });
            data.ngaySoPhu = data.ngaySoPhu ? 1 : 0;
            data.batDau = data.batDau && data.batDau.getTime();
            data.ketThuc = data.ketThuc && data.ketThuc.getTime();
            this.setState({ isLoading: true });
            T.handleDownload(`/api/khtc/danh-sach-giao-dich/stat?data=${JSON.stringify(data)}`);
            this.setState({ isLoading: true });
            this.hide();
        } catch (error) {
            T.notify(`Không thể tải xuống danh sách giao dịch: ${error}`, 'danger');
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê giao dịch',
            size: 'elarge',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormDatePicker ref={e => this.batDau = e} type='time' className='col-md-6' label='Từ thời điểm' allowClear />
                <FormDatePicker ref={e => this.ketThuc = e} type='time' className='col-md-6' label='Đến thời điểm' allowClear />
                <FormCheckbox ischeck ref={e => this.ngaySoPhu = e} className='col-md-6' label='Lấy theo thời gian sổ phụ' />
            </div>
        });
    }
}