import React from 'react';
import { connect } from 'react-redux';
import { getTcSettingAll, updateTcSetting, deleteTcSetting, getTcSettingKeys, updateAutoDinhPhi } from './redux';
import { AdminPage, FormSelect, FormTextBox, FormEditor, FormCheckbox } from 'view/component/AdminPage';
// import { getTcThongTin } from '../tcThongTin/redux';
// import { LoginToTestModal } from 'modules/mdCongTacSinhVien/fwStudents/adminPage';

const listKeys = ['hocPhiNamHoc', 'hocPhiHocKy', 'email', 'tcAddress',
    'tcPhone', 'tcEmail', 'tcSupportPhone',
    'hocPhiEmailDongTitle', 'hocPhiEmailDongEditorText', 'hocPhiEmailDongEditorHtml',
    'hocPhiEmailPhatSinhTitle', 'hocPhiEmailPhatSinhEditorText', 'hocPhiEmailPhatSinhEditorHtml',
    'hocPhiEmailHoanTraTitle', 'hocPhiEmailHoanTraEditorText', 'hocPhiEmailHoanTraEditorHtml',
    'hocPhiSmsDong', 'hocPhiSmsPhatSinh', 'hocPhiSmsHoanTra',
    'hocPhiEmailNhacNhoTitle', 'hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoEditorHtml',
    'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'hocPhiEmailTraHoaDonEditorHtml',
    'autoDinhPhi', 'dungSoTien', 'emailInvoice',
    'thueEmailDongTitle', 'thueEmailDongEditorText', 'thueEmailDongEditorHtml'
];
class TcSettingAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getTcSettingKeys(listKeys,
                items => {
                    (items || []).forEach(item => {
                        if (item.key == 'hocPhiEmailDongEditorHtml') {
                            this.hocPhiEmailDongEditor.html(item.value);
                        } else if (item.key == 'hocPhiEmailPhatSinhEditorHtml') {
                            this.hocPhiEmailPhatSinhEditor.html(item.value);
                        } else if (item.key == 'hocPhiEmailHoanTraEditorHtml') {
                            this.hocPhiEmailHoanTraEditor.html(item.value);
                        } else if (item.key == 'hocPhiEmailNhacNhoEditorHtml') {
                            this.hocPhiEmailNhacNhoEditor.html(item.value);
                        } else if (item.key == 'hocPhiEmailTraHoaDonEditorHtml') {
                            this.hocPhiEmailTraHoaDonEditor.html(item.value);
                        } else if (item.key == 'noiDungLuuYEditorHtml') {
                            this.noiDungLuuYEditor.html(item.value);
                        } else if (item.key === 'luuYKeKhaiThueEditorHtml') {
                            this.luuYKeKhaiThueEditor.html(item.value);
                        } else if (item.key === 'thueEmailDongEditorHtml') {
                            this.thueEmailDongEditor.html(item.value);
                        } else if (item.key == 'dungSoTien') {
                            this.dungSoTien.value(item.value == '1' ? true : false);
                        } else {
                            if (item.key == 'hocPhiNamHoc') this.hocPhiNamHocEnd.value(Number(item.value) + 1);
                            const component = this[item.key];
                            component && component.value && component.value(item.value);
                        }
                    });
                });
            // this.props.getTcThongTin(items => this.setState({ dataThongTin: items }));
        });
    }

    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        arguments.length && this.props.updateTcSetting(changes);
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
            this.props.updateTcSetting({ emailPassword: password1 }, () => this.emailPassword1.value('') || this.emailPassword2.value(''));
        }
    }

    saveEmailTempate = (titleKey, editorKey) => {
        const changes = {};
        changes[titleKey] = this[titleKey].value();
        changes[editorKey + 'Text'] = this[editorKey].text();
        changes[editorKey + 'Html'] = this[editorKey].html();
        this.props.updateTcSetting(changes);
    }
    saveTemplateThongBao = (editorKey) => {
        const changes = {};
        changes[editorKey + 'Text'] = this[editorKey].text();
        changes[editorKey + 'Html'] = this[editorKey].html();
        this.props.updateTcSetting(changes);
    }

    changeAutoDinhPhi = () => {
        const changes = {
            autoDinhPhi: this.dinhPhi.value() ? 1 : 0
        };

        this.props.updateAutoDinhPhi(changes, (result) => {
            if (result?.error) {
                this.dinhPhi.value(!this.dinhPhi.value());
            }
        });
    }

    changeDungSoTien = () => {
        const changes = {
            dungSoTien: this.dungSoTien.value() ? 0 : 1
        };
        this.props.updateTcSetting(changes);

    }
    render() {
        const permission = this.getUserPermission('tcSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cog',
            breadcrumb: ['Cấu hình'],
            content:
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Cấu hình học phí năm học</h3>
                            <FormTextBox ref={e => this.hocPhiNamHoc = e} label='Từ năm' type='year' readOnly={readOnly} onChange={e => {
                                const current = e;
                                if (current && !isNaN(current)) {
                                    this.hocPhiNamHocEnd.value(Number(current) + 1);
                                }
                            }} />
                            <FormTextBox ref={e => this.hocPhiNamHocEnd = e} label='Đến năm' type='year' readOnly={true} />
                            <FormSelect ref={e => this.hocPhiHocKy = e} label='Học kỳ' data={[1, 2, 3]} readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiNamHoc', 'hocPhiHocKy')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

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
                            <h3 className='tile-title'>Thông tin phòng KH-TC</h3>
                            <FormTextBox ref={e => this.tcAddress = e} label='Địa chỉ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.tcPhone = e} label='Điện thoại liên hệ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.tcEmail = e} label='Email liên hệ' readOnly={readOnly} />
                            <FormTextBox ref={e => this.tcSupportPhone = e} label='Điện thoại hỗ trợ' readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('tcAddress', 'tcPhone', 'tcEmail', 'tcSupportPhone')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Email nhận kết quả kiểm tra hóa đơn</h3>
                            <FormTextBox ref={e => this.emailInvoice = e} label='Email nhận kết quả kiểm tra hóa đơn' type='email' readOnly={readOnly} />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('emailInvoice')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        {/* <div className='tile'>
                            <h3 className='tile-title'>Định phí tự động</h3>
                            <FormCheckbox style={{ width: '24px' }} ref={e => this.dinhPhi = e} isSwitch={true} readOnly={readOnly} onChange={this.changeAutoDinhPhi}></FormCheckbox>
                        </div> */}
                        <div className='tile'>
                            <h3 className='tile-title'>Thanh toán đúng số tiền</h3>
                            <FormCheckbox style={{ width: '24px' }} ref={e => this.dungSoTien = e} isSwitch={true} readOnly={readOnly} onChange={this.changeDungSoTien}></FormCheckbox>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#hocPhiEmailDong'>Email đóng học phí</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#hocPhiEmailNhacNho'>Email nhắc nhở</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#hocPhiEmailPhatSinh'>Email phát sinh học phí</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#hocPhiEmailHoanTra'>Email hoàn trả học phí</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#hocPhiEmailTraHoaDon'>Email trả hóa đơn</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#noiDungLuuY'>Lưu ý hiển thị học phí sinh viên</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#luuYKeKhaiThue'>Lưu ý kê khai thuế</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#thueEmailDong'>Email thanh toán thuế thành công</a>
                            </li>
                        </ul>

                        <div className='tab-content tile'>
                            <div className='tab-pane fade active show' id='hocPhiEmailDong'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.hocPhiEmailDongTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.hocPhiEmailDongEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('hocPhiEmailDongTitle', 'hocPhiEmailDongEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='hocPhiEmailNhacNho'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.hocPhiEmailNhacNhoTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.hocPhiEmailNhacNhoEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('hocPhiEmailNhacNhoTitle', 'hocPhiEmailNhacNhoEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='hocPhiEmailPhatSinh'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.hocPhiEmailPhatSinhTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.hocPhiEmailPhatSinhEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('hocPhiEmailPhatSinhTitle', 'hocPhiEmailPhatSinhEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='hocPhiEmailHoanTra'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.hocPhiEmailHoanTraTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.hocPhiEmailHoanTraEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('hocPhiEmailHoanTraTitle', 'hocPhiEmailHoanTraEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='hocPhiEmailTraHoaDon'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.hocPhiEmailTraHoaDonTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.hocPhiEmailTraHoaDonEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('hocPhiEmailTraHoaDonTitle', 'hocPhiEmailTraHoaDonEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='noiDungLuuY'>
                                <div className='tile-body'>
                                    <FormEditor ref={e => this.noiDungLuuYEditor = e} label='Nội dung lưu ý trang học phí' height={400}></FormEditor>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveTemplateThongBao('noiDungLuuYEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='luuYKeKhaiThue'>
                                <div className='tile-body'>
                                    <FormEditor ref={e => this.luuYKeKhaiThueEditor = e} label={<b>Nội dung lưu ý trang kê khai thuế tncn cán bộ</b>} height={400}></FormEditor>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveTemplateThongBao('luuYKeKhaiThueEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade active show' id='thueEmailDong'>
                                <div className='tile-body'>
                                    <FormTextBox ref={e => this.thueEmailDongTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                    <FormEditor ref={e => this.thueEmailDongEditor = e} label='Nội dung email' height={400} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('thueEmailDongTitle', 'thueEmailDongEditor')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>
                            {/* <div className='tab-pane fade' id='hocPhiSmsPhatSinh'>
                                <div className='tile-body'>
                                    <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                    <FormRichTextBox ref={e => this.hocPhiSmsPhatSinh = e} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSmsPhatSinh')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>

                            <div className='tab-pane fade' id='hocPhiSmsHoanTra'>
                                <div className='tile-body'>
                                    <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                    <FormRichTextBox ref={e => this.hocPhiSmsHoanTra = e} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSmsHoanTra')}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div> */}
                        </div>
                    </div>

                </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, TcSetting: state.finance.TcSetting });
const mapActionsToProps = { getTcSettingAll, updateTcSetting, deleteTcSetting, getTcSettingKeys, updateAutoDinhPhi };
export default connect(mapStateToProps, mapActionsToProps)(TcSettingAdminPage);