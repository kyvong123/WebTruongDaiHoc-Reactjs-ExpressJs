import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox } from 'view/component/AdminPage';

class RejectModal extends AdminModal {
    onShow = item => {
        this.setState({ maDangKy: item.maDangKy, item });
        this.lyDoTuChoi.value(item.lyDoTuChoi ? item.lyDoTuChoi : '');
    }

    render = () => {
        const readOnly = this.state.item?.lyDoTuChoi ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Từ chối xác nhận biểu mẫu',
            body: (
                <div className='row'>
                    <FormRichTextBox ref={e => this.lyDoTuChoi = e} label='Lý do từ chối' className='col-md-12' placeholder='Lý do' required readOnly={readOnly} />
                </div>
            )
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(RejectModal);
