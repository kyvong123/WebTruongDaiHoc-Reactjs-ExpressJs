import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';


export default class ThongKeNhapHoc extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.namTuyenSinh.value('');
        this.khoa.value('');
        this.lop.value('');
        this.tuNgay.value('');
        this.denNgay.value('');
        this.loaiHinhDaoTao.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();

        const filter = {
            namTuyenSinh: getValue(this.namTuyenSinh),
            khoa: getValue(this.khoa).toString(),
            lop: getValue(this.lop).toString(),
            tuNgay: T.dateToNumber(getValue(this.tuNgay), 0, 0, 0, 0),
            denNgay: T.dateToNumber(getValue(this.denNgay), 23, 59, 59, 999),
            loaiHinhDaoTao: getValue(this.loaiHinhDaoTao).toString()
        };
        let check = true;
        ['namTuyenSinh', 'tuNgay', 'denNgay'].forEach(key => {
            if (!this[key].value) {
                T.notify('Vui lòng điền đầy đủ thông tin bắt buộc', 'danger');
                check = false;
            }
        });
        check && T.handleDownload(`/api/khtc/thong-ke/thong-ke-tuyen-sinh?filter=${T.stringify(filter)}`, 'TEST_FAIL.xlsx');
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê tuyển sinh',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            body: <div className='row'>
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-6' allowClear required />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.lop = e} label='Lớp' data={SelectAdapter_DtLopFilter()} className='col-md-6' allowClear multiple />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' required />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' required />
            </div>
        });
    }
}


