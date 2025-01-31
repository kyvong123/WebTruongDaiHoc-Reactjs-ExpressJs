import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { setStatus, isSwitchable } from 'modules/mdHanhChinhTongHop/hcthCongVanDi/redux/vanBanDi';
import { connect } from 'react-redux';
import { SimpleSwitchModal } from 'modules/mdHanhChinhTongHop/hcthCongVanDi/components/switchStatusModal';

class SwitchStatusModal extends AdminPage {

    canSwitchStatus = (vanBanId, done) => {
        this.props.isSwitchable(vanBanId, done);
    }

    forwardStatus = (vanBanId) => {
        this.canSwitchStatus(vanBanId, () => {
            this.setState({ id: vanBanId }, () => {
                this.modal.show({
                    forward: 1,
                    title: 'Cập nhật trạng thái văn bản',
                    message: '*Lưu ý: Các thay đổi được thực hiện sẽ được lưu vết và trạng thái văn bản sẽ được cập nhật',
                    onConfig: (phanHoi) => {
                        this.simpleSwitchModal.hide();
                        this.switchStatusModal.show({ phanHoi });
                    },
                    onSubmit: (phanHoi, shccCanBoXuLy, done, onFinish) => {
                        setStatus({ phanHoi, forward: 1, id: this.state.id, shccCanBoXuLy, multiple: true }, done, onFinish)(null, () => ({ hcth: { hcthCongVanDi: { item: { files: [{}] } } } }));
                    },
                });
            });
        });
    }

    backStatus = (vanBanId) => {
        this.canSwitchStatus(vanBanId, () => {
            this.setState({ id: vanBanId }, () => {
                this.modal.show({
                    title: 'Trả lại văn bản',
                    message: '*Lưu ý: Các thay đổi được thực hiện sẽ được lưu vết và văn bản sẽ được trả lại',
                    back: 1,
                    onConfig: (phanHoi) => {
                        this.simpleSwitchModal.hide();
                        this.switchStatusModal.show({ phanHoi, backTo: true });
                    },
                    onSubmit: (phanHoi, shccCanBoXuLy, done, onFinish) => {
                        setStatus({ phanHoi, back: 1, id: this.state.id, shccCanBoXuLy }, done, onFinish)(null, () => ({ hcth: { hcthCongVanDi: { item: { files: [{}] } } } }));
                    },
                });
            });
        });

    }

    canSave = () => false

    showBackModal = () => {
        this.modal.show();
    }

    render() {
        return <SimpleSwitchModal showCauHinhKhac={false} ref={e => this.modal = e} save={() => { }} status={this.props.status} id={this.state.id} getMinimalDisplay={() => false} done={() => {
            this.props.done && this.props.done();
            this.modal.hide();
        }} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { isSwitchable };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SwitchStatusModal);