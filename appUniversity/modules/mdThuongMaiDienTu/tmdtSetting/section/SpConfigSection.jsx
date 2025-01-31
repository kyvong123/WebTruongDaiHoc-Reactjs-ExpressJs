import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { updateTmdtSettingKeys } from '../redux';

const listKey = ['imageSpMin', 'imageSpMax'];
class SpConfigSection extends React.Component {

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
                    this.props.updateTmdtSettingKeys(changes);
                } catch (error) {
                    T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                }
            }
        });
    }

    render() {
        return (
            <div className='tile'>
                <h4 className='tile-title'>Thông số sản phẩm</h4>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox type='number' ref={e => this.imageSpMin = e} label='Số ảnh tối thiểu' className='col-md-6' required />
                        <FormTextBox type='number' ref={e => this.imageSpMax = e} label='Số ảnh tối đa' className='col-md-6' required />
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
const mapActionsToProps = { updateTmdtSettingKeys };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SpConfigSection);