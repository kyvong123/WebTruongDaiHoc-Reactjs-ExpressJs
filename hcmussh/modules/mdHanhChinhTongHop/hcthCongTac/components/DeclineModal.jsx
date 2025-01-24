import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { FormRichTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';
import { BaseCongTacModal } from './BaseCongTac';
import { censorTicket } from '../redux/congTac';

/**TODO
 * Nhiều cán bộ kiểm duyệt
 * cải thiện giao diện chị Trinh
 * read notification
 */

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

export class _DeclineModal extends BaseCongTacModal {

    onShow = (data) => {
        this.setState({ data });
    }

    onSubmit = () => {
        const item = this.state.data;
        T.confirm('Cảnh báo', `Từ chối phiếu đăng ký công tác từ ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')} của ${item.tenNguoiTao?.normalizedName()}`, true, confirm => confirm && this.props.censorTicket(item.id, 0, 1, this.message.value(), () => this.props.submitCallback && this.props.submitCallback()));
    }

    render = () => {
        return this.renderModal({
            title: 'Từ chối phiếu',
            body: <div className='row'>
                <FormRichTextBox className='col-md-12' ref={e => this.message = e} label='Lý do từ chối' />
            </div>,
        });
    }
}

export default connect(mapStateToProps, { censorTicket }, false, { forwardRef: true })(_DeclineModal);