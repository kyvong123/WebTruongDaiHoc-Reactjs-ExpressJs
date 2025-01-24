import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh, SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { lookup } from '../redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 12);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class DinhMucLookupModal extends AdminModal {
    onShow = () => {
        this.setState({ lookUpByMssv: false, isLoading: false });
    }

    onSubmit = () => {
        try {
            const data = {};
            if (this.state.lookUpByMssv) {
                const validateField = ['namHoc', 'hocKy', 'mssv'];
                validateField.forEach(key => {
                    data[key] = this[key].value();
                    if (data[key] == null && this[key].props.required) {
                        T.notify(this[key].props.label + ' trống', 'danger');
                        throw {};
                    }
                });
            } else {
                const validateField = ['namHoc', 'hocKy', 'bac', 'loaiHinhDaoTao', 'loaiSinhVien', 'nganh', 'namTuyenSinh'];
                validateField.forEach(key => {
                    data[key] = this[key].value();
                    if (data[key] == null && this[key].props.required) {
                        T.notify(this[key].props.label + ' trống', 'danger');
                        throw {};
                    }
                });
            }
            this.setState({ isLoading: true }, () => {
                this.props.lookup(data, (soTien) => { this.soTien.value(soTien); this.onChangeSoTien(soTien); }, () => { this.setState({ isLoading: false }); });
            });
        } catch (error) {
            console.error(error);
            return;
        }
    }

    onChangeSoTien = (value) => {
        // const value = this.soTien.value();
        if (value) {
            this.soTienThanhChu?.value(T.numberToVnText(value) + ' đồng');
        } else
            this.soTienThanhChu?.value('');
    }


    changeLookupType = (value) => {
        this.setState({ lookUpByMssv: value });
    }

    render = () => {
        return this.renderModal({
            title: 'Tra cứu định mức',
            submitText: 'Tra cứu',
            isLoading: this.state.isLoading,
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.namHoc = e} required label='Năm học' data={yearDatas().reverse()} />
                <FormSelect className='col-md-6' ref={e => this.hocKy = e} required label='Học kỳ' data={termDatas} />
                <FormCheckbox className='col-md-12' isSwitch label='Tra cứu bằng dữ liệu sinh viên' onChange={this.changeLookupType} />
                {!this.state.lookUpByMssv && <>
                    <FormSelect className='col-md-4' ref={e => this.bac = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} required />
                    <FormSelect className='col-md-4' ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required />
                    <FormSelect className='col-md-4' ref={e => this.loaiSinhVien = e} label='Loại sinh viên' data={SelectAdapter_DmLoaiSinhVienV2} required />
                    <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-6' required />
                    <FormSelect className='col-md-6' ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} required />
                </>}
                {this.state.lookUpByMssv && <FormSelect className='col-md-12' ref={e => this.mssv = e} label='Sinh viên' data={SelectAdapter_FwStudent} required />}
                <div className='col-md-12 form-group'>
                    Kết quả tra cứu:
                </div>
                <FormTextBox disabled className='col-md-12' ref={e => this.soTien = e} label='Số tiền' onChange={this.onChangeSoTien} />
                <FormTextBox className='col-md-12' ref={e => this.soTienThanhChu = e} label='Số tiền (thành chữ)' disabled />
            </div>
        });
    }
}

const mapActionsToProps = { lookup };
export default connect(null, mapActionsToProps, null, { forwardRef: true })(DinhMucLookupModal);
