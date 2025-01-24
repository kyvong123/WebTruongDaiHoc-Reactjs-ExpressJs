import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, getValue } from 'view/component/AdminPage';
import './home.scss';
import { handleLogin, sendMailXacNhanDangKy, handleForgetPassword } from './redux';
import { logout } from 'modules/_default/_init/reduxSystem.jsx';
import ConfirmModal from './ConfirmModal';
import { confirmCode } from './redux';

class SdhDangKyTuyenSinhPage extends AdminPage {
    state = { init: true, isForgetPassword: false, sent: false, confirmCode: false, isLogin: true, validate: false, lstDot: [], lstPhanHe: [], lstHinhThuc: [], idDot: '', tenDot: '', phanHe: {}, hinhThuc: {} };
    componentDidMount() {
        const user = this.props.system.user;
        let role = '';
        if (user) {
            if (user.isStaff) {
                role = 'với vai trò Cán bộ/Giảng viên';
            } if (user.isStudent) {
                role = 'với vai trò Sinh viên';
            }
            T.confirm(`Bạn đã đăng nhập ${role}`, 'Bạn có muốn đăng xuất phiên hiện tại để truy cập hệ thống tuyển sinh sau đại học không?', true,
                isConfirm => {
                    if (isConfirm) {
                        this.props.logout();
                    } else {
                        window.location.href = '/user';
                    }
                });
        }
    }
    renderForm = () => {
        const { isLogin, isForgetPassword, confirmCode, note } = this.state;
        let form = '', buttons = '';
        if (isLogin) {
            form =
                <div className='d-flex justify-content-center'>
                    <div className='col-md-6'>
                        <div className='row'>
                            <div className='col-md-12'><p style={{ color: 'red', fontStyle: 'italic' }}>* Nếu đăng nhập lần đầu xin vui lòng đăng nhập bằng tên tài khoản là email đăng ký hồ sơ, password là mật khẩu được hệ thống gửi về email khi đăng ký hồ sơ thành công!</p></div>
                            <FormTextBox className='col-md-12' placeholder='Email' ref={e => this.email = e} required />
                            <FormTextBox className='col-md-12' type='password' placeholder='Password' ref={e => this.password = e} required />
                        </div>
                        {note}
                        <div className='d-flex col-md-12 justify-content-begin'>
                            <a href='#' onClick={() => window.location.href = '/sdh/dkts'}>Đăng ký hồ sơ tuyển sinh </a>
                            <a href='#' onClick={(e) => e.preventDefault() || this.setState({ isLogin: false, isForgetPassword: true, note: '' }, () => this.email.value(''))}>/ Quên mật khẩu</a>
                        </div>
                        <div className='d-flex col-md-12 justify-content-end'>
                            <button type='button' className='btn btn-lg btn-outline-success px-5 rounded-0 mr-1' onClick={(e) => e.preventDefault() || this.handleNext()}>
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>;
        } else if (isForgetPassword) {
            form = <div className='d-flex justify-content-center'>
                <div className='col-md-6'>
                    {note}
                    <div className='row'>
                        <FormTextBox className='col-md-12' placeholder='Email' ref={e => this.email = e} required readOnly={confirmCode} />
                    </div>
                    {confirmCode ? <div className='row'>
                        <div className='col-md-12' display={!note ? 'block' : 'none'}>Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm các ít nhất 1 ký tự từ a-z, ít nhất 1 ký tự từ A-Z, và ít nhất 1 ký tự từ 0-9</div>
                        <FormTextBox className='col-md-12' placeholder='Password mới' type='password' ref={e => this.passwordNew = e} required />
                        <FormTextBox className='col-md-12' placeholder='Xác nhận password mới' type='password' ref={e => this.confirmPasswordNew = e} required />
                    </div> : null}
                    <div className='d-flex col-md-12 justify-content-begin'>
                        <a href='#' onClick={(e) => e.preventDefault() || this.setState({ isLogin: true, isForgetPassword: false, note: '' }, () => { this.email.value(''); this.password?.value(''); })}> Quay lại đăng nhập</a>
                    </div>
                    <div className='d-flex col-md-12 justify-content-end'>
                        <button type='button' className='btn btn-lg btn-outline-success px-5 rounded-0 mr-1' onClick={(e) => e.preventDefault() || this.handleNext()}>
                            Xác nhận
                        </button>
                    </div>

                </div>
            </div>;
        }
        return <div className='tile'>
            {form}
            {buttons}
        </div>;
    }

