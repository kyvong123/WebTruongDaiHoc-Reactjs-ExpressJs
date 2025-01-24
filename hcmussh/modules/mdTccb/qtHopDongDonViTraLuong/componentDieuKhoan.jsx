import React from 'react';
import { connect } from 'react-redux';
import { getDmDonViFaculty, getDmDonVi, getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import moment from 'moment';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmNgachCdnnV2, getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { getDmNgachLuong } from 'modules/mdDanhMuc/dmNgachLuong/redux';
import { getDmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';

const defaultValue = {
    congViecDuocGiao: 'Theo sự phân công của ',
    chiuSuPhanCong: 'Chịu sự điều hành, quản lý của '
};

export class ComponentDieuKhoan extends React.Component {

    state = { isThuViec: true, isXacDinhTg: true, tenDonVi: '', maDv: null }
    cdnnMapper = {}
    tenDonViMapper = {}

    componentDidMount() {
        this.props.getDmDonViAll(data => {
            data.forEach(item => this.tenDonViMapper[item.ma] = item.ten);
            let listMaKhoa = data.filter(item => item.maPl == 1).map(item => item.ma);
            this.setState({ listMaKhoa });
        });
        this.props.getDmNgachCdnnAll(data => data.forEach(item => this.cdnnMapper[item.ma] = item.ma));
    }

    setVal = (data = null) => {
        if (data) {
            let { id, loaiHopDong, batDauLamViec, ketThucHopDong, diaDiemLamViec,
                congViecDuocGiao, ngach, heSo, bac, phanTramHuong, chiuSuPhanCong, ngayTaiKy, ngayKyHopDong } = data;
            this.setState({ id, ngach });
            this.props.getDmDonVi(diaDiemLamViec, data => {
                this.setState({ tenDonVi: data.ten, maDv: diaDiemLamViec, ngach: this.cdnnMapper[ngach] }, () => {
                    this.loaiHopDong.value(loaiHopDong);
                    this.props.getDmLoaiHopDong(loaiHopDong, loaiHD => {
                        if (loaiHD && loaiHD.khongXacDinhTh)
                            this.setState({ isXacDinhTg: false });
                        else {
                            loaiHD && loaiHD.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });

                        }
                    });
                    this.ngayKyHopDong.value(ngayKyHopDong ? ngayKyHopDong : '');
                    this.batDauLamViec.value(batDauLamViec ? batDauLamViec : '');
                    this.ketThucHopDong.value(ketThucHopDong ? ketThucHopDong : '');
                    this.donVi.value(diaDiemLamViec);
                    this.congViecDuocGiao.value(congViecDuocGiao ? congViecDuocGiao : '');
                    this.chucDanh.value(ngach);
                    this.heSoLuong.value(heSo);
                    this.bac.value(bac);
                    this.phanTramHuong.value(phanTramHuong ? phanTramHuong : '');
                    this.chiuSuPhanCong.value(chiuSuPhanCong ? chiuSuPhanCong + ' ' + this.state.tenDonVi.normalizedName() : chiuSuPhanCong + ' ' + this.state.tenDonVi.normalizedName());
                    this.ngayTaiKy.value(ngayTaiKy ? ngayTaiKy : '');
                });
            });
        }
    }

    handleNgach = (item) => {
        this.setState({ ngach: this.cdnnMapper[item.id], maNgach: item.id }, () => {
            this.bac.value(null);
        });
    }

    handleBac = (item) => {
        this.props.getDmNgachLuong(item.id, this.state.ngach, data => {
            if (data) {
                if (data.bac != 0)
                    this.heSoLuong.value(data.heSo);
            }
        });
    }

    handleLoaiHD = (item) => {
        this.props.getDmLoaiHopDong(item.id, data => {
            if (data && data.khongXacDinhTh)
                this.setState({ isXacDinhTg: false });
            else {
                data && data.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });
                let tuNgayValue = this.ngayKyHopDong.value();
                if (tuNgayValue) {
                    const newDate = moment(tuNgayValue).add(parseInt(data.thoiGian), 'M');
                    this.ketThucHopDong.value(newDate.valueOf() - 24 * 3600000);
                    this.ngayTaiKy.value(newDate.valueOf());
                }
            }
        });
    }

    handleTuNgay = (value) => {
        if (value && this.state.isXacDinhTg && this.state.thoiGianHD) {
            const newDate = moment(value).add(parseInt(this.state.thoiGianHD), 'M');
            this.ketThucHopDong.value(newDate.valueOf() - 24 * 3600000);
            this.ngayTaiKy.value(newDate.valueOf());
        }
        value && this.batDauLamViec.value(value);
    }

    handleDonVi = () => {
        let trachNhiem = this.state.listMaKhoa.includes(this.state.maDv) ? 'Trưởng khoa ' : 'Trưởng/Giám đốc ';
        this.chiuSuPhanCong.value(defaultValue.chiuSuPhanCong + trachNhiem + this.tenDonViMapper[this.state.maDv].normalizedName());
        this.congViecDuocGiao.value(defaultValue.congViecDuocGiao + trachNhiem + this.tenDonViMapper[this.state.maDv].normalizedName());
    }

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
                id: this.state.id,
                loaiHopDong: this.validate(this.loaiHopDong),
                batDauLamViec: this.validate(this.batDauLamViec)?.getTime(),
                ngayKyHopDong: this.validate(this.ngayKyHopDong)?.getTime(),
                ketThucHopDong: this.validate(this.ketThucHopDong)?.getTime(),
                diaDiemLamViec: this.validate(this.donVi),
                ngach: this.validate(this.chucDanh),
                congViecDuocGiao: this.validate(this.congViecDuocGiao),
                chiuSuPhanCong: this.validate(this.chiuSuPhanCong),
                bac: this.validate(this.bac),
                heSo: this.validate(this.heSoLuong),
                phanTramHuong: this.validate(this.phanTramHuong),
                ngayTaiKy: this.validate(this.ngayTaiKy)?.getTime(),
            };
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    getDonVi = () => {
        return this.donVi.value();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongDvtl:write');
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thời hạn và công việc hợp đồng</h3>
                <div className='tile-body row'>
                    <div className='form-group col-xl-6 col-md-6'><FormSelect data={SelectAdapter_DmLoaiHopDongV2} ref={e => this.loaiHopDong = e} label='Loại hợp đồng' onChange={this.handleLoaiHD} required readOnly={readOnly} /></div>
                    <div className='form-group col-xl-6 col-md-6'><FormDatePicker type='date-mask' ref={e => this.ngayKyHopDong = e} label='Ngày ký hợp đồng' required /></div>
                    <div className='form-group col-xl-3 col-md-6'><FormDatePicker type='date-mask' ref={e => this.batDauLamViec = e} label='Ngày bắt đầu làm việc' onChange={this.handleTuNgay} required readOnly={readOnly} /></div>
                    <div className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'}><FormDatePicker type='date-mask' ref={e => this.ketThucHopDong = e} label='Ngày kết thúc hợp đồng' required={this.state.isXacDinhTg} readOnly={readOnly} /></div>
                    <div className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'}><FormDatePicker type='date-mask' ref={e => this.ngayTaiKy = e} label='Ngày ký hợp đồng tiếp theo' required={this.state.isXacDinhTg} readOnly={readOnly} /></div>
                    <div className='form-group col-xl-12 col-md-12'><FormSelect data={SelectAdapter_DmDonVi} ref={e => this.donVi = e} label='Địa điểm làm việc' onChange={value => {
                        this.setState({ maDv: value.id, preShcc: value.preShcc }, () => {
                            this.props.genNewShcc(this.state.maDv, this.state.preShcc, this.state.nhomNgach);
                        });
                        this.handleDonVi();
                    }} required /></div>
                    <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectAdapter_DmNgachCdnnV2} ref={e => this.chucDanh = e} onChange={(value) => {
                        this.setState({ nhomNgach: value.nhom }, () => {
                            this.props.genNewShcc(this.state.maDv, this.state.preShcc, this.state.nhomNgach);
                        });
                        this.handleNgach(value);
                    }} label='Chức danh nghề nghiệp' required /></div>
                    <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.congViecDuocGiao = e} label='Công việc được giao' /></div>
                    <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.chiuSuPhanCong = e} label='Chịu sự phân công' /></div>
                    <div className='form-group col-xl-6 col-md-6'><FormSelect data={SelectAdapter_DmDonVi} ref={e => this.donViChiTra = e} label='Đơn vị chi trả' /></div>
                    <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.bac = e} label='Bậc' /></div>
                    <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.heSoLuong = e} label='Hệ số' /></div>
                    <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.phanTramHuong = e} label='Phần trăm hưởng' /></div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.tccb.qtHopDongDvtl, system: state.system });
const mapActionsToProps = {
    getDmDonViFaculty, getDmDonVi, getDmNgachCdnnAll, getDmNgachLuong, getDmLoaiHopDong, getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDieuKhoan);