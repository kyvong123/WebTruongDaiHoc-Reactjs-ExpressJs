import React from 'react';
import { connect } from 'react-redux';
import { updateSdhThoiGianHocPhan } from '../redux';
import { AdminModal, FormDatePicker, getValue } from 'view/component/AdminPage';

class TimeModal extends AdminModal {
    onShow = (item) => {
        this.setState({ item });
        this.thoiGianNhap.value(item.thoiGianNhap || '');
        this.thoiGianKetThuc.value(item.thoiGianKetThucNhap || '');
    }

    onSubmit = () => {
        const changes = {
            thoiGianBatDauNhap: getValue(this.thoiGianNhap).setHours(0, 0, 0, 0),
            thoiGianKetThucNhap: getValue(this.thoiGianKetThuc).setHours(23, 59, 59, 999),
        },
            maHocPhan = this.state.item.maHocPhan;
        this.props.updateSdhThoiGianHocPhan(maHocPhan, changes, () => { this.props.resetSelected(); this.hide(); });

    }

    render = () => {
        const { item } = this.state,
            { permission } = this.props;
        let titleText = permission.manage ? 'Cập nhật thời gian nhập điểm học phần ' : 'Thời gian nhập điểm học phần ';
        return this.renderModal({
            title: titleText + `${item && item.maHocPhan}`,
            size: 'large',
            isShowSubmit: permission.manage,
            body:
                <>
                    <FormDatePicker type='date' ref={e => this.thoiGianNhap = e} className='col-md-12' label='Thời gian bắt đầu nhập điểm' required />
                    <FormDatePicker type='date' ref={e => this.thoiGianKetThuc = e} className='col-md-12' label='Thời gian kết thúc nhập điểm' required />
                </>,
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSdhThoiGianHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TimeModal);