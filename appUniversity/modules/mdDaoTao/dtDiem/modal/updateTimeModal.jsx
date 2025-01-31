import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, getValue } from 'view/component/AdminPage';
import { updateMultipleTimeConfig } from 'modules/mdDaoTao/dtDiemConfig/redux';

class UpdateTimeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => {
            this.thoiGianBatDauNhap.value('');
            this.thoiGianKetThucNhap.value('');
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            thoiGianBatDauNhap: getValue(this.thoiGianBatDauNhap).setHours(0, 0, 0, 0),
            thoiGianKetThucNhap: getValue(this.thoiGianKetThucNhap).setHours(23, 59, 59, 999),
            listMaHocPhan: this.props.listChosen.map(i => i.maHocPhan),
        };

        if (data.thoiGianBatDauNhap > data.thoiGianKetThucNhap) {
            T.notify('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!', 'danger');
            return;
        }

        T.alert('Đang cập nhật thông số thời gian nhập điểm!', 'warning', false, null, true);
        this.props.updateMultipleTimeConfig(data, () => {
            this.hide();
            this.props.save();
            T.alert('Cập nhật thông số thời gian nhập điểm thành công', 'success', false, 1000);
        });
    };

    render = () => {
        return this.renderModal({
            title: 'Cập nhật thông số thời gian nhập điểm',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker type='time-mask' ref={e => this.thoiGianBatDauNhap = e} label='Thời gian bắt đầu nhập điểm' className='col-md-12' required />
                <FormDatePicker type='time-mask' ref={e => this.thoiGianKetThucNhap = e} label='Thời gian kết thúc nhập điểm' className='col-md-12' required />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateMultipleTimeConfig };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(UpdateTimeModal);