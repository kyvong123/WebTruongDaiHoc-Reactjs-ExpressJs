import React from 'react';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getInvoiceStudent } from './redux';
import { Tooltip } from '@mui/material';

export class InvoicePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/hoc-phi/invoice', () => {
            this.props.getInvoiceStudent(result => {
                this.setState({
                    list: result.list
                });
            });
        });
    }

    render() {
        let table = renderTable({
            emptyTable: 'Chưa có thông tin giao dịch trên hệ thống',
            getDataSource: () => this.state.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số thứ tự</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học - Học kì</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày giao dịch</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tiền giao dịch</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Khoản thu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Hóa đơn</th>
                </tr>),
            renderRow: (item, index) => {
                let content = <></>;
                const objectKhoanThu = JSON.parse(item.khoanThu);
                if (objectKhoanThu) {
                    const contentKhoanThu = Object.keys(objectKhoanThu);
                    content = contentKhoanThu.map((cur, index) => {
                        return <li style={{ listStyle: 'none' }} key={index}>{`${objectKhoanThu[cur].ten}: ${T.numberDisplay(Number(objectKhoanThu[cur].soTien))} VNĐ`}</li>;
                    });
                }

                return (<tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK0${item.hocKy}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type={item.transDate ? 'date' : 'text'} dateFormat='HH:MM:ss dd/mm/yyyy' content={parseInt(item.transDate)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.bank} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='text' content={`${T.numberDisplay(parseInt(item.amount))} VNĐ`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={content} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.invoiceId ? <Tooltip title='Xem hóa đơn' arrow>
                        <button className='btn btn-warning' onClick={(e) => { e.preventDefault(); T.handleDownload(`/api/sv/invoice/paper/download/${item.invoiceId}`); }} >
                            <i className='fa fa-lg fa-credit-card' />
                        </button>
                    </Tooltip> : <span style={{ color: 'green' }}>Hóa đơn chưa được xuất</span>} />
                </tr>);
            }
        });
        return this.renderPage({
            title: 'Lịch sử giao dịch',
            icon: 'fa fa-object-group',
            breadcrumb: ['Học Phí'],
            content:
                <div className='tile'>{table}</div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getInvoiceStudent };
export default connect(mapStateToProps, mapActionsToProps)(InvoicePage);
