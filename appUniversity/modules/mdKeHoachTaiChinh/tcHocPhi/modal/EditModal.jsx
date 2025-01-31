
import { SelectAdapter_DmTinhTrangHocPhi } from 'modules/mdDanhMuc/dmTinhTrangHocPhi/redux';
import React from 'react';
import { AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    onShow = (item) => {
        const { mssv, hocPhi, namHoc, hocKy, hoTenSinhVien, maTrangThai, ghiChu } = item ? item : {
            mssv: '', hocPhi: '', namHoc: '', hocKy: '', hoTenSinhVien: '', maTrangThai: '', ghiChu: ''
        };

        this.setState({ mssv, namHoc, hocKy, hocPhi, trangThai: maTrangThai, ghiChu }, () => {
            this.mssv.value(mssv || '');
            this.hocPhi.value(hocPhi || 0);
            this.namHoc.value(namHoc || 0);
            this.hocKy.value(hocKy || 0);
            this.hoTenSinhVien.value(hoTenSinhVien || 0);
            this.trangThai.value(maTrangThai || '');
            this.ghiChu.value(ghiChu || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { mssv, namHoc, hocKy } = this.state;
        if (!this.trangThai.value()) {
            T.notify('Trạng thái trống', 'danger');
            this.trangThai.focus();
        } else {
            const changes = {
                trangThai: this.trangThai.value(),
                ghiChu: this.ghiChu.value()
            };
            if (changes.trangThai == this.trangThai && changes.ghiChu == this.ghiChu) return;
            this.props.update({ mssv, namHoc, hocKy }, changes, this.props.getPage, this.hide());
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật dữ liệu học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.namHoc = e} type='year' label='Năm học' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocKy = e} type='number' label='Học kỳ' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.hoTenSinhVien = e} type='text' label='Họ và tên' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocPhi = e} type='number' label='Học phí (VNĐ)' readOnly={true} />
                <FormSelect className='col-md-4' ref={e => this.trangThai = e} data={SelectAdapter_DmTinhTrangHocPhi} label='Tình trạng học phí' readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}