import React from 'react';
import { renderTable, TableCell } from 'view/component/AdminPage';
// import { Img } from 'view/component/HomePage';
import { loadSpinner } from './common';
import { getAllBank } from 'modules/mdDanhMuc/dmBank/redux';

export default class SinhVienThanhToan extends React.Component {
    state = {
        path: null, isLoading: true
    };
    renderQR = () => {
        return <React.Fragment>
            {/* <React.Fragment> */}

            {!this.state?.path ?
                <div className='imgSpiner' style={{ fontSize: '24px' }} ></div>
                :
                <img src={`data:image/png;base64,${this.state.base64}`} />
            }
            {/* </React.Fragment>; */}
            {/* <Img src={`data:image/png;base64,${this.state.base64}`} onLoading={!this.state?.path} /> */}
        </React.Fragment>;
    };

    componentDidMount() {
        getAllBank((items) => {
            this.setState({ banks: items.reduce((total, current) => ({ ...total, [current.ma]: current }), {}) }, () => {
                if (this.state.banks.BIDV.kichHoat) {
                    this.props.genQr(result => {
                        this.setState({ path: `/${result.path}`, base64: result.base64 });
                    });
                }
            });
        })();
        this.props.getPage(result => {
            this.setState({ data: result.data, isCompleteHocPhi: result.isCompleteHocPhi, isLoading: false });
        });
        T.socket.on('updated-tinhTrang', () => {
            this.props.getPage(result => {
                this.setState({ data: result.data, isCompleteHocPhi: result.isCompleteHocPhi });
                this.props.onCompleteThanhToan();
            });
        });

    }
    componentWillUnmount() {
        T.socket.off('updated-tinhTrang');
    }
    render() {
        const listHocPhi = this.state?.data || [];
        const style = { whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' };

        const tableDesktop = renderTable({
            getDataSource: () => listHocPhi || [],
            emptyTable: 'Chưa có dữ liệu học phí!',
            renderHead: () => (<tr>
                <th style={{ ...style }}>STT</th>
                <th style={{ width: '60%', textAlign: 'left', ...style }}>Khoản thu</th>
                <th style={{ width: '30%', textAlign: 'right', ...style }}>Số tiền</th>
                <th style={{ width: '10%', textAlign: 'center', ...style }}>Tình trạng</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${item.ten}`} />
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={`${T.numberDisplay(item.soTien)} VNĐ`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinhTrang ?
                        <p className='p-0 mb-0 text-success'>Đã thanh toán <i className='fa fa-check-circle' ></i></p> :
                        <p className='p-0 mb-0 text-danger'>Chưa thanh toán <i className='fa fa-clock-o'></i></p>
                    } />
                </tr>
            )
        });
        const ucFirst = (value) => {
            return value.charAt(0).toUpperCase() + value.slice(1);
        };
        const tableMobile = renderTable({
            getDataSource: () => listHocPhi || [],
            emptyTable: 'Chưa có dữ liệu học phí!',
            renderHead: () => (<tr>
                <th style={{ width: '70%', ...style }}>Khoản thu</th>
                <th style={{ width: '30%', ...style }}>Số tiền</th>
                <th style={{ ...style }}></th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'left' }} content={`${index + 1}. ${item.ten}`} />
                    <TableCell style={{ textAlign: 'left' }} content={T.numberDisplay(item.soTien)} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tinhTrang ? <i className='fa fa-check-circle' style={{ color: 'green' }} aria-hidden='true'></i> :
                        <i className='fa fa-clock-o' style={{ color: 'orange' }} aria-hidden='true'></i>} />
                </tr>
            )
        });
        const soTienChu = T.numberToVnText(listHocPhi.reduce((total, cur) => total + parseInt(cur.soTien), 0)).toString().trim() + ' đồng';
        return (this.state.isLoading ? loadSpinner() :
            <React.Fragment>
                <div className='tile'>
                    <div className='tile' style={{ borderColor: '#ccc' }}>
                        <div className='row m-2'>
                            <b className='tile-title text-primary col-md-12'>1. Các khoản thu</b>
                        </div>
                        {screen.width <= 976 ? tableMobile : tableDesktop}
                        <div className='row m-0 '>
                            <div className='col-md-12 p-0'>
                                <p className='p-0' style={{ marginBottom: '2px' }}>Tổng số tiền cần thanh toán: <b>{T.numberDisplay(listHocPhi.reduce((total, cur) => total + parseInt(cur.soTien), 0))} VNĐ</b></p>
                            </div>
                            <div className='col-md-12 p-0'>
                                <p className='p-0'>Bằng chữ: <b className='font-italic '>{ucFirst(soTienChu)}</b></p>
                            </div>
                        </div>
                    </div>

                    <div className='row'>

                    </div>
                    <br />
                    {(this.state?.isCompleteHocPhi == 0 || this.state?.isCompleteHocPhi == 2) && !!this.state.banks && <div className='tile' style={{ borderColor: '#ccc' }}>
                        <div className='row m-2'>
                            <b className='tile-title text-primary col-md-12'>2. Phương thức thanh toán</b>
                            <p className='text-danger font-weight-bold col-md-12'>
                                *Trong quá trình thanh toán học phí, nếu có vấn đề phát sinh cần được hỗ trợ, sinh viên vui lòng liên hệ số điện thoại: <a href='tel:02838293828'>028 38 293 828 - Nhánh 115</a> để được hướng dẫn.
                            </p>
                            <p></p>
                        </div>
                        <div className='row m-2'>
                            <div className='col-md-6 card' >
                                <div className='card-body' style={{ overflow: 'hidden' }}>
                                    <h4 className='tile-thanhtoan m-2'>Cách 1: Quét mã QR bên dưới</h4>
                                    <div className='row justify-content-center align-items-center p-0 m-0' style={{
                                        height: '350px'
                                    }}>
                                        {!!this.state.banks?.BIDV?.kichHoat && this.renderQR()}
                                        {!this.state.banks?.BIDV?.kichHoat && <span className='tile-title'>Kênh thanh toán BIDV đang bảo trì <i className='fa fa-spin fa-lg fa-cog' /></span>}

                                        {/* <div>hoặc chuyển khoản trực tiếp theo <a href={T.url(`${T.cdnDomain}/sample/BIDV-2023-new.pdf`)} target='_blank' rel='noopener noreferrer'>HƯỚNG DẪN</a></div> */}
                                    </div>

                                </div>

                            </div>
                            <div className='col-md-6 card'>
                                <div className='card-body'>
                                    <h4 className='tile-thanhtoan m-2 mb-3'>Cách 2: Thanh toán qua ứng dụng ngân hàng</h4>
                                    <p>1. Hướng dẫn thanh toán qua ngân hàng <b>Vietcombank</b> (<a target='_blank' rel='noopener noreferrer' href={T.url(`${T.cdnDomain}/sample/VCB-2023.pdf`)}>
                                        <i className='fa fa-fw fa-lg fa-download' />đính kèm file
                                    </a>)</p>
                                    <div style={{
                                        margin: '0 2px'
                                    }}></div>
                                    <p style={this.state.banks?.BIDV?.kichHoat == 0 ? { textDecoration: 'line-through' } : {}}>2. Hướng dẫn thanh toán qua ngân hàng <b>BIDV</b> (<a disabled={this.state.banks?.BIDV?.kichHoat == 0} href={T.url(`${T.cdnDomain}/sample/BIDV-2023-new.pdf`)} target='_blank' rel='noopener noreferrer'>
                                        <i className='fa fa-fw fa-lg fa-download' /> đính kèm file</a>)</p>
                                </div>

                            </div>
                        </div>
                    </div>}
                </div>
            </React.Fragment>
        )
            ;
    }
}