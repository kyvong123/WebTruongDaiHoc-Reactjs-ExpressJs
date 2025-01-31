import React from 'react';
import { FormTextBox, AdminModal, getValue } from 'view/component/AdminPage';
import './home.scss';


export default class ConfirmModal extends AdminModal {
    state = { timeLeft: 180 };
    timeOutId = '';
    componentDidMount() {
        this.disabledClickOutside();
    }
    componentDidUpdate() {
        const timeLeft = this.state.timeLeft;
        this.timeOutId = this.state.email && timeLeft > 0 ? setTimeout(() => this.setState({ timeLeft: timeLeft - 1 }), 1000) : '';

    }

    onShow = (data) => {
        if (this.props.createTsSdh) {
            this.timeOutId && clearTimeout(this.timeOutId);
            const { studentData, dataXacThuc, mail } = data;
            this.setState({ studentData, dataXacThuc, mail, timeLeft: 180 });
        } else {
            const { email, dataXacThuc } = data;
            this.timeOutId && clearTimeout(this.timeOutId);
            this.setState({ email, dataXacThuc });
        }
    };

    onSubmit = (e) => {
        e.preventDefault();
        if (this.props.createTsSdh) {
            const { studentData, dataXacThuc } = this.state;
            if (!this.code?.value()) {
                T.notify('Xin vui lòng điền mã xác thực!', 'danger');
                return;
            } else {
                const xacThuc = { ...dataXacThuc, maXacThuc: getValue(this.code) };
                T.alert('Đang tạo hồ sơ xin vui lòng đợi trong giây lát', 'info', false, null, true);
                this.props.createTsSdh(xacThuc, studentData, (item) => {
                    this.code.value('');
                    if (item.err) {
                        T.alert(`${item.err.message}`, 'error', false, 2000);
                        return;
                    }
                    this.hide();
                    T.alert('Hồ sơ được tạo thành công', 'success', false, 2000);
                });
            }

        } else {
            const { email, dataXacThuc } = this.state;
            const data = { email, dataXacThuc, maXacThuc: this.code.value() };
            if (!this.code.value()) {
                T.notify('Xin vui lòng điền mã xác thực!', 'danger');

            }
            else {
                T.alert('Đang xác thực...', 'info', false, null, true);
                this.props.confirmCode(data, (item) => {
                    this.code.value('');
                    if (item && item.error) {
                        // this.hide();
                        T.alert(`${item.error.message}`, 'error', false, 2000);
                        return;
                    } else {
                        this.hide();
                        T.alert('Xác thực thành công!', 'success', false, 2000);
                        this.props.callback();
                    }

                });
            }
        }
    }
    render = () => {
        const { email } = this.state.studentData && this.state.studentData.dataCoBan ? this.state.studentData.dataCoBan : { email: '', ho: '', ten: '' };
        return this.renderModal({
            title: 'Xác nhận đăng ký',
            size: 'large',
            body: <div className='row'>
                {/* <FormTextBox className='col-12' ref={e => this.email = e} label='Email nhận' readOnly /> */}
                <div className='col-md-3' style={{ color: this.state.timeLeft % 2 == 0 ? 'red' : 'orange' }}>Thời gian mã xác thực: <strong>{this.state.timeLeft}</strong></div>
                <div className='col-md-12'>Vui lòng kiểm tra hòm thư và nhập mã xác thực được gửi tới email {email}.</div>
                {this.state.timeLeft != 0 ?
                    <FormTextBox autoFormat={false} type='number' max={999999} className='col-md-12' ref={e => this.code = e} label='Mã xác thực gồm 6 số' required />
                    : <div className='col-md-12' style={{ color: 'red' }}>Thời gian của mã xác thực đã hết hiệu lực, xin vui lòng chọn gửi lại mã để tiếp tục! </div>
                }<div className='col-md-2' style={{ display: 'flex', gap: 10 }}>
                    <button type='button' style={{ height: '34px', alignSelf: 'flex-end' }} className='btn btn-success rounded-0' onClick={(e) =>
                        e.preventDefault() || this.props.send({ emailForm: this.state.email }, (item) => {
                            clearTimeout(this.timeOutId);
                            this.setState({ timeLeft: 180, dataXacThuc: { id: item.id } });
                        }
                        )}>
                        <i className="fa fa-refresh" aria-hidden="true"></i> Gửi lại mã
                    </button>
                </div>

            </div>,
            postButtons: this.state.timeLeft != 0 ? <button className='btn btn-success' onClick={e => this.onSubmit(e)} disabled={this.code ? false : true}>
                <i className='fa fa-lg fa-check' />  Xác thực
            </button> : '',
            isShowSubmit: false,
        }
        );
    };
}