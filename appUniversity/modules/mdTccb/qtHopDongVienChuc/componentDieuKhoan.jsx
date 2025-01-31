import React from 'react';
import { connect } from 'react-redux';
import { getDmDonVi, getDmDonViAll, getDmDonViFaculty, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import moment from 'moment';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { getDmLoaiHopDong, SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { getDmNgachCdnnAll, SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { getDmNgachLuong } from 'modules/mdDanhMuc/dmNgachLuong/redux';
import { SelectAdapter_DmChucDanhChuyenMonV2 } from 'modules/mdDanhMuc/dmChucDanhChuyenMon/redux';

export class ComponentDieuKhoan extends React.Component {

    state = { isThuViec: true, isXacDinhTg: true, tenDonVi: '', maDv: null };
    cdnnMapper = {};
    tenDonViMapper = {};

    componentDidMount() {
        this.props.getDmDonViAll(data => {
            data.forEach(item => this.tenDonViMapper[item.ma] = item.ten);
            let listMaKhoa = data.filter(item => item.maPl == 1).map(item => item.ma);
            this.setState({ listMaKhoa });
        });
        this.props.getDmNgachCdnnAll(data => data.forEach(item => this.cdnnMapper[item.ma] = item.id));
    }

    setVal = (data = null) => {
        if (data) {
            let {
                ma, noiDung, loaiHd, diaDiemLamViec, maNgach, heSo, bac, ngayKyHopDong, ngayBatDauLamViec, ngayKetThucHopDong, ngayKyHdTiepTheo, nhiemVu, thoiGianXetNangBacLuong, chucDanhChuyenMon
            } = data;
            this.setState({ ma, maNgach });
            this.props.getDmDonVi(diaDiemLamViec, data => {
                this.setState({ tenDonVi: data.ten, maDv: diaDiemLamViec, ngach: this.cdnnMapper[maNgach] }, () => {
                    this.loaiHd.value(loaiHd);
                    this.props.getDmLoaiHopDong(loaiHd, loaiHD => {
                        if (loaiHD && loaiHD.khongXacDinhTh)
                            this.setState({ isXacDinhTg: false });
                        else {
                            loaiHD && loaiHD.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });
                        }
                    });
                    this.noiDung.value(noiDung ? noiDung : noiDung);
                    this.ngayKyHopDong.value(ngayKyHopDong ? ngayKyHopDong : ngayKyHopDong);
                    this.ngayBatDauLamViec.value(ngayBatDauLamViec ? ngayBatDauLamViec : ngayBatDauLamViec);
                    this.ngayKetThucHopDong.value(ngayKetThucHopDong ? ngayKetThucHopDong : ngayKetThucHopDong);
                    this.ngayKyHdTiepTheo.value(ngayKyHdTiepTheo ? ngayKyHdTiepTheo : ngayKyHdTiepTheo);
                    this.nhiemVu.value(nhiemVu ? nhiemVu : nhiemVu);
                    this.thoiGianXetNangBacLuong.value(thoiGianXetNangBacLuong ? thoiGianXetNangBacLuong : thoiGianXetNangBacLuong);
                    this.donVi.value(diaDiemLamViec);
                    this.maNgach.value(maNgach);
                    this.chucDanhChuyenMon.value(chucDanhChuyenMon);
                    this.heSo.value(heSo);
                    this.bac.value(bac);
                });
            });
        } else {
            this.ngayKyHopDong.value(new Date().getTime());
        }
    };

    handleLoaiHD = (item) => {
        this.props.getDmLoaiHopDong(item.id, data => {
            if (data && data.khongXacDinhTh)
                this.setState({ isXacDinhTg: false });
            else {
                data && data.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });
                let tuNgayValue = this.ngayBatDauLamViec.value();
                if (tuNgayValue) {
                    const newDate = moment(tuNgayValue).add(parseInt(data.thoiGian), 'M');
                    this.ngayKetThucHopDong.value(newDate.valueOf() - 24 * 3600000);
                    this.ngayKyHdTiepTheo.value(newDate.valueOf());
                }
            }
        });
    };

    handleTuNgay = (value) => {
        if (value && this.state.isXacDinhTg && this.state.thoiGianHD) {
            const newDate = moment(value).add(parseInt(this.state.thoiGianHD), 'M');
            this.ngayKetThucHopDong.value(newDate.valueOf() - 24 * 3600000);
            this.ngayKyHdTiepTheo.value(newDate.valueOf());
        }
        if (value) {
            this.ngayBatDauLamViec.value(value);
        }
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
                ma: this.state.ma,
                noiDung: this.validate(this.noiDung),
                loaiHd: this.validate(this.loaiHd),
                ngayKyHopDong: this.validate(this.ngayKyHopDong)?.getTime(),
                ngayBatDauLamViec: this.validate(this.ngayBatDauLamViec)?.getTime(),
                ngayKetThucHopDong: this.validate(this.ngayKetThucHopDong)?.getTime(),
                ngayKyHdTiepTheo: this.validate(this.ngayKyHdTiepTheo)?.getTime(),
                diaDiemLamViec: this.validate(this.donVi),
                chucDanhChuyenMon: this.validate(this.chucDanhChuyenMon),
                bac: this.validate(this.bac),
                heSo: this.validate(this.heSo),
                nhiemVu: this.validate(this.nhiemVu),
                maNgach: this.validate(this.maNgach),
                thoiGianXetNangBacLuong: this.validate(this.thoiGianXetNangBacLuong)?.getTime(),
            };
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    getDonVi = () => {
        return this.donVi.value();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongLaoDong:write');
        return (
            <div className='tile'>
                <h3 className='tile-title'>Điều khoản hợp đồng</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-xl-12 col-md-4' readOnly={readOnly} ref={e => this.noiDung = e} label='Nội dung' />
                    <FormSelect ref={e => this.loaiHd = e} data={SelectAdapter_DmLoaiHopDongV2} className='col-xl-12 col-md-12' label='Loại hợp đồng' onChange={this.handleLoaiHD}
                        required readOnly={readOnly} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayKyHopDong = e} className='col-xl-3 col-md-6' label='Ngày ký hợp đồng' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayBatDauLamViec = e} onChange={this.handleTuNgay} className='col-xl-3 col-md-6' label='Ngày bắt đầu làm việc' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayKetThucHopDong = e} className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'} label='Ngày kết thúc hợp đồng' readOnly={readOnly} required={this.state.isXacDinhTg} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayKyHdTiepTheo = e} className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'} label='Ngày ký tiếp theo' readOnly={readOnly} style={{ display: this.state.hdkxdtg ? 'none' : '' }} />
                    <FormSelect ref={e => this.donVi = e} data={SelectAdapter_DmDonVi} className='col-xl-4 col-md-6' label='Địa điểm làm việc' readOnly={readOnly} onChange={value => {
                        this.setState({ maDv: value.id, preShcc: value.preShcc }, () => {
                            this.props.genNewShcc(this.state.maDv, this.state.preShcc, this.state.nhomNgach);
                        });
                    }} required />
                    <FormSelect className='col-xl-4 col-md-4' ref={e => this.chucDanhChuyenMon = e} readOnly={readOnly} label='Chức danh chuyên môn' data={SelectAdapter_DmChucDanhChuyenMonV2} />
                    <FormTextBox className='col-xl-4 col-md-4' ref={e => this.nhiemVu = e} label='Nhiệm vụ' readOnly={readOnly} />
                    <FormSelect ref={e => this.maNgach = e} className='col-xl-4 col-md-4' data={SelectAdapter_DmNgachCdnnV2} readOnly={readOnly} required label='Ngạch' />
                    <FormTextBox className='col-xl-4 col-md-6' ref={e => this.bac = e} label='Bậc' readOnly={readOnly} />
                    <FormTextBox className='col-xl-4 col-md-6' ref={e => this.heSo = e} label='Hệ số' readOnly={readOnly} />
                    <FormDatePicker className='col-xl-4 col-md-6' ref={e => this.thoiGianXetNangBacLuong = e} label='Thời gian xét bậc nâng lương' type='date-mask' readOnly={readOnly} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.qtHopDongLaoDong, system: state.system });
const mapActionsToProps = {
    getDmDonViFaculty, getDmDonVi, getDmNgachCdnnAll, getDmNgachLuong, getDmLoaiHopDong, getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDieuKhoan);