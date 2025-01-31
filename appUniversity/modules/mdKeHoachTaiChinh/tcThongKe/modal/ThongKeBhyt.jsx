import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormDatePicker, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: year };
    });
};

class ThongKeBhyt extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.tuNgay.value('');
        this.denNgay.value('');
        this.bacDaoTao.value('');
        this.heDaoTao.value('');
        this.namTuyenSinh.value('');
        this.khoaSinhVien.value('');
        this.khoa.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const filter = {
            tuNgay: this.tuNgay ? T.dateToNumber(getValue(this.tuNgay)) : null,
            denNgay: this.denNgay ? T.dateToNumber(getValue(this.denNgay), 23, 59, 59, 999) : null,
            bacDaoTao: getValue(this.bacDaoTao).toString(),
            heDaoTao: getValue(this.heDaoTao).toString(),
            namTuyenSinh: getValue(this.namTuyenSinh).toString(),
            khoaSinhVien: getValue(this.khoaSinhVien).toString(),
            khoa: getValue(this.khoa).toString(),
        };

        T.handleDownload(`/api/khtc/thong-ke/thong-ke-bhyt?filter=${T.stringify(filter)}`, 'TEST_FAIL.xlsx');
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê BHYT',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            body: <div className='row'>
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={yearDatas()?.reverse()} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' data={yearDatas()?.reverse()} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-12' allowClear multiple />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThongKeBhyt);
