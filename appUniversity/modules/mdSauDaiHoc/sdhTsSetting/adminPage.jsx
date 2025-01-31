import React from 'react';
import { connect } from 'react-redux';
import { getSdhTsSettingAll, updateSdhTsSetting } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormEditor } from 'view/component/AdminPage';

class emailSettingAdminPage extends AdminPage {
    state = { listEmail: [] };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc/tuyen-sinh', () => {
            this.props.getSdhTsSettingAll(
                items => {
                    (items || []).forEach(item => {
                        if (item.key == 'emailDangKyEditorHtml') {
                            this.emailDangKyEditor.html(item.value);
                        } else if (item.key == 'emailForgetPasswordEditorHtml') {
                            this.emailForgetPasswordEditor.html(item.value);
                        } else if (item.key == 'emailThongTinDangNhapEditorHtml') {
                            this.emailThongTinDangNhapEditor.html(item.value);
                            // } else if (item.key == 'emailNhapHocEditorHtml') {
                            //     this.emailNhapHocEditor.html(item.value);

                        }
                        else {
                            const component = this[item.key];
                            component && component.value && component.value(item.value);
                        }
                    });
                });
        });
    }
    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        arguments.length && this.props.updateSdhTsSetting(changes);
    }
    changePassword = () => {
        const password1 = this.emailPassword1.value();
        const password2 = this.emailPassword2.value();
        if (!password1) {
            T.notify('Mật khẩu không được trống!', 'danger');
        } else if (!password2) {
            T.notify('Cần phải nhập lại mật khẩu!', 'danger');
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
        } else {
            this.props.updateSdhTsSetting({ emailPassword: password1 }, () => this.emailPassword1.value('') || this.emailPassword2.value(''));
        }
    }



    saveEmailTempate = (titleKey, editorKey) => {
        const changes = {};
        if (titleKey == 'expiredIn') {
            changes[titleKey] = this[titleKey].value() + 'd';
        } else {
            changes[titleKey] = this[titleKey].value();
            changes[editorKey + 'Text'] = this[editorKey].text();
            changes[editorKey + 'Html'] = this[editorKey].html();
        }
        this.props.updateSdhTsSetting(changes);
    }
    onChangeEmailTo = () => {
        let listEmail = this.emailEditTo.value();
        this.setState({ listEmail });
    }

    render() {
        const permission = this.getUserPermission('sdhTsSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cog',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh/'>Tuyển sinh</Link>,
                'Cấu hình email'
            ],
            content:
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Email</h3>
                            <FormTextBox ref={e => this.email = e} label='Email' type='email' readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('email')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>

                            <h3 className='tile-title'>Mật khẩu email</h3>
                            <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu email' type='password' readOnly={readOnly} />
                            <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu email' type='password' readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.changePassword}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin phòng Đào tạo Sau đại học </h3>
                            <FormTextBox ref={e => this.sdhAddress = e} label='Địa chỉ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdhPhone = e} label='Điện thoại liên hệ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdhEmail = e} label='Email liên hệ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdhSupportPhone = e} label='Điện thoại hỗ trợ' readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('sdhAddress', 'sdhPhone', 'sdhEmail', 'sdhSupportPhone')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#emailDangKy'>Email đăng ký</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#emailForgetPassword'>Email quên mật khẩu</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#emailThongTinDangNhap'>Email thông tin đăng nhập</a>
                            </li>
                            {/* Dùng sau nếu cần
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#emailDuThi'>Email dự thi</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#emailThongBao'>Email thông báo</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#emailNhapHoc'>Email nhập học</a>
                            </li> */}

                        </ul>

                        <div className='tab-content tile'>
                            <div className='tab-pane fade active show' id='emailDangKy'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailDangKyTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailDangKyEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailDangKyTitle', 'emailDangKyEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='emailForgetPassword'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailForgetPasswordTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailForgetPasswordEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailForgetPasswordTitle', 'emailForgetPasswordEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>
                            <div className='tab-pane fade' id='emailThongTinDangNhap'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailThongTinDangNhapTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailThongTinDangNhapEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailThongTinDangNhapTitle', 'emailThongTinDangNhapEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>
                            {/* <div className='tab-pane fade' id='emailDuThi'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailEditTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailDuThiEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailEditTitle', 'emailDuThiEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='emailThongBao'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailThongBaoTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailThongBaoEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailThongBaoTitle', 'emailThongBaoEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='emailNhapHoc'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.emailNhapHocTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.emailNhapHocEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('emailNhapHocTitle', 'emailNhapHocEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div> */}
                        </div>
                    </div>

                </div>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh/',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhTsSettingAll, updateSdhTsSetting };
export default connect(mapStateToProps, mapActionsToProps)(emailSettingAdminPage);