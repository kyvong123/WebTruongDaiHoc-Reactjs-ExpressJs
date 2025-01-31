import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker } from 'view/component/AdminPage';
import { revokeCertificate, getUserRequest, getKey, getSignature } from '../redux';
import moment from 'moment';

class RevokeModal extends AdminModal {
    onShow = () => {
        this.revocationDate.value('');
        this.setState({ isLoading: false });
    }

    onSubmit = () => {
        const revocationDate = this.revocationDate.value();
        if (!revocationDate) {
            T.notify('Vui lòng nhập ngày thu hồi chứng thư số', 'danger');
        } else if (revocationDate.getTime() > Date.now()) {
            T.notify('Ngày thu hồi không hợp lệ', 'danger');
        } else {
            T.confirm('Thu hồi chứng thư số', 'Chưng thư số của bạn sẽ được thư hồi vào thời điểm ' + moment(revocationDate).format('HH [giờ] mm [phút] [ngày] DD/MM/YYYY'), true, (isConfirm) => {
                isConfirm && this.setState({ isLoading: true }, () => {
                    this.props.revokeCertificate(revocationDate.getTime(), () => {
                        this.props.getUserRequest(0, 100);
                        this.props.getKey();
                        this.props.getSignature();
                        this.hide();
                    }, () => this.setState({ isLoading: false }));
                });
            });
        }
    }


    render = () => {
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: 'Thu hồi chứng thư số',
            body: <div className='row'>
                <FormDatePicker className='col-md-12' type='time-mask' label='Ngày thu hồi' ref={e => this.revocationDate = e} />
            </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system });
const actionsToProps = { revokeCertificate, getUserRequest, getKey, getSignature };
export default connect(stateToProps, actionsToProps, null, { forwardRef: true })(RevokeModal);
