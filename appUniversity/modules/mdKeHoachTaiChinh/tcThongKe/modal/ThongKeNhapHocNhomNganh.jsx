import React from 'react';
import { AdminModal, FormDatePicker, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';

export default class ThongKeNhapHocNhomNganh extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.namTuyenSinh.value('');
        this.tuNgay.value('');
        this.denNgay.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();

        const filter = {
            namTuyenSinh: this.namTuyenSinh.value(),
            tuNgay: this.tuNgay.value().setHours(0, 0, 0, 0),
            denNgay: this.denNgay.value().setHours(23, 59, 59, 999),
        };
        let check = true;
        ['namTuyenSinh', 'tuNgay', 'denNgay'].forEach(key => {
            if (!this[key].value) {
                T.notify('Vui lòng điền đầy đủ thông tin bắt buộc', 'danger');
                check = false;
            }
        });
        check && T.handleDownload(`/api/khtc/thong-ke/thong-ke-tuyen-sinh/nhom-nganh?filter=${T.stringify(filter)}`, 'TEST_FAIL.xlsx');
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê tuyển sinh theo ngành',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            body: <div className='row'>
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-6' allowClear required />
                <div className='col-md-6'></div>
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' required />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' required />
            </div>
        });
    }
}


