import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmTinhTrangHocPhi } from 'modules/mdDanhMuc/dmTinhTrangHocPhi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';


const getTimeFilter = (tuNgay, denNgay) => {
    if (tuNgay) {
        tuNgay.setHours(0, 0, 0, 0);
        tuNgay = tuNgay.getTime();
    }
    if (denNgay) {
        denNgay.setHours(23, 59, 59, 999);
        denNgay = denNgay.getTime();
    }
    return { tuNgay, denNgay };
};

export default class MultipleInvoiceModal extends AdminModal {
    state = { isSubmitting: false }

    onSubmit = () => {
        const data = {
            ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
            // namHoc: this.namHoc.value(),
            // hocKy: this.hocKy.value(),
            tinhTrang: this.tinhTrang.value().toString(),
            namTuyenSinh: this.namTuyenSinh.value(),
            bacDaoTao: this.bacDaoTao.value().toString(),
            loaiHinhDaoTao: (this.loaiHinhDaoTao.value() || []).toString(),
            listNganh: this.nganh.value().toString(),
            listKhoa: this.khoa.value().toString()
        };
        this.setState({ isSubmitting: true }, () => {
            this.props.onCreate(data, () => {
                this.setState({ isSubmitting: false });
            });
        });
    }

    onShow = (data) => {
        this.tuNgay.value(data.tuNgay || '');
        this.denNgay.value(data.denNgay || '');
        this.tinhTrang.value(data.tinhTrang || '');
        this.khoa.value('');
        this.nganh.value('');
        this.onChangeValue();
    }

    onChangeValue = () => {
        const data = {
            ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
            tinhTrang: this.tinhTrang.value().toString(),
            namTuyenSinh: this.namTuyenSinh.value(),
            bacDaoTao: this.bacDaoTao.value().toString(),
            loaiHinhDaoTao: (this.loaiHinhDaoTao.value() || []).toString(),
            listNganh: this.nganh.value().toString(),
            listKhoa: this.khoa.value().toString()
        };
        this.props.getPendingListInvoiceLength(data, (invoicesLength) => {
            this.setState({ invoicesLength }, () => {
                this.invoicesLength?.value(invoicesLength.toString());
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Xuất hóa đơn',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.tinhTrang = e} data={SelectAdapter_DmTinhTrangHocPhi} label='Trạng thái' onChange={this.onChangeValue} multiple required />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.namTuyenSinh = e} data={SelectAdapter_FwNamTuyenSinh} label='Năm tuyển sinh' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' onChange={this.onChangeValue} allowClear multiple />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' onChange={this.onChangeValue} allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-12' onChange={this.onChangeValue} allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-12' onChange={this.onChangeValue} allowClear multiple />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' onChange={this.onChangeValue} />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' onChange={this.onChangeValue} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.invoicesLength) ? {} : { display: 'none' }} label='Số hóa đơn sẽ được tạo' ref={e => this.invoicesLength = e} />
            </div>
        });
    }
}