import { SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

export default class TachTransactionModal extends AdminModal {
    componentDidMount() {
        this.fileBox.setData('TachTransaction');
    }

    onShow = () => {
        this.setState({ isSubmit: false });
    }

    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }

    onSubmit = () => {
        this.setState({ isSubmit: true });
        this.fileBox.onUploadFile({});
    }
    onSuccess = (res) => {
        this.setState({ isSubmit: false });
        const { tuNgay, denNgay } = this.getTimeFilter();
        const data = {
            tuNgay, denNgay,
            nganHang: this.nganHang.value(),
            index: this.index.value()
        };
        if (!res.fileName) {
            T.notify('Lỗi upload file', 'danger');
        } else {
            T.handleDownload(`/api/khtc/danh-sach-giao-dich/compare/result/${res.fileName}?info=${T.stringify(data)}`, 'TachTransaction.xlsx');
            this.hide();
        }
        T.notify('Tải xuống thành công', 'success');
    }
    render = () => {
        return this.renderModal({
            title: 'Công cụ kiểm tra sổ phụ BIDV',
            isLoading: this.state.isSubmit,
            body: <div className='row'>
                <FormSelect data={SelectAdapter_DmBank} label='Ngân hàng' ref={e => this.nganHang = e} className='col-md-6' />
                <FormTextBox type='number' label='Dòng dữ liệu bắt đầu' ref={e => this.index = e} className='col-md-6' />
                <FormDatePicker type='date' label='Từ ngày' ref={e => this.tuNgay = e} className='col-md-6' />
                <FormDatePicker type='date' label='Đến ngày' ref={e => this.denNgay = e} className='col-md-6' />
                <FileBox className='col-md-12' pending={true} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TachTransaction' userData='TachTransaction' success={this.onSuccess} />
            </div>
        });
    }
}
