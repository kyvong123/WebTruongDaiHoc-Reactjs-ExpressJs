import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormSelect, FormImageBox, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { getSinhVienInfo } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmDaiHoc } from 'modules/mdCongTacSinhVien/dmDaiHoc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmCaoDang } from 'modules/mdCongTacSinhVien/dmCaoDangHocVien/redux';
import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmSvDoiTuongTs } from 'modules/mdDanhMuc/dmSvDoiTuongTs/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DmPhuongThucTuyenSinh } from 'modules/mdDanhMuc/dmPhuongThucTuyenSinh/redux';
export class StudentInfoSection extends AdminPage {
    state = {
        item: null, lastModified: null, image: '', noiTru: false,
        daTotNghiepDh: false, daTotNghiepCd: false, daTotNghiepTc: false, daTotNghiepPt: false, loaiHinhDaoTao: '', truongDhKhac: false, truongCdKhac: false,
        noiSinhQuocGia: null
    };
    totNghiep = { 'ĐH': {}, 'CĐ': {}, 'TC': {}, 'PT': {}, };
    daTotNghiep = {}

    setValue = (mssv) => {
        this.props.getSinhVienInfo(mssv, (data) => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
            } else {
                let { canEdit, sectionEdit, namTuyenSinh, chuaDongHocPhi } = data.item;
                let isTanSinhVien = namTuyenSinh == new Date().getFullYear();
                this.setState({
                    noiSinhQuocGia: data.item.noiSinhQuocGia ? data.item.noiSinhQuocGia : 'VN', isTanSinhVien, chuaDongHocPhi, ngayNhapHoc: data.item.ngayNhapHoc, canEdit, ctdtSinhVien: data.maCtdt, nganhSinhVien: data.maNganh, noiTru: data.item.maNoiTru ? 1 : 0,
                    daTotNghiepDh: (data.item.dataTotNghiep['ĐH'] != undefined), daTotNghiepCd: data.item.dataTotNghiep['CĐ'] != undefined, daTotNghiepTc: data.item.dataTotNghiep['TC'] != undefined, daTotNghiepPt: data.item.dataTotNghiep['PT'] != undefined,
                    loaiHinhDaoTao: data.item.loaiHinhDaoTao,
                    truongDhKhac: (data.item.dataTotNghiep['ĐH'] != undefined && data.item.dataTotNghiep['ĐH'][0].truongKhac != null),
                    truongCdKhac: (data.item.dataTotNghiep['CĐ'] != undefined && data.item.dataTotNghiep['CĐ'][0].truongKhac != null),
                    sectionEdit
                });
                this.setVal(data.item);
            }
        });
    }

    setVal = (data = {}) => {
        this.anhThe.setData('CardImage', `/api/sv/image-card?t=${new Date().getTime()}`);
        this.mssv.value(data.mssv ? data.mssv : '');
        this.heDaoTao.value(data.loaiHinhDaoTao ? data.loaiHinhDaoTao : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.cmnd.value(data.cmnd || '');
        this.cmndNgayCap.value(data.cmndNgayCap);
        this.cmndNoiCap.value(data.cmndNoiCap || '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.state.noiSinhQuocGia == 'VN' && this.noiSinhMaTinh.value(data.noiSinhMaTinh);
        this.noiSinhQuocGia.value(data.noiSinhQuocGia || 'VN');
        this.doiTuongTuyenSinh.value(data.doiTuongTuyenSinh);
        this.khuVucTuyenSinh.value(data.khuVucTuyenSinh);
        this.phuongThucTuyenSinh.value(data.phuongThucTuyenSinh);
        this.diemThi.value(data.diemThi ? Number(data.diemThi).toFixed(2) : '');
        this.doiTuongChinhSach.value(data.doiTuongChinhSach || '');
        this.maNganh.value(data.maNganh ? data.maNganh : '');
        this.maChuyenNganh.value(data.maChuyenNganh ? data.maChuyenNganh : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        this.thuongTruCha.value(data.thuongTruMaTinhCha, data.thuongTruMaHuyenCha, data.thuongTruMaXaCha, data.thuongTruSoNhaCha);
        this.thuongTruMe.value(data.thuongTruMaTinhMe, data.thuongTruMaHuyenMe, data.thuongTruMaXaMe, data.thuongTruSoNhaMe);

        this.tenCha.value(data.tenCha ? data.tenCha : '');
        this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : '');
        this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : '');
        this.tenMe.value(data.tenMe ? data.tenMe : '');
        this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : '');
        this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : '');
        this.thuongTruNguoiLienLac.value(data.lienLacMaTinh || '', data.lienLacMaHuyen || '', data.lienLacMaXa || '', data.lienLacSoNha || '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
        // this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');
        this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
        this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
        this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        this.lopSinhVien.value(data.lop ? data.lop : '');
        data.ngayVaoDang && this.setState({ isDangVien: true }, () => {
            this.isDangVien.value();
            this.ngayVaoDang.value(data.ngayVaoDang);
        });
        data.ngayVaoDoan && this.setState({ isDoanVien: true }, () => {
            this.isDoanVien.value();
            this.ngayVaoDoan.value(data.ngayVaoDoan);
        });
        this.noiTru.value(this.state.noiTru);
        if (this.state.noiTru) {
            // địa chỉ nội trú
            this.ktxTen.value(data.ktxTen || '');
            this.ktxToaNha.value(data.ktxToaNha || '');
            this.ktxSoPhong.value(data.ktxSoPhong || '');
        } else {
            // địa chỉ tạm trú
            this.tamTru.value(data.tamTruMaTinh || '', data.tamTruMaHuyen || '', data.tamTruMaXa || '', data.tamTruSoNha || '');
        }
        // thong tin ngan hang
        this.soTkNh.value(data.soTkNh || '');
        this.chiNhanhNh.value(data.chiNhanhNh || '');
        this.tenNh.value(data.tenNganHang || '');
        // thong tin tot nghiep
        if (data.dataTotNghiep) {
            Object.keys(data.dataTotNghiep).forEach(trinhDo => {
                this.daTotNghiep[trinhDo]?.value(1);
                Object.keys(this.totNghiep[trinhDo]).forEach(key => {
                    this.totNghiep[trinhDo][key].value(data.dataTotNghiep[trinhDo][0][key] || '');
                });
                if (data.dataTotNghiep[trinhDo][0]['truongKhac']) {
                    this.totNghiep[trinhDo]['truongKhacCheck']?.value(1);
                    this.totNghiep[trinhDo]['truongKhac']?.value(data.dataTotNghiep[trinhDo][0]['truongKhac']);
                }
            });
        }
    };

    componentNoiTruTamTru = () => {
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || (sectionEdit && (sectionEdit.includes('noiTruTamTru') || sectionEdit.includes('all'))));
        return (<div className='col-md-12'>
            <div className='row'>
                <h6 className='col-md-12'>Thông tin tạm trú và nội trú</h6>
                <FormCheckbox className='col-md-12' ref={e => this.noiTru = e} label='Ở ký túc xá' readOnly={readOnly} />
                <div className='row col-md-12' style={{ display: this.state.noiTru ? '' : 'none' }}>
                    <FormSelect ref={e => this.ktxTen = e} className='col-md-8' label="Ký túc xá" minimumResultsForSearch='-1' data={['Ký túc xá khu A', 'Ký túc xá khu B']} readOnly={readOnly} />
                    <FormTextBox ref={e => this.ktxToaNha = e} className='col-md-4' label="Tòa nhà" onKeyDown={e => e.code === 'Enter' && this.ktxPhong.focus()} readOnly={readOnly} />
                    <FormTextBox ref={e => this.ktxSoPhong = e} className='col-md-4' label="Số phòng" readOnly={readOnly} />
                </div>
                <ComponentDiaDiem ref={e => this.tamTru = e} className='col-md-12' label={<span>Địa chỉ tạm trú {!readOnly && <a href='#' onClick={(e) => this.copyAddressTo(e, this.tamTru)}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} requiredSoNhaDuong={true} style={{ display: this.state.noiTru ? 'none' : '' }} readOnly={readOnly} />
            </div>
        </div>);
    }

    componentThongTinLienLac = () => {
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || (sectionEdit && (sectionEdit.includes('lienLac') || sectionEdit.includes('all'))));
        return (<div className='col-md-12'>
            <div className='row'>
                <h6 className='col-md-12'>Thông tin liên lạc</h6>
                <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='form-group col-md-6' required readOnly={readOnly} />
                <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' required readOnly={readOnly} />
                <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại người liên lạc' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                <ComponentDiaDiem ref={e => this.thuongTruNguoiLienLac = e} label='Địa chỉ liên lạc' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
            </div>
        </div>);
    }

    componentThongTinNganHang = () => {
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || (sectionEdit && (sectionEdit.includes('nganHang') || sectionEdit.includes('all'))));
        return (<div className='col-md-12'>
            <div className='row'>
                <h6 className='col-md-12'>Thông tin ngân hàng</h6>
                <FormTextBox ref={e => this.soTkNh = e} label='Số tài khoản ngân hàng' className='form-group col-md-6' required readOnly={readOnly} />
                <FormTextBox ref={e => this.tenNh = e} label='Tên ngân hàng' className='form-group col-md-6' required readOnly={readOnly} />
                <FormTextBox ref={e => this.chiNhanhNh = e} label='Chi nhánh ngân hàng' className='form-group col-md-6' required readOnly={readOnly} />
            </div>
        </div>);
    }

    componentThongTinKhac = () => {
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || (sectionEdit && (sectionEdit.includes('thongTinKhac') || sectionEdit.includes('all'))));
        return (<div className='col-md-12'>
            <div className='row'>
                <h6 className='col-md-12'>Thông tin khác</h6>
                <FormTextBox ref={e => this.cmnd = e} label='CCCD/Mã định danh' className='col-md-4' required readOnly={readOnly} />
                <FormDatePicker type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp' className='col-md-4' required readOnly={readOnly} />
                <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' required readOnly={readOnly} />
                <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-4' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-4' data={SelectAdapter_DmDanTocV2} required readOnly={readOnly} />
                <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-4' data={SelectAdapter_DmTonGiaoV2} required readOnly={readOnly} />
                <FormTextBox ref={e => this.doiTuongChinhSach = e} label='Đối tượng chính sách' placeholder='Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không' className='col-md-12' readOnly={readOnly} required />
                <FormCheckbox label='Đảng viên' className={this.state.isDangVien ? 'col-md-3' : 'col-md-12'} ref={e => this.isDangVien = e} readOnly={readOnly} />
                <FormDatePicker label='Ngày vào đảng' className='col-md-9' style={{ display: this.state.isDangVien ? 'block' : 'none' }} required={this.state.isDangVien} type='date-mask' ref={e => this.ngayVaoDang = e} readOnly={readOnly} />
                <FormCheckbox label='Đoàn viên' className={this.state.isDoanVien ? 'col-md-3' : 'col-md-12'} ref={e => this.isDoanVien = e} readOnly={readOnly} />
                <FormDatePicker label='Ngày vào đoàn' type='date-mask' className='col-md-9' style={{ display: this.state.isDoanVien ? 'block' : 'none' }} required={this.state.isDoanVien} ref={e => this.ngayVaoDoan = e} readOnly={readOnly} />
                <FormSelect ref={e => this.doiTuongTuyenSinh = e} label='Đối tượng tuyển sinh' className='col-md-6' data={SelectAdapter_DmSvDoiTuongTs} required readOnly />
                <FormSelect ref={e => this.khuVucTuyenSinh = e} label='Khu vực tuyển sinh' className='col-md-6' data={['KV1', 'KV2', 'KV2-NT', 'KV3']} readOnly required />
                <FormSelect ref={e => this.phuongThucTuyenSinh = e} label='Phương thức tuyển sinh' className='col-md-6' data={SelectAdapter_DmPhuongThucTuyenSinh} readOnly required />
                <FormTextBox ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-6' readOnly />
                {!['CQ', 'CLC'].includes(this.state.loaiHinhDaoTao) && <>
                    <FormCheckbox ref={e => this.daTotNghiep['ĐH'] = e} className='col-md-12' label='Đã tốt nghiệp Đại học' />
                    {this.state.daTotNghiepDh && <>
                        <FormTextBox ref={e => this.totNghiep['ĐH'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' />
                        {this.state.truongDhKhac ? (
                            <FormTextBox ref={e => this.totNghiep['ĐH'].truongKhac = e} className='col-md-4' label='Trường đại học khác' />
                        ) : (
                            <FormSelect ref={e => this.totNghiep['ĐH'].truong = e} className='col-md-4' label='Trường Đại học' data={SelectAdapter_DmDaiHoc} />
                        )}
                        <FormCheckbox ref={e => this.totNghiep['ĐH'].truongKhacCheck = e} className='col-md-4' label='Trường đại học khác' />
                        <FormTextBox ref={e => this.totNghiep['ĐH'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' />
                        <FormTextBox ref={e => this.totNghiep['ĐH'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox ref={e => this.totNghiep['ĐH'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </>}
                    <FormCheckbox ref={e => this.daTotNghiep['CĐ'] = e} className='col-md-12' label='Đã tốt nghiệp Cao đẳng - Học viện' />
                    {this.state.daTotNghiepCd && <>
                        <FormTextBox ref={e => this.totNghiep['CĐ'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' />
                        {this.state.truongCdKhac ? (
                            <FormTextBox ref={e => this.totNghiep['CĐ'].truongKhac = e} className='col-md-4' label='Trường Cao đẳng/Học viện khác' />
                        ) : (
                            <FormSelect ref={e => this.totNghiep['CĐ'].truong = e} className='col-md-4' label='Trường Cao đẳng/Học viện' data={SelectAdapter_DmCaoDang} />
                        )}
                        <FormCheckbox ref={e => this.totNghiep['CĐ'].truongKhacCheck = e} className='col-md-4' label='Trường Cao đẳng/Học viện khác' />
                        <FormTextBox ref={e => this.totNghiep['CĐ'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' />
                        <FormTextBox ref={e => this.totNghiep['CĐ'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox ref={e => this.totNghiep['CĐ'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </>}
                    <FormCheckbox ref={e => this.daTotNghiep['TC'] = e} className='col-md-12' label='Đã tốt nghiệp Trung cấp' />
                    {this.state.daTotNghiepTc && <>
                        <FormTextBox ref={e => this.totNghiep['TC'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' />
                        <FormTextBox ref={e => this.totNghiep['TC'].truong = e} className='col-md-4' label='Trường Trung cấp tốt nghiệp' />
                        <FormSelect ref={e => this.totNghiep['TC'].tinh = e} className='col-md-4' label='Tỉnh trường' data={ajaxSelectTinhThanhPho} />
                        <FormTextBox ref={e => this.totNghiep['TC'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' />
                        <FormTextBox ref={e => this.totNghiep['TC'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox ref={e => this.totNghiep['TC'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </>}
                    <FormCheckbox ref={e => this.daTotNghiep['PT'] = e} className='col-md-12' label='Đã tốt nghiệp THPT/GDTX' />
                    {this.state.daTotNghiepPt && <>
                        <FormTextBox ref={e => this.totNghiep['PT'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' />
                        <FormTextBox ref={e => this.totNghiep['PT'].truong = e} className='col-md-4' label='Trường THPT/GDTX tốt nghiệp' />
                        <FormSelect ref={e => this.totNghiep['PT'].tinh = e} className='col-md-4' label='Tỉnh trường' data={ajaxSelectTinhThanhPho} />
                    </>}</>}
                <FormTextBox ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-6' readOnly={readOnly} />
                <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại cha' className='form-group col-md-6' type='phone' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngaySinhCha = e} label='Ngày sinh cha' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp cha' className='form-group col-md-6' readOnly={readOnly} />
                <ComponentDiaDiem ref={e => this.thuongTruCha = e} label={<span>Địa chỉ thường trú của cha {!readOnly && <a href='#' onClick={this.copyAddressCha}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                <FormTextBox ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-6' readOnly={readOnly} />
                <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại mẹ' className='form-group col-md-6' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngaySinhMe = e} label='Ngày sinh mẹ' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề nghiệp mẹ' className='form-group col-md-6' readOnly={readOnly} />
                <ComponentDiaDiem ref={e => this.thuongTruMe = e} label={<span>Địa chỉ thường trú của mẹ {!readOnly && <a href='#' onClick={this.copyAddressMe}>(Giống địa chỉ thường trú của <b>cha</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
            </div>
        </div>);
    }

    render() {
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || (sectionEdit && sectionEdit.includes('all')));
        return (
            <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <div className='row'>
                                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-3' readOnly required />
                                    <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly required />
                                    <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly required />
                                    <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-3' required readOnly />
                                    <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' className='form-group col-md-3' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly required />
                                    <FormSelect ref={e => this.maNganh = e} label='Ngành' className='form-group col-md-3' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly required />
                                    <FormSelect ref={e => this.maChuyenNganh = e} label='Chuyên ngành' className='form-group col-md-3' data={SelectAdapter_DtChuyenNganhDaoTao(this.state.nganhSinhVien)} readOnly required />
                                    <FormSelect ref={e => this.lopSinhVien = e} label='Lớp' className='form-group col-md-3' data={SelectAdapter_DtLopCtdt(this.state.ctdtSinhVien)} readOnly required />
                                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-3' data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} required />
                                    <FormSelect className='col-md-3' ref={e => this.noiSinhQuocGia = e} data={SelectAdapter_DmQuocGia} readOnly={readOnly} label='Nơi sinh quốc gia' required />
                                    {this.state.noiSinhQuocGia == 'VN' && <FormSelect className='col-md-6' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} readOnly={readOnly} label='Nơi sinh' required />}
                                </div>
                            </div>
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            {this.componentNoiTruTamTru()}
                            {this.componentThongTinLienLac()}
                            {this.componentThongTinNganHang()}
                            {this.componentThongTinKhac()}
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h4 className='tile-title'>Ảnh thẻ sinh viên</h4>
                    <div className='tile-body'>
                        <div className='d-flex justify-content-evently align-items-center' style={{ gap: 10 }}>
                            <FormImageBox ref={e => this.anhThe = e} uploadType='CardImage' readOnly={readOnly} boxUploadStye={{ width: '150px' }} height='200px' />
                            <ul style={{}}>
                                <li>Vui lòng tải lên ảnh <b className='text-danger'>đúng kích thước (3 x 4cm)</b>.</li>
                                <li>Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại <a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>đây</a></li>
                                <li>Ảnh phải có nền 1 màu (trắng hoặc xanh), chi tiết rõ nét, nghiêm túc.</li>
                                <li>Đây là ảnh phục vụ cho công tác in thẻ sinh viên, đề nghị sinh viên chịu trách nhiệm với ảnh thẻ mình đã tải lên.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSinhVienInfo };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(StudentInfoSection);
