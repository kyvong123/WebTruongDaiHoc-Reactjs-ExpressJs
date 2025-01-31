import React from 'react';
import { connect } from 'react-redux';
import { getTcSettingAll, updateTcSetting, deleteTcSetting } from './redux';
import { AdminPage, FormTextBox, FormSelect } from 'view/component/AdminPage';

class AdminSettingsPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getTcSettingAll(items => {
                (items || []).forEach(item => {
                    const component = this[item.key];
                    component && item.key != 'matKhauMeinvoice' && item.key != 'taiChinhEmailPassword' && item.key != 'taiChinhEmailList' && component.value && component.value(item.value || '');
                    item.key == 'taiChinhEmailList' && item.value && this[item.key].value(item.value.split(','));
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
        arguments.length && this.props.updateTcSetting(changes);
    }

    onSaveMatKhauMeinVoice = () => {
        const matKhau = this.matKhauMeinvoice.value();
        const xacNhan = this.xacNhanMatKhauMeInvoice.value();
        if (!matKhau) {
            T.notify('Mật khẩu trống', 'danger');
            this.matKhauMeinvoice.focus();
        } else if (!xacNhan) {
            T.notify('Mật khẩu xác nhận trống', 'danger');
            this.matKhauMeinvoice.focus();
        } else if (matKhau !== xacNhan) {
            T.notify('Mật khẩu xác nhận không khớp', 'danger');
            this.matKhauMeinvoice.focus();
        } else {
            this.props.updateTcSetting({ 'matKhauMeinvoice': matKhau }, () => {
                this.matKhauMeinvoice.clear();
                this.xacNhanMatKhauMeInvoice.clear();
            });
        }
    }

    onSaveEmailConfig = () => {
        const matKhau = this.matKhauEmail.value();
        const xacNhan = this.xacNhanMatKhauEmail.value();
        const updateData = {};
        if (matKhau) {
            updateData['taiChinhEmailPassword'] = matKhau;
            if (matKhau != xacNhan) {
                T.notify('Mật khẩu email không khớp mật khẩu xác nhận');
                return;
            }
        }

        updateData['taiChinhEmailList'] = this.taiChinhEmailList.value() || [];
        updateData['taiChinhEmailList'] = updateData['taiChinhEmailList'].toString();

        this.props.updateTcSetting(updateData, () => {
            this.matKhauEmail.clear();
            this.xacNhanMatKhauEmail.clear();
        });

    }

    render() {
        const permission = this.getUserPermission('tcSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình Admin',
            icon: 'fa fa-cog',
            breadcrumb: ['Cấu hình Admin'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>VNPAY (Agribank)</h3>
                        <FormTextBox ref={e => this.vnp_TmnCodeAgribank = e} label='Code luồng thu hộ' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_TmnCodeVnpayAgribank = e} label='Code luồng không thu hộ' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_HashSecretAgribank = e} label='Secret key Agribank' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('vnp_TmnCodeAgribank', 'vnp_TmnCodeVnpayAgribank', 'vnp_HashSecretAgribank')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>

                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>VNPAY (Vietcombank)</h3>
                        <FormTextBox ref={e => this.vnp_TmnCodeVcb = e} label='Code luồng thu hộ' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_TmnCodeVnpayVcb = e} label='Code luồng không thu hộ' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_HashSecretVcb = e} label='Secret key VCB' readOnly={readOnly} />

                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('vnp_TmnCodeVcb', 'vnp_TmnCodeVnpayVcb', 'vnp_HashSecretVcb')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>

                </div>
                <div className='col-md-12'>
                    <div className='tile'>
                        <h3 className='tile-title'>VNPAY (Config)</h3>
                        <FormTextBox ref={e => this.vnp_Version = e} label='Version VNPay' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_Command = e} label='Mã lệnh (default: pay)' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_CurrCode = e} label='Đơn vị tiền tệ (defaut: VND)' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnpayUrl = e} label='VNPAY create bill url' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_ReturnUrl = e} label='URL sau khi thanh toán thành công' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('vnp_Version', 'vnp_Command', 'vnp_CurrCode', 'vnpayUrl', 'vnp_ReturnUrl')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>

                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Ngân hàng (Sandbox): Chuỗi bí mật</h3>
                        <FormTextBox ref={e => this.secretCodeBidvSandbox = e} label='BIDV' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeVcbSandbox = e} label='VCB' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeAgriSandbox = e} label='Agribank' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('secretCodeBidvSandbox', 'secretCodeVcbSandbox', 'secretCodeAgriSandbox')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Ngân hàng: Chuỗi bí mật</h3>
                        <FormTextBox ref={e => this.secretCodeBidv = e} label='BIDV' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeVcb = e} label='VCB' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeAgri = e} label='Agribank' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('secretCodeBidv', 'secretCodeVcb', 'secretCodeAgri')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin tài khoản meinvoice</h3>
                        <div className='tile-body row'>
                            <FormTextBox className='col-md-12' label='Meinvoice app id' ref={e => this.meinvoiceAppId = e} />
                            <FormTextBox className='col-md-12' label='Mã số thuế' ref={e => this.meinvoiceMaSoThue = e} />
                            <FormTextBox className='col-md-12' label='Tài khoản' ref={e => this.meinvoiceUsername = e} />
                            <FormTextBox className='col-md-12' label='Meinvoice url' ref={e => this.meinvoiceUrl = e} />
                            <FormSelect className='col-md-12' ref={e => this.meinvoiceMauHoaDon = e} label='Mẫu hóa đơn' data={['2C22TCH', '2C22TDH', '2C23TCH', '2C23TDH', '2C24TCH', '2C24TDH']} readOnly={readOnly} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('meinvoiceAppId', 'meinvoiceMaSoThue', 'meinvoiceUsername', 'meinvoiceUrl', 'meinvoiceMauHoaDon')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>

                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Cập nhật mật khẩu tài khoản meinvoice</h3>
                        <div className='tile-body row'>
                            <FormTextBox className='col-md-12' label='Mật khẩu' ref={e => this.matKhauMeinvoice = e} type='password' />
                            <FormTextBox className='col-md-12' label='Xác nhận mật khẩu' ref={e => this.xacNhanMatKhauMeInvoice = e} type='password' />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={this.onSaveMatKhauMeinVoice}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='tile'>
                        <h3 className='tile-title'>Hệ thống email</h3>
                        <div className='tile-body row'>
                            <FormSelect className='col-md-12' label='Danh sách mail khả dụng' ref={e => this.taiChinhEmailList = e} data={Array.from(Array(25).keys()).map(item => `no-reply-khtc${`0${item + 1}`.slice(-2)}@hcmussh.edu.vn`)} multiple />
                            <FormTextBox className='col-md-12' label='Mật khẩu' ref={e => this.matKhauEmail = e} type='password' />
                            <FormTextBox className='col-md-12' label='Xác nhận mật khẩu' ref={e => this.xacNhanMatKhauEmail = e} type='password' />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={this.onSaveEmailConfig}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, TcSetting: state.finance.TcSetting });
const mapActionsToProps = { getTcSettingAll, updateTcSetting, deleteTcSetting };
export default connect(mapStateToProps, mapActionsToProps)(AdminSettingsPage);