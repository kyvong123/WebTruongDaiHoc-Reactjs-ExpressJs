import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';
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
// const quyetDinhKhac = '3';

class QuyetDinhDetailModal extends AdminModal {
    state = { student: '', isSubmit: false, customParam: [], typeQuyetDinh: '', maKhoa: '', loaiHinhDt: '', heDaoTao: '', maNganhMoi: '', khoaDtMoi: '', ctdtMoi: '', kyKhuyetDanh: false, chuyenSauHuy: false }
    onShow = (item) => {
        let { kieuQuyetDinh, soQuyetDinh, maDangKy, mssvDangKy, maFormDangKy, nguoiKy, emailDangKy, chucVuNguoiKy, model, dataCustom, tinhTrangHienTai, tinhTrangTruocRa, chuyenTrangThaiRa, ngayHetHan, thoiGianNghiDuKien, tinhVaoThoiGianDaoTao, tinhTrangTruocVao, chuyenTrangThaiVao, khoaDtMoi, lopMoi, ctdtMoi, lhdtMoi, nganhMoi, khoaMoi, maNganhCha, ngayKy } = item ? item : { kieuQuyetDinh: '', maDangKy: null, emailDangKy: '', tenDangKy: '', hoDangKy: '', mssvDangKy: '', tenFormDangKy: '', staffSign: '', soQuyetDinh: '', tinhTrangCapNhat: '', model: null, dataCustom: null, tinhTrangHienTai: '', tinhTrangTruocRa: '', chuyenTrangThaiRa: '', ngayHetHan: '', thoiGianNghiDuKien: '', tinhVaoThoiGianDaoTao: '', tinhTrangTruocVao: '', chuyenTrangThaiVao: '', khoaDtMoi: '', khoaMoi: '', lopMoi: '', ctdtMoi: '', nganhMoi: '', bdtMoi: '', lhdtMoi: '', ngayKy: '' };
        model = model ? JSON.parse(model) : [];
        dataCustom = dataCustom ? JSON.parse(dataCustom) : {};
        this.setState({ isSubmit: false, typeQuyetDinh: kieuQuyetDinh, maDangKy, item, student: emailDangKy, staffSign: nguoiKy, staffSignPosition: chucVuNguoiKy, customParam: model, khoaDtMoi, ctdtMoi, maNganhMoi: maNganhCha }, () => {
            model.forEach(item => this[item.ma].value(dataCustom[item.ma] ? dataCustom[item.ma] : ''));
            this.formType.value(maFormDangKy);
            if (this.state.typeQuyetDinh == quyetDinhRa) {
                this.chuyenTinhTrang.value(chuyenTrangThaiRa);
                this.tinhTrangTruocQuyetDinh.value(tinhTrangTruocRa);
                this.ngayHetHan.value(ngayHetHan);
                this.thoiGianNghiDuKien.value(thoiGianNghiDuKien);
                this.tinhVaoThoiGianDaoTao.value(tinhVaoThoiGianDaoTao ? 1 : 0);
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
            }
        });
        this.loaiQuyetDinh.value(kieuQuyetDinh);
        this.soQuyetDinh.value(soQuyetDinh);
        this.mssv.value(mssvDangKy);
        this.nguoiKy.value(nguoiKy);
        this.ngayKy.value(ngayKy);
        this.trangThaiHienTai.value(tinhTrangHienTai);
    };


    componentQuyetDinhRa = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        return (
            <>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-6' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                <FormTextBox type='number' ref={e => this.thoiGianNghiDuKien = e} label='Thời gian nghỉ dự kiến (hoc kỳ)' className='col-md-6' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayHetHan = e} label='Ngày hết hạn' className='col-md-6' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.tinhVaoThoiGianDaoTao = e} label='Tính vào thời gian đào tạo' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </>
        );
    }

    componentQuyetDinhVao = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        return (
            <>
                <FormTextBox ref={e => this.bdtMoi = e} label='Bậc đào tạo mới' className='col-md-4' readOnly={true} />
                <FormSelect ref={e => this.lhdtMoi = e} label='Hệ đào tạo mới' className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly={true} />
                <FormTextBox type='text' ref={e => this.khoaDtMoi = e} label='Khóa đào tạo mới' className='col-md-4' readOnly={readOnly} required onChange={ e => { this.setState({ khoaDtMoi: e.target.value }, () => this.ctdtMoi.value(null)); }}/>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                <FormSelect ref={e => this.ctdtMoi = e} label='Chương trình đào tạo mới' data={SelectAdapter_KhungDaoTaoCtsv(this.state.khoaDtMoi)} onChange={this.changeCtdtMoi} className='col-md-4' readOnly={readOnly} required/>
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lopMoi = e} data={SelectAdapter_DtLopCtdt(this.state.ctdtMoi)} label='Lớp mới' className='col-md-4' readOnly={readOnly} required />                
                <FormSelect ref={e => this.khoaMoi = e} label='Khoa mới' className='col-md-4' data={SelectAdapter_DmDonViFaculty_V2} readOnly={readOnly} />
                <FormSelect ref={e => this.nganhMoi = e} label='Ngành mới' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' readOnly={readOnly} onChange={this.changeNganhMoi}/>
                <FormSelect ref={e => this.chuyenNganhMoi = e} label='Chuyên ngành mới' data={SelectAdapter_DtChuyenNganhDaoTao(this.state.maNganhSauHuy)} className='col-md-4' readOnly={readOnly} />
            </>
        );
    }

    render = () => {
        const readOnly = this.state.maDangKy ? true : this.props.readOnly;
        const { typeQuyetDinh = '' } = this.state;
        return this.renderModal({
            title: this.state.maDangKy && 'Chi tiết thông tin quyết định',
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
                        <FormSelect ref={e => this.nguoiKy = e} label='Chọn người ký' style={{ display : this.state.kyKhuyetDanh ? 'none' : ''}} className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={readOnly} />
                    </div>
                </>),
            submitText: 'Hủy quyết định',
            isShowSubmit: true,
        }
        );
    }
}

export default QuyetDinhDetailModal;

