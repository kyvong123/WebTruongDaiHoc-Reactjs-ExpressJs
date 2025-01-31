import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormCheckbox, FormDatePicker, getValue } from 'view/component/AdminPage';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_CtsvDmFormType } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { SelectAdapter_KhungDaoTaoCtsv } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';

const quyetDinhRa = '1';
const quyetDinhVao = '2';
const quyetDinhKhac = '3';
const tinhTrangNghiHocTamThoi = '2';
// const khoaDaoTao = Array.from({ length: 4 }, (_, i) => ({id: new Date().getFullYear() - i, text: new Date().getFullYear() - i}));

class HuyQuyetDinhModal extends AdminModal {
    state = { student: '', isSubmit: false, customParam: [], typeQuyetDinh: '', maKhoa: '', loaiHinhDt: '', heDaoTao: '', maNganhMoi: '', khoaDtMoi: '', ctdtMoi: '', kyKhuyetDanh: false, chuyenSauHuy: false, chuyenTinhTrang: null }
    onShow = (item) => {
        let { kieuQuyetDinh, soQuyetDinh, maDangKy, mssvDangKy, maFormDangKy, nguoiKy, emailDangKy, chucVuNguoiKy, model, dataCustom, tinhTrangHienTai, tinhTrangTruocRa, chuyenTrangThaiRa, ngayHetHan, ngayBatDau, thoiGianNghiDuKien, tinhVaoThoiGianDaoTao, tinhTrangTruocVao, chuyenTrangThaiVao, khoaDtMoi, lopMoi, ctdtMoi, lhdtMoi, nganhMoi, khoaMoi, maNganhCha, ngayKy, soQuyetDinhRaTruoc } = item ? item : { kieuQuyetDinh: '', maDangKy: null, emailDangKy: '', tenDangKy: '', hoDangKy: '', mssvDangKy: '', tenFormDangKy: '', staffSign: '', soQuyetDinh: '', tinhTrangCapNhat: '', model: null, dataCustom: null, tinhTrangHienTai: '', tinhTrangTruocRa: '', chuyenTrangThaiRa: '', ngayHetHan: '', ngayBatDau: '', thoiGianNghiDuKien: '', tinhVaoThoiGianDaoTao: '', tinhTrangTruocVao: '', chuyenTrangThaiVao: '', khoaDtMoi: '', khoaMoi: '', lopMoi: '', ctdtMoi: '', nganhMoi: '', bdtMoi: '', lhdtMoi: '', ngayKy: '' };
        model = model ? JSON.parse(model) : [];
        dataCustom = dataCustom ? JSON.parse(dataCustom) : {};
        this.setState({ isSubmit: false, chuyenTinhTrang: chuyenTrangThaiRa ? chuyenTrangThaiRa : chuyenTrangThaiVao, typeQuyetDinh: kieuQuyetDinh, maDangKy, item, student: emailDangKy, staffSign: nguoiKy, staffSignPosition: chucVuNguoiKy, customParam: model, khoaDtMoi, ctdtMoi, maNganhMoi: maNganhCha }, () => {
            model.forEach(item => this[item.ma].value(dataCustom[item.ma] ? dataCustom[item.ma] : ''));
            this.formType.value(maFormDangKy);
            if (this.state.typeQuyetDinh == quyetDinhRa) {
                this.chuyenTinhTrang.value(chuyenTrangThaiRa);
                this.tinhTrangTruocQuyetDinh.value(tinhTrangTruocRa);
                if (this.state.chuyenTinhTrang == tinhTrangNghiHocTamThoi) {
                    this.ngayHetHan.value(ngayHetHan);
                    this.ngayBatDau.value(ngayBatDau);
                    this.thoiGianNghiDuKien.value(thoiGianNghiDuKien);
                    this.tinhVaoThoiGianDaoTao.value(tinhVaoThoiGianDaoTao ? 1 : 0);
                }
            }
            else if (this.state.typeQuyetDinh == quyetDinhVao) {
                this.tinhTrangTruocQuyetDinh.value(tinhTrangTruocVao);
                this.chuyenTinhTrang.value(chuyenTrangThaiVao);
                this.khoaDtMoi.value(khoaDtMoi);
                this.bdtMoi.value('DH');
                this.lopMoi.value(lopMoi);
                this.chuyenNganhMoi.value(maNganhCha ? nganhMoi : '');
                this.nganhMoi.value(maNganhCha ? maNganhCha : nganhMoi);
                this.ctdtMoi.value(ctdtMoi);
                this.lhdtMoi.value(lhdtMoi);
                this.khoaMoi.value(khoaMoi);
                this.soQuyetDinhRaTruoc.value(soQuyetDinhRaTruoc);
            }
        });
        this.loaiQuyetDinh.value(kieuQuyetDinh);
        this.soQuyetDinh.value(soQuyetDinh);
        this.mssv.value(mssvDangKy);
        this.nguoiKy.value(nguoiKy);
        this.ngayKy.value(ngayKy);
        this.trangThaiHienTai.value(tinhTrangHienTai);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { typeQuyetDinh = '' } = this.state;
        const svManageQuyetDinh = {
            mssv: getValue(this.mssv),
            tinhTrangTruoc: this.state.chuyenSauHuy == true ? getValue(this.chuyenTinhTrangSauHuy) : null,
            isDeleted: 1,
            chuyenTinhTrangTruoc: typeQuyetDinh != quyetDinhKhac ? (this.chuyenTinhTrangTruoc.value() ? 1 : 0) : null,
            action: 'U',
            // dataTruocHuy: typeQuyetDinh == quyetDinhVao ? JSON.stringify(this.getDataTruocHuy()) : '',
            // dataSauHuy: typeQuyetDinh == quyetDinhVao ? JSON.stringify(this.getDataSauHuy()) : '',
            kieuQuyetDinh: this.state.typeQuyetDinh,
        };
        T.confirm('Xác nhận hủy quyết định',
            '<p>Bạn có chắc chắn muốn hủy quyết định này?</p><p style="color:red">Vui lòng kiểm tra thông tin</p></>'
            , isConfirm => isConfirm && this.props.huyQuyetDinh(this.state.maDangKy, svManageQuyetDinh, (data) => {
                this.setState({ isSubmit: true, maDangKy: null }, () => {
                    this.hide();
                    this.props.getPage();
                });
                data.maDangKy = data.id;
                data.maFormDangKy = data.formType;
                // this.props.download(e, data);
            }));
    }

