import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, FormTextBox, getValue, } from 'view/component/AdminPage';
import { SelectAdapter_DtLopCtdt } from '../ctsvDtLop/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { ComponentDiaDiem } from '../ctsvDmDiaDiem/componentDiaDiem';
import { SelectAdapter_DtNganhDaoTao } from '../ctsvDtNganhDaoTao/redux';
import { SelectAdapter_KhungDaoTaoCtsvFilter } from '../ctsvDtChuongTrinhDaoTao/redux';

export default class AddStudentModal extends AdminModal {
    state = {
        namTuyenSinh: new Date().getFullYear(), loaiHinhDaoTao: '', maNganh: '', maCtdt: '', noiSinhQuocGia: 'VN'
    }
    onSubmit = () => {
        const {
            maTinhThanhPho: thuongTruMaTinh,
            maQuanHuyen: thuongTruMaHuyen,
            maPhuongXa: thuongTruMaXa,
            soNhaDuong: thuongTruSoNha,
        } = this.thuongTru?.value() || {};
        const data = {
            ho: getValue(this.ho).toUpperCase(),
            ten: getValue(this.ten).toUpperCase(),
            emailTruong: getValue(this.emailTruong),
            mssv: getValue(this.mssv),
            gioiTinh: getValue(this.gioiTinh),
            ngaySinh: getValue(this.ngaySinh).getTime(),
            noiSinhMaTinh: getValue(this.noiSinhMaTinh),
            ngayNhapHoc: getValue(this.ngayNhapHoc).getTime(),
            thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha,
            maNganh: getValue(this.maNganh),
            namTuyenSinh: getValue(this.namTuyenSinh),
            khoaSinhVien: getValue(this.namTuyenSinh),
            loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
            maCtdt: getValue(this.maCtdt),
            lop: getValue(this.lop),
            tinhTrang: getValue(this.tinhTrang)
        };
        T.confirm('Xác nhận thêm sinh viên?', '', isConfirm => (isConfirm && this.props.create(data, () => this.hide())));
    }
    setDefaultEmail = (e) => {
        e.preventDefault();
        const mssv = e.target.value;
        this.emailTruong.value(mssv.toLowerCase() + (mssv ? '@hcmussh.edu.vn' : ''));
    }


    render = () => {
        return this.renderModal({
            title: 'Thêm sinh viên',
            size: 'elarge',
            body: <>
                <h5>Thông tin cơ bản</h5>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.ho = e} label='Họ và tên lót' required />
                    <FormTextBox className='col-md-4' ref={e => this.ten = e} label='Tên' required />
                    <FormTextBox className='col-md-4' ref={e => this.mssv = e} label='Mã số sinh viên' onChange={this.setDefaultEmail} required />
                    <FormSelect className='col-md-4' ref={e => this.gioiTinh = e} data={SelectAdapter_DmGioiTinhV2} label='Giới tính' required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngaySinh = e} type='date-mask' label='Ngày sinh' required />
                    <FormTextBox className='col-md-4' ref={e => this.emailTruong = e} label='Email trường' readOnly required />
                    <FormSelect className='col-md-4' ref={e => this.noiSinhQuocGia = e} data={SelectAdapter_DmQuocGia} label='Nơi sinh Quốc gia'
                        onChange={e => this.setState({ noiSinhQuocGia: e.id }, () => this.noiSinhMaTinh.value(null))}
                        value={'VN'} />
                    <FormSelect className='col-md-4' ref={e => this.noiSinhMaTinh = e} label='Nơi sinh tỉnh thành'
                        data={ajaxSelectTinhThanhPho}
                        disabled={this.state.noiSinhQuocGia != 'VN'} />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayNhapHoc = e} type='date-mask' label='Ngày nhập học' value={Date.now()} required />
                    <ComponentDiaDiem className='col-md-12' ref={e => this.thuongTru = e} label='Thường trú' requiredSoNhaDuong />
                </div>
                <h5>Thông tin học tập</h5>
                <div className='row'>
                    <FormSelect className='col-md-4' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' required
                        data={SelectAdapter_DtKhoaDaoTao}
                        onChange={e => this.setState({ namTuyenSinh: e.id }, () => this.maCtdt.value(null))} value={new Date().getFullYear()} />
                    <FormSelect className='col-md-4' ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' required
                        data={SelectAdapter_DmSvLoaiHinhDaoTao}
                        onChange={e => this.setState({ loaiHinhDaoTao: e.id }, () => this.maCtdt.value(null))} />
                    <FormSelect className='col-md-4' ref={e => this.maNganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} required
                        onChange={(e) => this.setState({ maNganh: e.id }, () => this.maCtdt.value(null))} />
                    <FormSelect className='col-md-4' ref={e => this.maCtdt = e} label='Chương trình đào tạo'
                        data={SelectAdapter_KhungDaoTaoCtsvFilter(this.state.loaiHinhDaoTao, this.state.namTuyenSinh, this.state.maNganh)}
                        onChange={e => this.setState({ maCtdt: e.id }, () => this.lop.value(null))}
                        disabled={!this.state.loaiHinhDaoTao || !this.state.maNganh || !this.state.namTuyenSinh} />
                    <FormSelect className='col-md-4' ref={e => this.lop = e}
                        data={SelectAdapter_DtLopCtdt(this.state.maCtdt)} label='Lớp'
                        disabled={!this.state.maCtdt} />
                    <FormSelect className='col-md-4' ref={e => this.tinhTrang = e}
                        data={SelectAdapter_DmTinhTrangSinhVienV2} label='Tình trạng' value={1} required
                    />
                </div>
            </>
        });
    }
}