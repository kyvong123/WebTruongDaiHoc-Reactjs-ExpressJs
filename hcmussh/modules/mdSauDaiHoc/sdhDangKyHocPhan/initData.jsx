import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';

class ThongTinHocVienSdh extends AdminPage {
    state = {};

    initData = (item) => {
        if (item) {
            this.mssv.value(item.mssv || '');
            this.hoTen.value(item.ho + ' ' + item.ten || '');
            this.lop.value(item.lop || '');
            this.namTuyenSinh.value(item.namTuyenSinh || '');
            this.tenKhoa.value(item.tenKhoa || '');
            this.tenLoaiHinhDaoTao.value(item.tenLoaiHinhDaoTao || '');
            this.tenNganh.value(item.tenNganh || '');
            this.tenTinhTrangSV.value(item.tenTinhTrangSV || '');
            this.tinhPhi.value(item.tinhPhi ? 'Đóng đủ' : 'Còn nợ');
        }
    }

    render() {
        return (<>
            <div className='row'>
                <FormTextBox ref={e => this.mssv = e} label='MSSV' className='form-group col-md-3' readOnly />
                <FormTextBox ref={e => this.hoTen = e} label='Họ và tên' className='form-group col-md-5' readOnly />
                <FormTextBox ref={e => this.tinhPhi = e} label='Học phí' className='form-group col-md-4' readOnly />

                <FormTextBox ref={e => this.tenLoaiHinhDaoTao = e} label='Hệ đào tạo' className='form-group col-md-4' readOnly />
                <FormTextBox ref={e => this.tenKhoa = e} label='Khoa' className='form-group col-md-4' readOnly />
                <FormTextBox ref={e => this.tenNganh = e} label='Ngành' className='form-group col-md-4' readOnly />

                <FormTextBox ref={e => this.namTuyenSinh = e} label='Khóa sinh viên' className='form-group col-md-4' readOnly />
                <FormTextBox ref={e => this.lop = e} label='Lớp' className='form-group col-md-4' readOnly />
                <FormTextBox ref={e => this.tenTinhTrangSV = e} label='TTSV' className='form-group col-md-4' readOnly />
            </div>
        </>);
    }
}

const mapActionsToProps = {};
export default connect(null, mapActionsToProps, null, { forwardRef: true })(ThongTinHocVienSdh);
