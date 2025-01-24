import React from 'react';
import { FormDatePicker, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import { ComponentDiaChi, getValueDiaChi } from 'modules/mdTccb/tccbHopDong/component/componentDiaChi';
import { SelectAdapter_CtsvDmTinhThanhPho } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxTinhThanhPho';
const { SelectAdapter_GioiTinh, SelectAdapter_DanToc, SelectAdapter_TonGiao, SelectAdapter_TrinhDoPhoThong, SelectAdapter_HocVi, SelectAdapter_DanhHieu, SelectAdapter_HocHam, SelectAdapter_ChucVu, SelectAdapter_ChucVuDang, SelectAdapter_BacLuong, SelectAdapter_NgachLuong } = require('../dataSelect')();

export default class ComponentHocVan extends React.Component {
    fillData = (data) => {
        data = data || {};
        this.ho.value(data.ho || '');
        this.ten.value(data.ten || '');
        this.mscb.value(data.mscb || '');
        this.gioiTinh.value(data.gioiTinh || '');
        this.danToc.value(data.danToc || '');
        this.tonGiao.value(data.tonGiao || '');
        this.ngaySinh.value(data.ngaySinh || '');
        this.noiSinh.value(data.noiSinh || '');
        this.nguyenQuan.value(...(Object.values(data.nguyenQuan || {}) || {}));
        this.hienTai.value(...(Object.values(data.hienTai || {}) || {}));
        this.cccd.value(data.cccd || '');
        this.cccdNgayCap.value(data.cccdNgayCap || '');
        this.email.value(data.email || '');
        this.sdt.value(data.sdt || '');
        this.ngayBatDauCongTac.value(data.ngayBatDauCongTac || '');
        this.ngayVaoDang.value(data.ngayVaoDang || '');
        this.ngayVaoDangCt.value(data.ngayVaoDangCt || '');
        this.trinhDoPhoThong.value(data.trinhDoPhoThong || '');
        this.hocVi.value(data.hocVi || '');
        this.hocHam.value(data.hocHam || '');
        this.danhHieuNhaNuoc.value(data.danhHieuNhaNuoc || '');
        this.chucVu.value(data.chucVu || '');
        this.ngayBoNhiem.value(data.ngayBoNhiem || '');
        this.congViecChinh.value(data.congViecChinh || '');
        this.chucVuDang.value(data.chucVuDang || '');
        this.ngach.value(data.ngach || '');
        this.bacLuong.value(data.bacLuong || '');
        this.heSoLuong.value(data.heSoLuong || '');
        this.phanTramHuong.value(data.phanTramHuong || '');
        this.ngayHuong.value(data.ngayHuong || '');
        this.phuCapTnvk.value(data.phuCapTnvk || '');
        this.ngayHuongTnvk.value(data.ngayHuongTnvk || '');
    }

    getValue = () => {
        try {
            const data = {
                ho: getValue(this.ho) || '',
                ten: getValue(this.ten) || '',
                mscb: getValue(this.mscb) || '',
                gioiTinh: getValue(this.gioiTinh) || '',
                danToc: getValue(this.danToc) || '',
                tonGiao: getValue(this.tonGiao) || '',
                ngaySinh: T.dateToNumber(getValue(this.ngaySinh)) || '',
                noiSinh: getValue(this.noiSinh) || '',
                nguyenQuan: getValueDiaChi(this.nguyenQuan) || '',
                hienTai: getValueDiaChi(this.hienTai) || '',
                cccd: getValue(this.cccd) || '',
                cccdNgayCap: T.dateToNumber(getValue(this.cccdNgayCap)) || '',
                email: getValue(this.email) || '',
                sdt: getValue(this.sdt) || '',
                ngayBatDauCongTac: T.dateToNumber(getValue(this.ngayBatDauCongTac)) || '',
                ngayVaoDang: T.dateToNumber(getValue(this.ngayVaoDang)) || '',
                ngayVaoDangCt: T.dateToNumber(getValue(this.ngayVaoDangCt)) || '',
                trinhDoPhoThong: getValue(this.trinhDoPhoThong) || '',
                hocVi: getValue(this.hocVi) || '',
                hocHam: getValue(this.hocHam) || '',
                danhHieuNhaNuoc: getValue(this.danhHieuNhaNuoc) || '',
                chucVu: getValue(this.chucVu) || '',
                ngayBoNhiem: T.dateToNumber(getValue(this.ngayBoNhiem)) || '',
                congViecChinh: getValue(this.congViecChinh) || '',
                chucVuDang: getValue(this.chucVuDang) || '',
                ngach: getValue(this.ngach) || '',
                bacLuong: getValue(this.bacLuong) || '',
                heSoLuong: getValue(this.heSoLuong) || '',
                phanTramHuong: getValue(this.phanTramHuong) || '',
                ngayHuong: T.dateToNumber(getValue(this.ngayHuong)) || '',
                phuCapTnvk: getValue(this.phuCapTnvk) || '',
                ngayHuongTnvk: T.dateToNumber(getValue(this.ngayHuongTnvk)) || '',
            };
            return data;
        }
        catch (input) {
            console.error(input);
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
            throw input;
        }
    }

    render() {
        return <>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN CÁ NHÂN'}</h4>
                    <FormTextBox ref={e => this.ho = e} className='col-md-5' label='Họ và tên đệm' required />
                    <FormTextBox ref={e => this.ten = e} className='col-md-3' label='Tên' required />
                    <FormTextBox ref={e => this.mscb = e} className='col-md-4' label='Mã cán bộ' required />
                    <FormSelect ref={e => this.gioiTinh = e} className='col-md-4' label='Giới tính' data={SelectAdapter_GioiTinh} required />
                    <FormSelect ref={e => this.danToc = e} className='col-md-4' label='Dân tộc' data={SelectAdapter_DanToc} required />
                    <FormSelect ref={e => this.tonGiao = e} className='col-md-4' label='Tôn giáo' data={SelectAdapter_TonGiao} required />
                    <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-md-4' label='Ngày sinh' required />
                    <FormSelect ref={e => this.noiSinh = e} className='col-md-8' label='Nơi sinh' data={SelectAdapter_CtsvDmTinhThanhPho} required />
                    <ComponentDiaChi ref={e => this.nguyenQuan = e} className='col-md-12' label='Nguyên quán' required />
                    <ComponentDiaChi ref={e => this.hienTai = e} soNha className='col-md-12' label='Nơi ở hiện tại' required />
                    <FormTextBox ref={e => this.cccd = e} label='CCCD' className='col-md-6' required />
                    <FormDatePicker ref={e => this.cccdNgayCap = e} type='date-mask' className='col-md-6' label='Ngày cấp CCCD' required />
                    <FormTextBox ref={e => this.email = e} label='Email trường' className='col-lg-8' required />
                    <FormTextBox type='phone' ref={e => this.sdt = e} label='SĐT liên hệ' className='col-lg-4' required />
                    <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN CÔNG TÁC'}</h4>
                    <FormDatePicker ref={e => this.ngayBatDauCongTac = e} type='date-mask' className='col-md-12' label='Ngày bắt đầu công tác' required />
                    <FormDatePicker ref={e => this.ngayVaoDang = e} type='date-mask' className='col-md-6' label='Ngày kết nạp Đảng' />
                    <FormDatePicker ref={e => this.ngayVaoDangCt = e} type='date-mask' className='col-md-6' label='Ngày vào Đảng chính thức' />
                    <FormSelect ref={e => this.trinhDoPhoThong = e} className='col-md-4' label='Trình độ phổ thông' data={SelectAdapter_TrinhDoPhoThong} required />
                    <FormSelect ref={e => this.hocVi = e} className='col-md-4' label='Trình độ chuyên môn cao nhất' data={SelectAdapter_HocVi} required />
                    <FormSelect ref={e => this.hocHam = e} className='col-md-4' label='Học hàm' data={SelectAdapter_HocHam} />
                    <FormSelect ref={e => this.danhHieuNhaNuoc = e} className='col-md-12' label='Danh hiệu nhà nước phong tặng' data={SelectAdapter_DanhHieu} />
                    <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN CHỨC VỤ - VIỆC LÀM'}</h4>
                    <FormSelect ref={e => this.chucVu = e} className='col-md-6' label='Chức vụ hiện tại' data={SelectAdapter_ChucVu} />
                    <FormDatePicker ref={e => this.ngayBoNhiem = e} type='date-mask' className='col-md-6' label='Ngày bổ nhiệm' />
                    <FormTextBox ref={e => this.congViecChinh = e} className='col-md-12' label='Công việc chính được giao' />
                    <FormSelect ref={e => this.chucVuDang = e} className='col-md-12' label='Chức vụ trong Đảng' data={SelectAdapter_ChucVuDang} />
                    <FormSelect ref={e => this.ngach = e} className='col-md-4' label='Ngạch/CDNN' data={SelectAdapter_NgachLuong} />
                    <FormSelect ref={e => this.bacLuong = e} className='col-md-4' label='Bậc lương' data={SelectAdapter_BacLuong} />
                    <FormTextBox type='number' decimalScale='2' step ref={e => this.heSoLuong = e} className='col-md-4' label='Hệ số lương' />
                    <FormTextBox type='number' ref={e => this.phanTramHuong = e} className='col-md-6' label='Phần trăm hưởng (%)' suffix='%' />
                    <FormDatePicker ref={e => this.ngayHuong = e} type='date-mask' className='col-md-6' label='Ngày hưởng' />
                    <FormTextBox type='number' ref={e => this.phuCapTnvk = e} className='col-md-6' label='Phụ cấp thâm niên vượt khung (%)' suffix='%' />
                    <FormDatePicker ref={e => this.ngayHuongTnvk = e} type='date-mask' className='col-md-6' label='Ngày hưởng PCTNVK' />
                </div>
            </div>
        </>;
    }
}