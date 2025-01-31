import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormEditor, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { deleteHcthSetting, getHcthSetting, getHcthSettingAll, updateHcthSetting } from './redux';


class HcthSettingAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/hcth/setting', () => {
            this.props.getHcthSettingAll(items => {
                (items || []).forEach(item => {
                    if (item.key == 'chiDaoEmailEditorHtml') {
                        this.chiDaoEmailEditor.html(item.value);
                    } else if (item.key == 'nhanCongVanDenEmailEditorHtml') {
                        this.nhanCongVanDenEmailEditor.html(item.value);
                    } else if (item.key == 'nhanVanBanDiGiayEmailEditorHtml') {
                        this.nhanVanBanDiGiayEmailEditor.html(item.value);
                    } else if (item.key == 'guiOtpEmailEditorHtml') {
                        this.guiOtpEmailEditor.html(item.value);
                    } else if (item.key == 'guiSignEmailEditorHtml') {
                        this.guiSignEmailEditor.html(item.value);
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
        arguments.length && this.props.updateHcthSetting(changes);
    }

    changePassword = function (pw1, pw2, key) {
        const password1 = this[pw1].value(),
            password2 = this[pw2].value(),
            changes = {};
        if (!password1) {
            T.notify('Mật khẩu không được trống!', 'danger');
        } else if (!password2) {
            T.notify('Cần phải nhập lại mật khẩu!', 'danger');
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
        } else {
            changes[key] = password1;
            this.props.updateHcthSetting(changes, () => this[pw1].value('') || this[pw2].value(''));
        }
    }

    saveEmailTempate = (titleKey, editorKey) => {
        const changes = {};
        changes[titleKey] = this[titleKey].value();
        changes[editorKey + 'Text'] = this[editorKey].text();
        changes[editorKey + 'Html'] = this[editorKey].html();
        this.props.updateHcthSetting(changes);
    }

    submitKey = function (change) {
        try {
            this[change].onUploadFile({ key: change });
        } catch (error) {
            console.error(error);
        }
    }

    onSuccess = (data) => {
        try {
            if (data.error) {
                return T.notify('Tải lên tập tin thất bại', 'danger');
            }
            T.notify('Tải lên tập tin thành công', 'success');
            this.certificate.setData('caFile');
            this.privateKey.setData('caFile');
        } catch (error) {
            console.error(error);
        }
    }

    onSaveBoolean = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value() || '';
        }
        arguments.length && this.props.updateHcthSetting(changes);
    }

    render() {
        const permission = this.getUserPermission('hcthSetting'), userPermissions = this.getCurrentPermissions(),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cog',
            backRoute: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Cấu hình'
            ],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Email</h3>
                        <FormTextBox ref={e => this.email = e} label='Email' type='email' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('email')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Quỹ số văn bản</h3>
                        <div className='tile-body row'>
                            <FormCheckbox className='col-md-12' isSwitch ref={e => this.duyetSoTuDong = e} label='Duyệt yêu cầu số văn bản tự động' readOnly={readOnly} />
                            <FormCheckbox className='col-md-12' isSwitch ref={e => this.duyetVanBanTuDong = e} label='Duyệt văn bản đi (giấy) tự động' readOnly={readOnly} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.onSaveBoolean('duyetSoTuDong', 'duyetVanBanTuDong')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Lịch họp</h3>
                        <div className='tile-body row'>
                            <FormCheckbox className='col-md-12' isSwitch ref={e => this.duyetLichHopTuDong = e} label='Duyệt yêu cầu đăng ký phòng họp tự động' readOnly={readOnly} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.onSaveBoolean('duyetLichHopTuDong')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Mật khẩu email</h3>
                        <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu email' type='password' readOnly={readOnly} />
                        <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu email' type='password' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.changePassword('emailPassword1', 'emailPassword2', 'emailPassword')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Mật khẩu khoá bí mật</h3>
                        <FormTextBox ref={e => this.privatePassword1 = e} label='Mật khẩu khoá bí mật' type='password' readOnly={readOnly} />
                        <FormTextBox ref={e => this.privatePassword2 = e} label='Nhập lại mật khẩu private' type='password' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.changePassword('privatePassword1', 'privatePassword2', 'rootPassphrase')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Chứng chỉ</h3>
                        <FileBox ref={e => this.certificate = e} postUrl='/user/upload' uploadType='caFile' userData='caFile' success={this.onSuccess} pending={true} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.submitKey('certificate')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Khoá bí mật</h3>
                        <FileBox ref={e => this.privateKey = e} postUrl='/user/upload' uploadType='caFile' userData='caFile' success={this.onSuccess} pending={true} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.submitKey('privateKey')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Năm hành chính</h3>
                        <FormTextBox ref={e => this.administrativeYear = e} label='Năm' type='text' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('administrativeYear')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#chiDaoEmail'>Email chỉ đạo</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#nhanCongVanDenEmail'>Email nhận văn bản đến</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#nhanVanBanDiGiayEmail'>Email nhận văn bản đi giấy</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#guiOtpEmail'>Email gửi OTP</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#guiSignEmail'>Email gửi khi ký</a>
                        </li>
                        {userPermissions.includes('developer:login') && <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#templateGen'>Template generator</a>
                        </li>}
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='chiDaoEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.chiDaoEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.chiDaoEmailEditor = e} label='Nội dung email' smallText='Tham số: {id}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('chiDaoEmailTitle', 'chiDaoEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='nhanCongVanDenEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.nhanCongVanDenEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.nhanCongVanDenEmailEditor = e} label='Nội dung email' smallText='Tham số: {id, soDen, soCongVan, donViGui, ngayCongVan, ngayNhan, trichYeu}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('nhanCongVanDenEmailTitle', 'nhanCongVanDenEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='nhanVanBanDiGiayEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.nhanVanBanDiGiayEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.nhanVanBanDiGiayEmailEditor = e} label='Nội dung email' smallText='Tham số: {id, donViGui, ngayGui, ngayNhan, trichYeu}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('nhanVanBanDiGiayEmailTitle', 'nhanVanBanDiGiayEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='guiOtpEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.guiOtpEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.guiOtpEmailEditor = e} label='Nội dung email' smallText='Tham số: {otpCode}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('guiOtpEmailTitle', 'guiOtpEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        <div className='tab-pane fade' id='guiSignEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.guiSignEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.guiSignEmailEditor = e} label='Nội dung email' smallText='Tham số: {soCongVan, nguoiKy}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('guiSignEmailTitle', 'guiSignEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        <div className='tab-pane fade' id='templateGen'>
                            <div className='tile-body'>
                                <FormEditor ref={e => this.templateGen = e} label='Nội dung email' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => navigator.clipboard.writeText(this.templateGen.html())}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthSetting: state.hcth.hcthSetting });
const mapActionsToProps = { getHcthSettingAll, getHcthSetting, updateHcthSetting, deleteHcthSetting };
export default connect(mapStateToProps, mapActionsToProps)(HcthSettingAdminPage);
