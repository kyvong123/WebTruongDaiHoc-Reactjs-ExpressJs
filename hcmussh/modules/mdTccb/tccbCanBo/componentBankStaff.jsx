import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmNganHang } from 'modules/mdDanhMuc/dmNganHang/redux';

class BankStaffComponent extends AdminPage {
    value = (item) => {
        this.chuTaiKhoan.value(item ? item.ho + ' ' + item.ten : '');
        this.nganHang.value(item.nganHang || 'Vietcombank');
        this.soTaiKhoan.value(item?.soTaiKhoan);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getAndValidate = () => {
        try {
            const data = {
                soTaiKhoan: this.getValue(this.soTaiKhoan),
                nganHang: this.getValue(this.nganHang)
            };
            return data;
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render() {
        return (
            <div className='tile' >
                <h3 className='tile-title'>Thông tin ngân hàng cán bộ</h3>
                <div className='tile-body' >
                    <div className='row'>
                        <div className='col-md-12' style={{ paddingTop: 10 }}>
                            <div className='row'>
                                <FormTextBox ref={e => this.chuTaiKhoan = e} label='Chủ tài khoản' className='col-md-6' readOnly />
                                <FormSelect className='col-md-4' ref={e => this.nganHang = e} label='Tên ngân hàng' data={SelectAdapter_DmNganHang} readOnly />
                                <FormTextBox ref={e => this.soTaiKhoan = e} label='Số tài khoản' className='col-md-6' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BankStaffComponent);