    handleConfirmCode = () => {
        this.setState({ confirmCode: true, note: '' });
    }


    handleNext = () => {
        try {
            const { isLogin, isForgetPassword, confirmCode } = this.state;
            const data = {
                email: getValue(this.email),
                password: isLogin && getValue(this.password),
                passwordNew: confirmCode && getValue(this.passwordNew),
                confirmPasswordNew: confirmCode && getValue(this.confirmPasswordNew),

            };
            if (!T.validateEmail(data.email)) {
                T.notify('Email không hợp lệ!', 'danger');
                return;
            } if (isLogin)
                this.props.handleLogin(data, (data) => {
                    if (data && data.error) { //sai mật khẩu, không tồn tại tài khoản,....
                        this.setState({ note: <strong className='text-danger col-md-12'>{data?.error?.message || ''} </strong> }, () => {
                            T.notify(`${data?.error?.message}`, 'danger');
                            return;
                        });
                    } else {
                        window.location.href = '/user';
                    }
                });
            else if (isForgetPassword)
                if (!this.state.confirmCode)
                    this.props.sendMailXacNhanDangKy({ emailForm: data.email }, (result) => { //gửi mail xác nhận đổi mật khẩu
                        if (result && result.error) {
                            this.setState({ note: <strong className='text-danger col-md-12'>{result?.error?.message || ''} </strong > }, () => {
                                T.notify(`${result?.error?.message}`, 'danger');
                                return;
                            });
                        } else {
                            this.setState({ note: '' }, () => {
                                this.modalConfirm.show({ dataXacThuc: { id: result.id }, email: data.email });
                            });
                        }
                    });
                else {
                    this.props.handleForgetPassword(data, (result) => {
                        if (result && result.error) {//sai format mật khẩu, sai confirm mật khẩu, sai số ký tự,...
                            this.setState({ note: <strong className='text-danger col-md-12'>{result?.error?.message || ''} </strong > }, () => {
                                T.notify(`${result?.error?.message}`, 'danger');
                                return;
                            });
                        } else {
                            this.setState({ note: '', isForgetPassword: false, isLogin: true, confirmCode: false, });
                        }
                    });

                }
        } catch (selector) {
            if (selector.props)
                this.setState({ note: <strong className='text-danger col-md-12'>{`${selector.props.label || selector.props.placeholder} bị trống!`}  </strong > }, () => {
                    T.notify(`${selector.props.label || selector.props.placeholder} bị trống!`, 'danger');
                });
        }
    }

    render() {
        return (
            <div className='mt-5 sdh-bieu-mau'>
                <ConfirmModal ref={e => this.modalConfirm = e} send={this.props.sendMailXacNhanDangKy} confirmCode={this.props.confirmCode} callback={this.handleConfirmCode} />
                <div className='pa'>
                    <h1 className='text-primary text-center pa'>Đăng nhập hệ thống tuyển sinh Sau đại học</h1>
                </div> <hr />
                <div className='tile'>
                    {this.renderForm()};
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => ({ system: state.system, svTsSdh: state.sdh.svTsSdh });
const mapActionsToProps = {
    handleLogin, sendMailXacNhanDangKy, confirmCode, handleForgetPassword, logout
};
export default connect(mapStateToProps, mapActionsToProps)(SdhDangKyTuyenSinhPage);
