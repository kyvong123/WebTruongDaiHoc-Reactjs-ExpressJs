import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
class ThongTinSV extends AdminPage {
    state = {};

    initData = (item) => {
        if (item) {
            this.mssv.value(item.mssv || '');
            this.hoTen.value(item.ho + ' ' + item.ten || '');
            this.lop.value(item.lop || '');
            this.namTuyenSinh.value(item.namTuyenSinh || '');
            this.tenKhoa.value(item.tenKhoa || '');
            this.loaiHinhDaoTao.value(item.loaiHinhDaoTao || '');
            this.tenNganh.value(item.tenNganh || '');
            this.tenTinhTrangSV.value(item.tenTinhTrangSV || '');
            this.tinhPhi.value(item.tinhPhi ? 'Đóng đủ' : 'Còn nợ');
            this.sdt.value(item.sdt || '');
        }
    }

    render() {
        return (<>
            <div className='row'>
                <FormTextBox ref={e => this.mssv = e} label='MSSV' className='form-group col-md-3 mb-2' readOnly />
                <FormTextBox ref={e => this.hoTen = e} label='Họ và tên' className='form-group col-md-5 mb-2' readOnly />
                <FormTextBox ref={e => this.tinhPhi = e} label='Học phí' className='form-group col-md-4 mb-2' readOnly />

                <FormTextBox ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' className='form-group col-md-3 mb-2' readOnly />
                <FormTextBox ref={e => this.tenKhoa = e} label='Khoa' className='form-group col-md-5 mb-2' readOnly />
                <FormTextBox ref={e => this.tenNganh = e} label='Ngành' className='form-group col-md-4 mb-2' readOnly />

                <FormTextBox ref={e => this.namTuyenSinh = e} label='Khóa SV' className='form-group col-md-3 mb-2' readOnly />
                <FormTextBox ref={e => this.lop = e} label='Lớp' className='form-group col-md-3 mb-2' readOnly />
                <FormTextBox ref={e => this.sdt = e} label='SĐT' className='form-group col-md-3 mb-2' readOnly />
                <FormTextBox ref={e => this.tenTinhTrangSV = e} label='TTSV' className='form-group col-md-3 mb-2' readOnly />
            </div>
        </>);
    }
}

const mapActionsToProps = {};
export default connect(null, mapActionsToProps, null, { forwardRef: true })(ThongTinSV);