    changeChuyenSauHuy = (value) => {
        this.setState({ chuyenSauHuy: value });
    }

    changeKhoaSauHuy = (value) => {
        this.setState({ khoaDtSauHuy: value.id }, () => {
            this.ctdtSauHuy.value(null);
        });
    }

    getDataTruocHuy = () => {
        let data = {};
        if (this.state.typeQuyetDinh == quyetDinhVao && this.state.chuyenSauHuy == true) {
            data.tinhTrangTruocHuy = getValue(this.trangThaiHienTai);
            data.nganhTruocHuy = getValue(this.nganhMoi);
            data.chuyenNganhTruocHuy = getValue(this.chuyenNganhMoi);
            data.khoaDtTruocHuy = getValue(this.khoaDtMoi);
            data.lopTruocHuy = getValue(this.lopMoi);
            data.ctdtTruocHuy = getValue(this.ctdtMoi);
            data.lhdtTruocHuy = getValue(this.lhdtMoi);
            data.bdtTruocHuy = getValue(this.bdtMoi);
            data.khoaTruocHuy = getValue(this.khoaMoi);
        }
        return data;
    }

    changeCtdtSauHuy = (value) => {
        this.nganhSauHuy.value(value.maNganh);
        this.chuyenNganhSauHuy.value(value.maChuyenNganh);
        this.nganhSauHuy.props.data.fetchOne(value.maNganh, res => {
            this.khoaSauHuy.value(res.khoa);
        });
        this.setState({ ctdtSauHuy: value.id, maNganhSauHuy: value.maNganh }, () => { this.lopSauHuy.value(null); });
    }

    changeLhdtSauHuy = (value) => {
        this.setState({ lhdtSauHuy: value.id }, () => {
            this.ctdtSauHuy.value(null);
        });
    }

