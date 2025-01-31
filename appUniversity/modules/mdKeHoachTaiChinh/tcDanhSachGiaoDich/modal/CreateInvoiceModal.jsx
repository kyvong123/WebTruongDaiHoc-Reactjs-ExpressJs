
import React from 'react';
import { AdminModal, renderTable, TableCell } from 'view/component/AdminPage';

export default class CreateInvoice extends AdminModal {
    onShow = (item) => {
        this.props.getInfoInvocie(item, result => {
            this.setState({
                mssv: item.mssv,
                namHoc: item.namHoc,
                hocKy: item.hocKy,
                ho: item.ho,
                ten: item.ten,
                listKhoanThu: result.listKhoanThu,
                transId: item.transactionId,
                invoiceId: item.invoiceId,
                isLoading: false
            });
        });
    }
    onSubmit = () => {
        // this.state.isLoading = true;
        this.setState({ isLoading: true });
        const data = {
            listKhoanThu: this.state.listKhoanThu,
            mssv: this.state.mssv,
            hocKy: this.state.hocKy,
            namHoc: this.state.namHoc,
            invoiceId: this.state.invoiceId,
            transId: this.state.transId
        };
        this.props.createInvoiceTransaction(data, () => {
            this.setState({ isLoading: false });
            this.hide();
        });
    }

    render = () => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' });
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            getDataSource: () => this.state.listKhoanThu || [],
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={item.soTien || ''} />
                </tr>
            )
        });

        return this.renderModal({
            title: `Xác nhận xuất hóa đơn học phí cho sinh viên ${this.state.ho} ${this.state.ten}`,
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Xuất hóa đơn',
            body: <div className='row'>
                <div className='col-md-12'>
                    <div className='tile'>
                        {table}
                    </div>
                </div>
            </div>
        });
    }
}