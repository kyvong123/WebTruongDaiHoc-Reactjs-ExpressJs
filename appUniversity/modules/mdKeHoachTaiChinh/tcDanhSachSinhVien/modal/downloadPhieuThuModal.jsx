
import React from 'react';

import { AdminModal, FormSelect, getValue } from 'view/component/AdminPage';

export default class DownloadPhieuThu extends AdminModal {
    componentDidUpdate() {
        this.filterHocKy.value('');
    }

    onShow = (data) => {
        this.setState({ listNamHocHocKy: data?.listNamHocHocKy || [], infoSinhVien: data?.infoSinhVien || {} });
    }

    onSubmit = () => {
        const filter = {
            hocKy: getValue(this.filterHocKy),
            mssv: this.state.infoSinhVien?.mssv || ''
        };
        this.props.downloadWord(filter, res => {
            T.FileSaver(new Blob([new Uint8Array(res.content.data)]), res.filename);
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Xuất phiếu thông tin học phí',
            size: 'large',
            body: <div className='row'>
                {/* <div className="form-group col-md-12"><h5>{`Sinh viên ${this.state.hoTenSinhVien} - ${this.state.mssv}`}</h5></div> */}
                <FormSelect className='col-md-12' ref={e => this.filterHocKy = e} data={[{ id: 'all', text: 'Tất cả các học kỳ' }, ...this.state.listNamHocHocKy || []]} label='Chọn học kỳ xuất phiếu thu' required />
            </div >
        });
    }
}