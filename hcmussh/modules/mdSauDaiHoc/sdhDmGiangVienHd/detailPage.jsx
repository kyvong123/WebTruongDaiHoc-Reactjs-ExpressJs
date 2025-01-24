import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormImageBox, FormTextBox, FormSelect, FormDatePicker, AdminPage } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { getGiangVienHd } from './redux';

class CaNhanGiangVienHd extends AdminPage {
    state = { image: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            let route = T.routeMatcher('/user/sau-dai-hoc/giang-vien-huong-dan/:ma'),
                shcc = route.parse(window.location.pathname).ma;
            shcc && this.props.getGiangVienHd(shcc, data => {
                this.value(data.item);
            });
        });
    }
    handleHo = (e) => {
        this.ho.value(e.target.value.toUpperCase());
    }

    handleTen = (e) => {
        this.ten.value(e.target.value.toUpperCase());
    }

    value = (item) => {
        this.setState({ emailTruong: item.email }, () => {
            this.shcc = item.shcc;
            this.imageBox.setData('GiangVienHdImage:' + item.email, item.image ? item.image : '/img/avatar.png');
            this.donVi.value(item.maDonVi);
            this.maTheCanBo.value(item.shcc);
            this.ho.value(item.ho ? item.ho : '');
            this.ten.value(item.ten ? item.ten : '');
            this.phai.value(item.phai);
            this.ngaySinh.value(item.ngaySinh ? item.ngaySinh : '');
        });

    }

    imageChanged = (data) => {
        if (data && data.image) {
            T.notify('Cập nhật ảnh đại diện thành công!', 'success');
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.readOnly && this.props.updateSystemState({ user });
        }
    };

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    render = () => {
        let readOnly = this.props.readOnly;
        const permission = this.getUserPermission('sdhDmGiangVienHd');
        const readOnlyByTccb = this.props.readOnlyByTccb;
        if (permission.write && permission.read) readOnly = false;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin cá nhân giảng viên</h3>
                <div className='tile-body row'>
                    <div style={{ display: 'flex', flex: 'wrap', alignItems: 'center' }}>
                        <FormImageBox ref={e => this.imageBox = e} description='Nhấp hoặc kéo thả để thay đổi ảnh cá nhân'
                            postUrl='/user/upload' uploadType='CanBoImage' onSuccess={this.imageChanged} className='col-md-3 rounded-circle' isProfile={true} readOnly={readOnly} />
                        <div className='col-md-9'>
                            <div className='row'>
                                <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' style={{ textTransform: 'uppercase', display: (readOnly || readOnlyByTccb) ? 'none' : 'block' }} className='col-md-4' onChange={this.handleHo} required maxLength={100} readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.ten = e} label='Tên' style={{ textTransform: 'uppercase', display: (readOnly || readOnlyByTccb) ? 'none' : 'block' }} className='col-md-4' onChange={this.handleTen} required maxLength={100} readOnly={readOnly || readOnlyByTccb} />
                                <FormSelect ref={e => this.donVi = e} label='Đơn vị công tác' className='form-group col-md-8' required data={SelectAdapter_DmDonVi} readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.maTheCanBo = e} label='Mã giảng viên' className='form-group col-md-4' readOnly={readOnly || readOnlyByTccb} required maxLength={10} onChange={this.handleNewShcc} />
                                <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-md-8' label='Ngày sinh' required readOnly={readOnly} />
                                <FormSelect ref={e => this.phai = e} label='Giới tính' className='col-md-4' required data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => ({ sdhDmGiangVienHd: state.sdh.sdhDmGiangVienHd, system: state.system });
const mapActionsToProps = { getGiangVienHd };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CaNhanGiangVienHd);