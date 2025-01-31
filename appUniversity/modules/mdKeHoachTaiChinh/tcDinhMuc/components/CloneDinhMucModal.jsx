

import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';

// const yearDatas = () => {
//     return Array.from({ length: 15 }, (_, i) => {
//         const year = i + new Date().getFullYear() - 14;
//         return { id: year, text: `${year} - ${year + 1}` };
//     });
// };

// const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export class CloneDinhMuc extends AdminModal {

    onShow = (item) => {
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            item: this.state.item,
            namTuyenSinh: this.namTuyenSinh.value()
        };
        if (!data.namTuyenSinh) {
            T.notify('Vui lòng chọn năm tuyển sinh', 'danger');
            this.namTuyenSinh.focus();
        } else {
            this.props.cloneDinhMuc(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Sao định mức học phí (Chỉ sao chép cùng năm học - học kỳ)',
            submitText: 'Sao chép định mức',
            body: <div className='row'>
                {/* <FormSelect required data={yearDatas()} label='Năm học' className='col-md-4' ref={e => this.namHoc = e} />
                <FormSelect required data={termDatas} label='Học kỳ' className='col-md-4' ref={e => this.hocKy = e} /> */}
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-12' required />
            </div>
        });
    }
}