
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import React from 'react';
import { AdminModal, FormSelect, FormDatePicker } from 'view/component/AdminPage';


const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 13);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
export default class CustomFilterModal extends AdminModal {
    onShow = (config = {}) => {
        this.setState({ requiredFields: config.requiredFields || [], onSubmit: config.onSubmit, button: config.button });
        this.tuNgay.value('');
        this.denNgay.value('');
    }

    isRequired = (key) => {
        return this.state.requiredFields.includes(key);
    }

    getData = () => {

        try {
            const keyword = ['bank', 'namHoc', 'hocKy', 'tuNgay', 'denNgay', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'listNganh', 'loaiSinhVien'];
            const data = {};
            keyword.forEach(key => {
                data[key] = this[key]?.value();
                if ((data[key] == null || (Array.isArray(data[key]) && !data[key].length)) && this[key].props.required) {
                    T.notify(this[key].props.label + ' trống', 'danger');
                    throw new Error('Dữ liệu không hợp lệ');
                }
                if (Array.isArray(data[key]))
                    data[key] = data[key].toString();
                else if (data[key] instanceof Date) {
                    if (key == 'tuNgay') {
                        data[key] = data[key].setHours(0, 0, 0, 0);
                    }
                    if (key == 'denNgay') {
                        data[key] = data[key].setHours(23, 59, 59, 999);
                    }
                }
            });
            return data;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = this.getData();
        if (data) {
            this.hide();
            this.state.onSubmit(data);
        }
    }


    onCustomEvent = (func) => {
        const data = this.getData();
        if (data) {
            this.hide();
            func(data);
        }
    }



    render = () => {

        return this.renderModal({
            title: 'Bộ lọc',
            submitText: 'Tải xuống',
            isLoading: this.state.isLoading,
            size: 'elarge',
            postButtons: this.state.button ? <button key='1' className='btn btn-primary' onClick={(e) => e.preventDefault() || this.onCustomEvent(this.state.button.onClick)}><i className={this.state.button.icon} />{this.state.button.title}</button> : null,
            body: < div className='row' >
                <FormSelect className='col-md-6' ref={e => this.namHoc = e} data={yearDatas().reverse()} label='Năm học' required />
                <FormSelect className='col-md-6' ref={e => this.hocKy = e} data={termDatas} label='Học kỳ' required />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' />
                <FormSelect className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' allowClear multiple />
                <FormSelect className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bank = e} label='Ngân hàng' data={SelectAdapter_DmBank} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.listNganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.loaiSinhVien = e} label='Loại Sinh Viên' data={SelectAdapter_DmLoaiSinhVienV2} className='col-md-3' allowClear />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-3' allowClear />
            </div >
        });
    }
}