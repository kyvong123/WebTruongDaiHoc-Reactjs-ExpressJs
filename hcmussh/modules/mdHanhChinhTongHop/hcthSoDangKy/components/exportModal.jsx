import React from 'react';
import { AdminModal, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';


const yearDatas = () => {
    const start = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => start - i);
};

export class ExportModal extends AdminModal {
    onShow = () => {
        this.setState({
            dateKey: Date.now(),
            startAt: null, endAt: null
        }, () => this.donVi.value(''));
    }

    onSubmit = () => {
        const data = {
            ...this.state,
            donVi: this.donVi.value(),
            namHanhChinh: this.namHanhChinh.value(),
        };
        this.hide();
        T.handleDownload(`/api/hcth/so-dang-ky/export?${T.objectToQueryString(data)}`);
    }

    render = () => {
        return this.renderModal({
            title: 'Xuất dữ liệu số văn bản',
            body: <div className="row">
                <FormSelect ref={e => this.donVi = e} className='col-md-12' label='Đơn vị' multiple data={SelectAdapter_DmDonVi} />
                <FormDatePicker key={`start_${this.state.dateKey}`} className='col-md-6' label='Bắt đầu' onChange={value => this.setState({ startAt: value.getTime() })} />
                <FormDatePicker key={`end_${this.state.dateKey}`} className='col-md-6' label='Kết thúc' onChange={value => this.setState({ endAt: value.getTime() })} />
                <FormSelect ref={e => this.namHanhChinh = e} className='col-md-12' label='Năm hành chính' multiple data={yearDatas()} />
            </div>
        });
    }
}