import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, getValue } from 'view/component/AdminPage';
import { handleChangePassword } from './redux';
import T from 'view/js/common';

class SdhTsChangePassword extends AdminPage {
    state = { success: false };
    componentDidMount() {
    }
    handleChangePassword = () => {
        try {
            const data = {
                oldPass: getValue(this.passwordOld),
                newPass: getValue(this.passwordNew),
                confirmPass: getValue(this.confirmPasswordNew)
            };
            this.props.handleChangePassword(data, (result) => {
                if (result && result.error && result.error.message) {
                    return this.setState({ note: result.error.message, success: false });
                } else {
                    this.setState({ note: 'Thay đổi mật khẩu thành công', success: true });
                }
            });
        } catch (selector) {
            selector.focus();
            selector.props.id ? T.validateEmail(this.email.value()) && T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> không hợp lệ!', 'danger')
                : T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }

    }
    renderForm = () => {
        const { note, success } = this.state;
        let form = '', buttons = '';

        form = <div className='d-flex justify-content-center' style={{ height: '80vh' }}>
            <div className='row'>
                <div className='col-md-12' >
                    <div className='row' >
                        <fieldset className='border p-2'>
                            <legend className='w-auto' ><h3 className='col-md-12'>Đổi mật khẩu</h3></legend>
                            <span className={success ? 'text-success col-md-12' : 'text-danger col-md-12'}>{note}</span>
                            <FormTextBox type='password' className='col-md-12' placeholder='Mật khẩu cũ' ref={e => this.passwordOld = e} required />
                            <div className='col-md-12' display={!note ? 'block' : 'none'}>Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm các ít nhất 1 ký tự từ a-z, ít nhất 1 ký tự từ A-Z, và ít nhất 1 ký tự từ 0-9</div>
                            <FormTextBox type='password' className='col-md-12' placeholder='Mật khẩu mới' ref={e => this.passwordNew = e} required />
                            <FormTextBox type='password' className='col-md-12' placeholder='Xác nhận mật khẩu mới' ref={e => this.confirmPasswordNew = e} required />
                            <button type='button' className='col-md-12 btn btn-lg btn-outline-success px-5 rounded-0 mr-1' onClick={(e) => e.preventDefault() || this.handleChangePassword()}>
                                Xác nhận
                            </button>
                        </fieldset>
                    </div>
                </div>


            </div>
        </div>;

        return <div className='tile'>
            {form}
            {buttons}
        </div>;
    }

    render() {

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Đổi mật khẩu',
            breadcrumb: [
                'Đổi mật khẩu'
            ],
            content: <>
                {this.renderForm()}
            </>,
            backRoute: '/user',
        });

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    handleChangePassword
};
export default connect(mapStateToProps, mapActionsToProps)(SdhTsChangePassword);
