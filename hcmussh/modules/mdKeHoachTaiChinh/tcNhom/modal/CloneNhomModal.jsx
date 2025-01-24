

import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year} - ${year + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export class CloneNhom extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    onShow = (item) => {
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            item: this.state.item,
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value()
        };
        if (!data.namHoc) {
            T.notify('Vui lòng chọn năm học', 'danger');
            this.namHoc.focus();
        } else if (!data.hocKy) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
            this.hocKy.focus();
        } else {
            this.props.cloneNhom(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Sao chép nhóm ngành - định mức',
            submitText: 'Sao chép nhóm ngành',
            body: <div className='row'>
                <FormSelect required data={yearDatas()} label='Năm học' className='col-md-6' ref={e => this.namHoc = e} />
                <FormSelect required data={termDatas} label='Học kỳ' className='col-md-6' ref={e => this.hocKy = e} />
            </div>
        });
    }
}