
import React from 'react';
import { AdminModal, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

export default class UploadTransactionModal extends AdminModal {

    onSubmit = () => {
        T.alert('Loading...', 'warning', false, null, true);
        this.fileBox.onUploadFile({});
    }
    onSuccess = (data) => {
        this.setState({ isLoading: false, listSuccess: data.listSuccess, listError: data.listError }, () => T.alert('Tải lên giao dịch thành công', 'success', false, 500));
    }
    render = () => {


        let tableRender = (list) => renderTable({
            emptyTable: 'Danh sách trống',
            getDataSource: () => list || [],
            stickyHead: list > 15,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'left' }}>Mã số sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Số tiền giao dịch được thêm (VNĐ)</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell type='number' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.soTien} />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Tải lên danh sách giao dịch',
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Tải lên',
            body: <div className="row">
                <div className='col-md-12'>
                    Thêm giao dịch bằng file excel. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/khtc/giao-dich/download-template')}>đây</a>
                </div>
                <div className='col-md-12'>
                    <FileBox pending={true} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TcCreateGiaoDich' userData='TcCreateGiaoDich' success={this.onSuccess} />
                </div>
                <div className="col-md-12" style={{ marginTop: 8 }}>
                    {
                        this.state.listSuccess?.length > 0 ? <h4>Danh sách import thành công</h4> : <></>
                    }
                    {
                        this.state.listSuccess?.length > 0 ?
                            tableRender(this.state.listSuccess)
                            :
                            <></>
                    }
                </div>
                <div className="col-md-12" style={{ marginTop: 8 }}>
                    {
                        this.state.listError?.length > 0 ? <h4> Danh sách import thất bại</h4> : <></>
                    }
                    {
                        this.state.listError?.length ?
                            tableRender(this.state.listError)
                            :
                            <></>
                    }
                </div>
            </div>

        });
    }
}


