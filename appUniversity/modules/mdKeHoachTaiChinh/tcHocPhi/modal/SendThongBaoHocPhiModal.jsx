import React from 'react';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';


export default class SendThongBaoHocPhiModal extends AdminModal {
    state = { isSubmitting: false, data: '', invoicesLength: 0 }

    onSubmit = (e) => {
        e.preventDefault();
        const filter = {
            namTuyenSinh: this?.namTuyenSinh.value(),
            listBacDaoTao: this?.bacDaoTao.value(),
            listLoaiHinhDaoTao: (this.loaiHinhDaoTao?.value() || []).toString(),
            khoa: this?.khoa.value(),
            nganh: this?.nganh.value(),
            isNoHocPhi: this.isNoHocPhi.value() ? 1 : 0
        };
        const content = {
            title: this.title.value(),
            subTitle: this.subTitle.value(),
            icon: this.icon.value(),
            iconColor: this.iconColor.value()
        };
        if (!content.title) {
            T.notify('Vui lòng nhập tiêu đề thông báo', 'danger');
            this.title.focus();
            return;
        }
        if (!content.subTitle) {
            T.notify('Vui lòng nhập nội dung thông báo', 'danger');
            this.subTitle.focus();
            return;
        }
        if (!content.icon) {
            T.notify('Vui lòng chọn loại icon', 'danger');
            this.icon.focus();
            return;
        }
        if (!content.iconColor) {
            T.notify('Vui lòng chọn màu icon', 'danger');
            this.iconColor.focus();
            return;
        }
        this.setState({ isSubmitting: true }, () => {
            this.props.sendThongBaoHocPhi({ filter, content }, () => {
                this.setState({ isSubmitting: false }, () => {
                    this.hide();
                });
            });
        });

    }

    onShow = () => {
        ['namTuyenSinh', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh', 'title', 'subTitle', 'icon', 'iconColor', 'isNoHocPhi'].forEach(item => {
            this[item].value('');
        });
        this.onChangeValue();
    }

    onChangeValue = () => {
        const filter = {
            namTuyenSinh: this?.namTuyenSinh.value(),
            listBacDaoTao: this?.bacDaoTao.value(),
            listLoaiHinhDaoTao: (this.loaiHinhDaoTao?.value() || []).toString(),
            khoa: this?.khoa.value(),
            nganh: this?.nganh.value(),
            isNoHocPhi: this.isNoHocPhi.value() ? 1 : 0
        };
        this.setState({ isSubmitting: true }, () => {
            this.props.sendThongBaoHocPhiLength({ filter }, ({ length: invoicesLength }) => {
                this.setState({ invoicesLength }, () => {
                    this.invoicesLength?.value(invoicesLength.toString());
                    this.setState({ isSubmitting: false });
                });
            });
        });
    }

    render = () => {
        const listIcon = [
            {
                id: 'fa fa-bullhorn',
                text: 'Thông báo '
            },
            {
                id: 'fa fa-bell',
                text: 'Nhắc nhở'
            }
        ];

        const listIconColor = [
            {
                id: '#41B06E',
                text: 'Xanh lá'
            },
            {
                id: '#FCDC2A',
                text: 'Vàng'
            },
            {
                id: '#D04848',
                text: 'Đỏ'
            }
        ];
        return this.renderModal({
            title: 'Gửi thông báo thu học phí',
            size: 'large',
            submitText: 'Gửi thông báo',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.namTuyenSinh = e} data={SelectAdapter_FwNamTuyenSinh} label='Năm tuyển sinh' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' onChange={this.onChangeValue} allowClear multiple />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' onChange={this.onChangeValue} allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.nganh = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành đào tạo' onChange={this.onChangeValue} allowClear />
                {/*  */}
                <h4 className='col-md-12'>Nội dung thông báo</h4>
                <FormTextBox disbaled={this.state.isSubmitting} className='col-md-12' ref={e => this.title = e} label='Tiêu đề thông báo' />
                <FormTextBox disbaled={this.state.isSubmitting} className='col-md-12' ref={e => this.subTitle = e} label='Nội dung thông báo' />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.icon = e} label='Icon thông báo' data={listIcon} />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.iconColor = e} label='Màu icon' data={listIconColor} />
                <FormCheckbox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.isNoHocPhi = e} label='Chỉ gửi sinh viên nợ học phí' onChange={this.onChangeValue} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.invoicesLength) ? {} : { display: 'none' }} label={<span><i className='fa fa-bullhorn' /> Số thông báo sẽ được gửi</span>} ref={e => this.invoicesLength = e} />
            </div>
        });
    }
}