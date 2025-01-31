import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { trangThaiSwitcher } from 'modules/mdHanhChinhTongHop/constant.js';
import { updateVanBanDenStatus } from 'modules/mdHanhChinhTongHop/hcthCongVanDen/redux';
class StatusUpdate extends AdminModal {

    onShow = ({ id, trangThai }) => {
        this.setState({ isLoading: false, id });
        this.currentState.value(trangThai);
        this.afterState.value('');
    }
    onSubmit = () => {
        const trangThai = this.afterState.value();
        if (!trangThai || trangThai == this.currentState.value()) {
            return T.notify('Trạng thái không hợp lệ', 'danger');
        }
        this.setState({ isLoading: true }, () => {
            this.props.updateVanBanDenStatus(this.state.id, trangThai, () => window.location.reload(), () => this.setState({ isLoading: false }));
        });
    }

    render = () => {
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: 'Thay đổi trạng thái',
            body: <div className='row'>
                <FormSelect label='Trạng thái hiện tại' data={Object.values(trangThaiSwitcher)} className='col-md-12' disabled ref={e => this.currentState = e} />
                <FormSelect label='Trạng thái tiếp theo' data={Object.values(trangThaiSwitcher)} className='col-md-12' ref={e => this.afterState = e} />
            </div>
        });
    }
}

const stateToProps = state => ({ system: state.system });
const actionsToProps = { updateVanBanDenStatus };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(StatusUpdate);