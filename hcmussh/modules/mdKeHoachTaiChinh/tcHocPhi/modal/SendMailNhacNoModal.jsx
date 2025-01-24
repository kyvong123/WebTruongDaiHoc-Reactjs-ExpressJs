import React from 'react';
import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

export default class SendMailNhacNo extends AdminModal {
    state = { isSubmitting: false, data: '', invoicesLength: 0 }
    onSubmit = (e) => {
        e.preventDefault();
        const filter = {
            namTuyenSinh: this?.namTuyenSinh.value(),
            listBacDaoTao: this?.bacDaoTao.value(),
            listLoaiHinhDaoTao: (this.loaiHinhDaoTao?.value() || []).toString(),
            khoa: this?.khoa.value(),
            nganh: this?.nganh.value()
        };


        this.setState({ isSubmitting: true }, () => {
            this.props.sendRemindMail({ filter }, () => {
                this.setState({ isSubmitting: false }, () => {
                    this.hide();
                });
            });
        });
    }


    onShow = () => {
        this.namTuyenSinh.value('');
        this.bacDaoTao.value('');
        this.loaiHinhDaoTao.value('');
        this.khoa.value('');
        this.nganh.value('');
        this.props.getLengthRemindMail({ filter: {} }, ({ length: invoicesLength }) => {
            this.setState({ invoicesLength }, () => {
                this.invoicesLength?.value(invoicesLength.toString());
            });
        });

        this.onChangeValue();
    }

    onChangeValue = () => {
        const filter = {
            namTuyenSinh: this?.namTuyenSinh.value(),
            listBacDaoTao: this?.bacDaoTao.value(),
            listLoaiHinhDaoTao: (this.loaiHinhDaoTao?.value() || []).toString(),
            khoa: this?.khoa.value(),
            nganh: this?.nganh.value()
        };

        this.props.getLengthRemindMail({ filter }, ({ length: invoicesLength }) => {
            this.setState({ invoicesLength }, () => {
                this.invoicesLength?.value(invoicesLength.toString());
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Gửi e-mail nhắc nợ',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.namTuyenSinh = e} data={SelectAdapter_FwNamTuyenSinh} label='Năm tuyển sinh' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' onChange={this.onChangeValue} allowClear multiple />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.nganh = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành đào tạo' onChange={this.onChangeValue} allowClear />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.invoicesLength) ? {} : { display: 'none' }} label='Số Email sẽ được gửi' ref={e => this.invoicesLength = e} />
            </div>
        });
    }
}