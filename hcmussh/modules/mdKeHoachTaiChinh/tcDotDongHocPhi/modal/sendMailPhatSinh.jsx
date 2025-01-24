import React from 'react';
import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
// import { getLengthRemindMail } from '../redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export default class SendMailPhatSinh extends AdminModal {
    state = { isSubmitting: false, mailPhatSinhLength: '' }

    onShow = () => {
        this.namHoc.value('');
        this.hocKy.value('');
        this.namTuyenSinh.value('');
        this.bacDaoTao.value('');
        this.heDaoTao.value('');
        this.khoa.value('');
        this.nganhDaoTao.value('');
        this.setState({ mailPhatSinhLength: '' });
        this.mailPhatSinhLength.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const filter = {
            namHoc: this.namHoc?.value(),
            hocKy: this.hocKy?.value(),
            namTuyenSinh: this.namTuyenSinh?.value(),
            bacDaoTao: this.bacDaoTao?.value(),
            heDaoTao: this.heDaoTao?.value(),
            khoa: this.khoa?.value(),
            nganhDaoTao: (this.nganhDaoTao?.value() || []).toString()
        };

        if (!filter.namHoc) {
            T.notify('Vui lòng chọn năm học', 'danger');
            this.namHoc.focus();
        } else if (!filter.hocKy) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
            this.hocKy.focus();
        } else if (!filter.namTuyenSinh) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
            this.namTuyenSinh.focus();
        } else {
            this.setState({ isSubmitting: true }, () => {
                this.props.sendMailPhatSinh(filter, () => {
                    this.setState({ isSubmitting: false });
                    this.hide();
                });
            });
        }
    }


    onChangeValue = () => {
        const filter = {
            namHoc: this.namHoc?.value(),
            hocKy: this.hocKy?.value(),
            namTuyenSinh: this?.namTuyenSinh.value(),
            bacDaoTao: this?.bacDaoTao.value(),
            heDaoTao: this.heDaoTao?.value(),
            khoa: this.khoa?.value(),
            nganhDaoTao: (this.nganhDaoTao?.value() || []).toString()
        };

        if (filter.namHoc && filter.hocKy && filter.namTuyenSinh) {
            this.setState({ isSubmitting: true }, this.props.getLengthMailPhatSinh(filter, (mailPhatSinhLength) => {
                this.setState({ mailPhatSinhLength }, () => {
                    this.mailPhatSinhLength?.value(mailPhatSinhLength?.toString());
                    this.setState({ isSubmitting: false });
                });
            }));
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Gửi e-mail phát sinh học phí',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.namHoc = e} data={yearDatas()?.reverse()} label='Năm học' onChange={this.onChangeValue} required />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.hocKy = e} data={termDatas} label='Học kỳ' onChange={this.onChangeValue} required />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.namTuyenSinh = e} data={SelectAdapter_FwNamTuyenSinh} label='Năm tuyển sinh' onChange={this.onChangeValue} required />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.nganhDaoTao = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành đào tạo' onChange={this.onChangeValue} allowClear multiple />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.mailPhatSinhLength) ? {} : { display: 'none' }} label='Số Email sẽ được gửi' ref={e => this.mailPhatSinhLength = e} />
            </div>
        });
    }
}