    componentQuyetDinhRa = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        return (
            <>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-6' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                {this.state.chuyenTinhTrang == tinhTrangNghiHocTamThoi ? (
                    <>
                        <FormTextBox type='number' ref={e => this.thoiGianNghiDuKien = e} label='Thời gian nghỉ dự kiến (hoc kỳ)' className='col-md-6' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.ngayBatDau = e} label='Ngày bắt đầu nghỉ' className='col-md-4' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.ngayHetHan = e} label='Ngày hết hạn' className='col-md-4' readOnly={readOnly} />
                        <FormCheckbox className='col-md-4' ref={e => this.tinhVaoThoiGianDaoTao = e} label='Tính vào thời gian đào tạo' isSwitch={true} readOnly={readOnly}
                            onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                    </>
                ) : null}
            </>
        );
    }

    componentQuyetDinhVao = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        return (
            <>
                <FormTextBox ref={e => this.bdtMoi = e} label='Bậc đào tạo trước hủy' className='col-md-4' readOnly={true} />
                <FormTextBox ref={e => this.soQuyetDinhRaTruoc = e} label='Số quyết định ra trước' className='col-md-4' readOnly />
                <FormSelect ref={e => this.lhdtMoi = e} label='Hệ đào tạo trước hủy' className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly={true} />
                <FormTextBox type='text' ref={e => this.khoaDtMoi = e} label='Khóa đào tạo trước hủy' className='col-md-4' readOnly={readOnly} required onChange={e => { this.setState({ khoaDtMoi: e.target.value }, () => this.ctdtMoi.value(null)); }} />
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                <FormSelect ref={e => this.nganhMoi = e} label='Ngành trước hủy' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' readOnly={readOnly} onChange={this.changeNganhMoi} />
                <FormSelect ref={e => this.chuyenNganhMoi = e} label='Chuyên ngành trước hủy' data={SelectAdapter_DtChuyenNganhDaoTao(this.state.maNganhSauHuy)} className='col-md-4' readOnly={readOnly} />
                <FormSelect ref={e => this.ctdtMoi = e} label='Chương trình đào tạo trước hủy' data={SelectAdapter_KhungDaoTaoCtsv(this.state.khoaDtMoi)} onChange={this.changeCtdtMoi} className='col-md-4' readOnly={readOnly} required />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lopMoi = e} data={SelectAdapter_DtLopCtdt(this.state.ctdtMoi)} label='Lớp mới' className='col-md-4' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaMoi = e} label='Khoa trước hủy' className='col-md-4' data={SelectAdapter_DmDonViFaculty_V2} readOnly={readOnly} />
            </>
        );
    }

    render = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        const { typeQuyetDinh = '', chuyenSauHuy = false } = this.state;
        return this.renderModal({
            title: this.state.maDangKy && 'Hủy quyết định với thông tin',
            size: 'elarge',
            body: (
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.soQuyetDinh = e} label='Số quyết định' className='col-md-4' type='text' required readOnly={readOnly} onBlur={this.checkSoQuyetDinh} />
                        <FormSelect minimumResultsForSearch={-1} ref={e => this.loaiQuyetDinh = e} label='Loại quyết định' className='col-md-4' data={[{ id: 1, text: 'Quyết định ra' }, { id: 2, text: 'Quyết định vào' }, { id: 3, text: 'Quyết định khác' }]} onChange={value => this.changeFormType(value)} placeholder='Loại form' readOnly={readOnly} required />
                        <FormSelect minimumResultsForSearch={-1} ref={e => this.formType = e} label='Kiểu quyết định' className='col-md-4' data={this.state.typeQuyetDinh ? SelectAdapter_CtsvDmFormType(this.state.typeQuyetDinh) : []} onChange={this.changeKieuQuyetDinh} placeholder='Loại form' readOnly={readOnly} required />
                        {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                            if (item.type == '2') {
                                return (<FormSelect key={index} label={item.tenBien} ref={e => this[item.ma] = e} data={item.data.map(param => ({ id: param.text, text: param.text }))} className='form-group col-md-12' required readOnly={readOnly} />);
                            }
                            else {
                                return (<FormTextBox key={index} type='text' label={item.tenBien} ref={e => this[item.ma] = e} className='form-group col-md-12' required readOnly={readOnly} />);
                            }
                        }) : null}
                        <FormSelect ref={e => this.mssv = e} label='Sinh viên' className='col-md-4' data={SelectAdapter_FwStudentsManageForm} onChange={this.changeRegister} readOnly={readOnly} required={typeQuyetDinh == quyetDinhRa || typeQuyetDinh == quyetDinhVao} />
                        {(typeQuyetDinh == quyetDinhVao || typeQuyetDinh == quyetDinhRa) && <FormSelect ref={e => this.tinhTrangTruocQuyetDinh = e} label='Tình trạng trước quyết định' data={SelectAdapter_DmTinhTrangSinhVienV2} className='col-md-4' style={{ display: this.state.student ? '' : 'none' }} readOnly={true} />}
                        <FormSelect ref={e => this.trangThaiHienTai = e} label='Tình trạng hiện tại' data={SelectAdapter_DmTinhTrangSinhVienV2} className='col-md-4' style={{ display: this.state.student ? '' : 'none' }} readOnly={true} />
                    </div>
                    <div className='row'>
                        {typeQuyetDinh == quyetDinhRa && this.componentQuyetDinhRa()}
                        {typeQuyetDinh == quyetDinhVao && this.componentQuyetDinhVao()}
                        <FormSelect ref={e => this.nguoiKy = e} label='Chọn người ký' style={{ display: this.state.kyKhuyetDanh ? 'none' : '' }} className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={readOnly} />
                        {(typeQuyetDinh == quyetDinhVao || typeQuyetDinh == quyetDinhRa) &&
                            <FormCheckbox ref={e => this.chuyenTinhTrangTruoc = e} label='Chuyển về tình trạng trước sau khi hủy' className='col-md-12' onChange={value => this.changeChuyenSauHuy(value)} />
                        }
                        {chuyenSauHuy == true &&
                            <FormSelect ref={e => this.chuyenTinhTrangSauHuy = e} label='Cập nhật lại tình trạng cho sinh viên' className='col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} required />
                        }
                        {/* {(chuyenSauHuy == true && typeQuyetDinh == quyetDinhVao) && this.componentChuyenSauHuy()}
                        {(typeQuyetDinh == quyetDinhRa && chuyenSauHuy == true) && <FormSelect ref={e => this.chuyenTinhTrangSauHuyRa = e} label='Chuyển tình trạng sau hủy' className='col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} required />} */}

                    </div>
                </>),
            submitText: 'Hủy quyết định',
            isShowSubmit: true,
        }
        );
    }
}

export default HuyQuyetDinhModal;

