import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { getDtCauHinhDiemKeys, updateDtCauHinhDiemKeys } from 'modules/mdDaoTao/dtCauHinhDiem/redux';

const listKey = ['rotMon', 'caiThienMin', 'caiThienMax', 'caiThienHK'];
class CauHinhDiemConfigSection extends React.Component {

    setValue = (data) => {
        Object.keys(data).forEach(key => {
            if (listKey.includes(key)) {
                this[key].value(data[key]);
            }
        });
    }

    onSave = (e) => {
        e.preventDefault();
        T.confirm('Lưu ý', 'Bạn có chắc chắn muốn thay đổi các thông số này không? Nếu không rõ vui lòng liên hệ quản trị viên.', 'warning', true, isConfirm => {
            if (isConfirm) {
                try {
                    let changes = {};
                    listKey.forEach(key => {
                        changes[key] = getValue(this[key]);
                    });
                    this.props.updateDtCauHinhDiemKeys(changes);
                } catch (error) {
                    T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                }
            }
        });
    }

    render() {
        return (
            <div className='tile'>
                <h4 className='tile-title'>Thông số điểm</h4>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox ref={e => this.rotMon = e} label='Ngưỡng học lại nhỏ hơn' className='col-md-12' required />

                        <label className='col-md-12'>Ngưỡng học cải thiện</label>
                        <div className='col-md-12'><div className='row'>
                            <FormTextBox ref={e => this.caiThienMin = e} label='Từ' className='col-md-6' required />
                            <FormTextBox ref={e => this.caiThienMax = e} label='Đến' className='col-md-6' required />
                        </div></div>
                        <FormTextBox type='number' ref={e => this.caiThienHK = e} label='Trong khoảng ... học kỳ' className='col-md-12' required />
                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={this.onSave}>
                        <i className='fa fa-lg fa-save' /> Lưu thay đổi
                    </button>

                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtCauHinhDiemKeys, updateDtCauHinhDiemKeys };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CauHinhDiemConfigSection);