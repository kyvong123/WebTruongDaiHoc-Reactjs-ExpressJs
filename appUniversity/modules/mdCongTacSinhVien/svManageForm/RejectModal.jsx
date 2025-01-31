import React from 'react';
import { AdminModal, getValue, FormRichTextBox } from 'view/component/AdminPage';

// const notificationTuChoi = (toEmail, tenBieuMau = '') => ({
//     toEmail: toEmail,
//     title: `Biểu mẫu ${tenBieuMau} đã bị từ chối`,
//     subTitle: 'Vui lòng vào trang Đăng ký để xem lý do',
//     icon: 'fa-times',
//     iconColor: 'danger',
//     link: '/user/chung-nhan-truc-tuyen'
// });

class RejectModal extends AdminModal {
    componentDidMount() {
        this.onHidden(this.onHide);
    }
    onShow = item => {
        this.setState({ maDangKy: item.maDangKy, item, isSubmit: false },
            () => this.props.update(item.maDangKy, { pending: 1, staffPending: this.props.user.email }));
        this.lyDoTuChoi.value(item.lyDoTuChoi ? item.lyDoTuChoi : '');
    }

    onHide = () => {
        if (!this.state.isSubmit && this.state.maDangKy) {
            this.props.update(this.state.maDangKy, { pending: 0 });
        }
    }


    onSubmit = (e) => {
        try {
            const { emailDangKy } = this.state.item;
            e.preventDefault();
            const changes = {
                register: emailDangKy,
                action: 'R', // Reject
                pending: 0,
                lyDoTuChoi: getValue(this.lyDoTuChoi),
            };
            this.props.update(this.state.maDangKy, changes, () => {
                this.setState({ isSubmit: true });
                this.hide();
                T.notify('Từ chối xác nhận biểu mẫu thành công!', 'success');
            });
        } catch (error) {
            T.notify('Từ chối xác nhận biểu mẫu bị lỗi!', 'danger');
        }

    }
    render = () => {
        const readOnly = this.state.item?.lyDoTuChoi ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Từ chối xác nhận biểu mẫu',
            body: (
                <div className='row'>
                    <FormRichTextBox ref={e => this.lyDoTuChoi = e} label='Lý do từ chối' className='col-md-12' placeholder='Lý do' required readOnly={readOnly} />
                </div>
            ),
            isShowSubmit: readOnly ? false : true
        });
    }
}

export default RejectModal;
