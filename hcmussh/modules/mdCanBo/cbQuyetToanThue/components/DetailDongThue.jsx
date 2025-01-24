import React from 'react';
import { AdminPage, FormCheckbox, FormTextBox, TableCell, renderDataTable } from 'view/component/AdminPage';

export class DetailDongThue extends AdminPage {
    state = { soTienBangChu: null, inValid: false, customValue: false }
    componentDidMount() {
        this.setState({ nam: this.props.nam }, () => {
            this.props.getDetailQuyetToan(this.props.nam, res => {
                this.soTienThanhToan.value(res.congNoDetail?.soTienThanhToan || '');
                this.setState({
                    items: res.items, congNoDetail: res.congNoDetail,
                    inValid: false, soTienBangChu: T.numberToVnText(res?.congNoDetail?.soTienThanhToan)
                });
            });
        });
    }
    componentDidUpdate(preProps) {
        if (this.props.nam != preProps.nam || JSON.stringify(preProps) != JSON.stringify(this.props)) {
            this.setState({ nam: this.props.nam }, () => {
                this.props.getDetailQuyetToan(this.props.nam, res => {
                    this.soTienThanhToan.value('');
                    this.setState({ items: res.items, congNoDetail: res.congNoDetail, soTienBangChu: T.numberToVnText(res?.congNoDetail?.soTienThanhToan), inValid: false }, () => {
                        this.soTienThanhToan.value(res?.congNoDetail?.soTienThanhToan || '');
                    });
                });
            });
        }
    }
    openQR = () => {
        if (!this.soTienThanhToan.value() || this.soTienThanhToan.value() <= 10 || this.state.inValid) {
            T.notify('Số tiền thanh toán không hợp lệ! Số tiền thanh toán không được nhỏ hơn 10.000VNĐ và không được lớn hơn công nợ!', 'danger');
            return;
        }
        this.props.onCreateDongThue({ soTien: this.soTienThanhToan.value(), nam: this.props.nam, isCustom: Number(this.state.customValue) });
    }
    handleChange = () => {
        this.setState({ soTienBangChu: T.numberToVnText(this.soTienThanhToan.value()), inValid: this.soTienThanhToan.value() > this.props.data?.congNo || this.soTienThanhToan.value() < 10000 });
    }
    render() {
        const table = renderDataTable({
            data: this.state.items || [],
            divStyle: { height: '25vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã giao dịch</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Số tiền thanh toán (VNĐ)</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày giao dịch</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'left' }} type='number' content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} type='text' content={item.transId} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.bank} />
                    <TableCell style={{ textAlign: 'right' }} content={T.numberDisplay(item.amount)} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.transDate, 'HH:MM dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.thoiGianSoPhu, 'HH:MM dd/mm/yy')} />
                </tr>),
        });
        return <div className='tile'>
            <div>
                <FormCheckbox ref={e => this.customThue = e} label={<b>Số tiền khác (tối thiểu 10.000 VNĐ)</b>} onChange={() => {
                    this.setState({ customValue: this.customThue.value() });
                }}></FormCheckbox>
            </div>
            <br />
            <div className='d-flex align-items-baseline' style={{ whiteSpace: 'wrap' }}>
                <div>
                    <FormTextBox
                        disabled={!this.state?.customValue}
                        style={{ minWidth: '200px' }}
                        type='number' ref={e => this.soTienThanhToan = e}
                        className='mr-2' placeholder='Số tiền nộp'
                        onChange={() => this.handleChange()}
                    ></FormTextBox>
                </div>
                <button className='btn btn-success mr-2'
                    disabled={!this.state.congNoDetail}
                    onClick={(e) => {
                        e.preventDefault();
                        this.openQR();
                    }} ><i className='fa fa-qrcode'></i>Thanh toán</button>
                <div>
                    <span>(Thầy/cô vui lòng xem hướng dẫn thanh toán <a href='/api/cb/quyet-toan-thue/huong-dan/download'>tại đây</a>)</span>
                </div>
            </div>
            <div >
                Bằng chữ: <b>{this.state.soTienBangChu}</b> đồng
            </div>
            <div>
                <span style={{ color: 'red', visibility: this.state.inValid ? 'visible' : 'hidden' }}>(Số tiền quyết toán không thể lớn hơn công nợ và không nhỏ hơn 10.000VNĐ)</span>
            </div>
            <br></br>
            <h5>Lịch sử nộp thuế thu nhập cá nhân</h5>
            {table}
        </div>;
    }
}
