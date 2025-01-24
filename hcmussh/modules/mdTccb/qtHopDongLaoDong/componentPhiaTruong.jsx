import { SelectAdapter_DmChucVuV1 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectApdater_DaiDienKy } from 'modules/mdTccb/qtChucVu/redux';
import { getDaiDienKyHopDong, getTruongPhongTccb, suggestSoHopDong } from './redux';

export class ComponentPhiaTruong extends React.Component {
    componentDidMount() {
        const { address, schoolName, mobile } = this.props.system ? this.props.system : { address: '', schoolName: '', mobile: '' };
        this.address.value(JSON.parse(address).vi);
        this.schoolName.value(JSON.parse(schoolName).vi);
        this.mobile.value(mobile);
        this.props.getTruongPhongTccb(data => {
            if (!data.error) {
                data.truongPhongTCCB && data.truongPhongTCCB.shcc && this.setState({ truongPhongTCCB: data.truongPhongTCCB.shcc });
            }
        });
        this.props.suggestSoHopDong(data => {
            data.soHopDongSuggested && this.setState({ suggestSoHopDong: data.soHopDongSuggested });
        });
    }

    handleDaiDien = (shcc) => {
        let shccDaiDien = typeof (shcc) === 'object' ? shcc.id : shcc;
        this.props.getDaiDienKyHopDong(shccDaiDien, daiDien => {
            this.daiDien.value(daiDien.item.shcc);
            this.nguoiKyChucVu.value(daiDien.item.chucVu);
            this.hoTenDaiDien.value(((daiDien.item.phai == '01' ? 'Ông: ' : 'Bà: ') + daiDien.item.ho + ' ' + daiDien.item.ten).normalizedName());
            this.nguoiKyQuocTich.value(daiDien.item.quocGia ? daiDien.item.quocGia : 'VN');
            this.nguoiKyDonVi.value(30);
        });
    };

    validate = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return null;
    };

    getValue = () => {
        try {
            return {
                soHopDong: this.validate(this.soHopDong),
                ngayKyHopDong: this.validate(this.ngayKy).getTime(),
                nguoiKy: this.validate(this.daiDien)
            };
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    setVal = (data = null) => {
        if (data) {
            this.soHopDong.value(data.soHopDong);
            this.ngayKy.value(data.ngayKyHopDong);
            this.handleDaiDien(data.nguoiKy);
        } else {
            let curYear = new Date().getFullYear(), curDate = new Date().getTime();
            this.soHopDong.value(this.state.suggestSoHopDong + '/' + curYear + '/HĐLĐ-XHNV-TCCB');
            this.ngayKy.value(curDate);
            this.props.getTruongPhongTccb(data => {
                if (data.error) T.notify('Lỗi khi lấy thông tin người đại diện trường', 'danger');
                else this.handleDaiDien(data.truongPhongTCCB.shcc);
            });
        }

    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongLaoDong:write');
        return (<>
            <div className='tile'>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.soHopDong = e} label='Số hợp đồng' className='col-md-4' required maxLength={100} readOnly={readOnly} />
                    <FormDatePicker ref={e => this.ngayKy = e} type='date-mask' className='col-md-4' label='Ngày ký' required readOnly={readOnly} />
                    <FormSelect ref={e => this.daiDien = e} data={SelectApdater_DaiDienKy} className='col-md-4' label='Đại diện ký' onChange={this.handleDaiDien} required />
                </div>
            </div>
            <div className='tile'>
                <h3 className='tile-title'>Thông tin phía trường</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.hoTenDaiDien = e} label='Đại diện ký' className='col-6' readOnly={true} />
                    <FormSelect ref={e => this.nguoiKyQuocTich = e} data={SelectAdapter_DmQuocGia} label='Quốc tịch' className='col-6' readOnly={true} />
                    <FormSelect ref={e => this.nguoiKyChucVu = e} data={SelectAdapter_DmChucVuV1} label='Chức vụ' className='col-6' readOnly={true} />
                    <FormSelect ref={e => this.nguoiKyDonVi = e} data={SelectAdapter_DmDonVi} label='Đơn vị' className='col-6' readOnly={true} />

                    <FormTextBox ref={e => this.schoolName = e} label='Đại diện cho' className='col-12' readOnly={true} />
                    <FormTextBox ref={e => this.mobile = e} label='Điện thoại' className='col-12' readOnly={true} />
                    <FormTextBox ref={e => this.address = e} label='Địa chỉ' className='col-12' readOnly={true} />
                </div>
            </div>
        </>);
    }
}

const mapStateToProps = state => ({ staff: state.tccb.qtHopDongLaoDong, system: state.system });
const mapActionsToProps = {
    getTruongPhongTccb, suggestSoHopDong, getDaiDienKyHopDong
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentPhiaTruong);