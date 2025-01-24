import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getDetailHocPhi, vnPayGoToTransaction, getSubDetailHocPhi } from './redux';
import { Tooltip } from '@mui/material';
import { ThanhToanModal } from './component/ThanhToanModal';
// import { HuongDanAgriModal } from './component/HuongDanAgriModal';
import { HuongDanVcbModal } from './component/HuongDanVcbModal';
import QR_Modal from './component/QrModal';
import { SubDetail } from './component/SubDetailModal';
import { Img } from 'view/component/HomePage';

export class UserHocPhi extends AdminPage {
    state = {}
    componentDidMount() {
        const query = new URLSearchParams(this.props.location.search);
        if (query) {
            const vnp_TransactionStatus = query.get('vnp_TransactionStatus');
            if (vnp_TransactionStatus) {
                vnp_TransactionStatus == '00' ? T.alert('Thanh toán thành công', 'success', false) : T.alert('Thanh toán thất bại', 'error', false);
                window.history.pushState('', '', '/user/hoc-phi');
            }
        }
        T.ready('/user/hoc-phi', () => {
            this.props.getDetailHocPhi(this.initData);
        });
    }
    initData = (result) => {
        this.setState({
            hocPhiDetail: result?.hocPhiDetail?.filter(cur => !result?.hocPhiDetail?.find(item => item.tamThu == cur.idLoaiPhi)),
            hocPhiTong: result?.hocPhiTong,
            soDuHocPhi: result?.soDuHocPhi,
            ngayBatDau: result?.hocPhiDetail?.find(item => item.isHocPhi == 1)?.ngayBatDau || '',
            ngayKetThuc: result?.hocPhiDetail?.find(item => item.isHocPhi == 1)?.ngayKetThuc || '',
            namTuyenSinh: result?.namTuyenSinh,
            gioiHan: result?.gioiHan,
            mienGiam: result?.mienGiam,
            listDataMonHoc: result?.listMonHoc,
            noiDungLuuY: result?.noiDungLuuY
        });
    }

    openQrModal = (path) => {
        this.qrModal.show(path);
        this.thanhToanModal.hide();
    }

    roundToTwo = (num) => {
        return +(Math.round(num + 'e+2') + 'e-2');
    }

    renderTableHocPhi = (data, namHoc, hocKy) => {
        const objRender = {
            '2': {
                color: 'red',
                content: 'Đã hủy'
            },
            '3': {
                color: 'green',
                content: 'Bổ sung'
            }
        };
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        return renderTable({
            getDataSource: () => (data.filter(item => item.active == 1 && !(item.isHocPhi && item.hocPhiChinh && item.namHocPhatSinh == namHoc && item.hocKyPhatSinh == hocKy) || item.status)).sort((a, b) => a.status - b.status) || [],
            emptyTable: 'Chưa có dữ liệu học phí!',
            renderHead: () => (<tr>
                <th style={style()}>STT</th>
                <th style={style('100%')}>Khoản thu</th>
                <th style={style('auto')}>Số tín chỉ</th>
                <th style={style('auto')}>Số tiết</th>
                <th style={style('auto')}>Đơn giá (VNĐ)</th>
                <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>
                <th style={style('auto', 'center')}>Ngày đăng ký</th>
                <th style={style('auto', 'center')}>Tình trạng</th>
            </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ padding: item.status == 3 ? '4px' : '' }}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        {
                            (item.status == 3 || item.status == 2) ?
                                <TableCell style={{ textAlign: 'left', position: 'relative', padding: '0.8rem' }} content={
                                    <div>
                                        <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '0.7rem', ...objRender[item.status], fontStyle: 'italic' }}>*{`${objRender[item.status].content}`}</span>
                                        <span style={{ position: 'relative', bottom: '-5px' }}>&nbsp;&nbsp;{item.status ? `${item.maHocPhan ? `${item.maHocPhan}: ` : ''} ${T.parse(item.tenLoaiPhi, { vi: '' }).vi} ${item.loaiDangKy ? `(${item.loaiDangKy})` : ''}` : item.tenLoaiPhi}</span>
                                    </div>
                                }>

                                </TableCell>
                                :
                                <TableCell style={{ textAlign: 'left', position: 'relative', padding: '0.6rem' }} content={
                                    <div>
                                        {/* <span style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '0.6rem' }}>&nbsp;&nbsp;&nbsp;</span> */}
                                        <span style={{ marginTop: '1.0rem' }}>&nbsp;&nbsp;{item.status ? `${item.maHocPhan ? `${item.maHocPhan}: ` : ''} ${T.parse(item.tenLoaiPhi, { vi: '' }).vi} ${item.loaiDangKy ? `(${item.loaiDangKy})` : ''}` : item.tenLoaiPhi}</span>
                                    </div>
                                }>

                                </TableCell>
                        }
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongSoTiet} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi && item.soTien ? T.numberDisplay(this.roundToTwo(parseInt(item.soTien) / parseInt(item.tongTinChi))) : ''} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap', color: item.soTien != null ? '' : 'green' }} type={item.soTien != null ? 'number' : 'text'} content={item.soTien != null ? item.soTien : 'Chưa được định phí'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.thoiGianDangKy ? T.dateToText(item.thoiGianDangKy, 'dd/mm/yyyy') : ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', color: item.tinhTrangDong ? 'green' : 'red' }} type='text' content={item.tinhTrangDong ? 'Đã nộp' : 'Chưa nộp'} />
                    </tr>
                );
            }
        });
    }

    renderUpdating = () => {
        return (
            <div>
                <b>Đang cập nhật học phí cho sinh viên</b>
            </div>
        );
    }
    renderIsNullHocPhi = () => {
        return (
            <div className='tile'>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div>
                        <h3> <i className='fa fa-hourglass-start' aria-hidden='true'></i> Đang cập nhật học phí cho sinh viên ...</h3>
                    </div>
                </div>
            </div>

        );
    }

    onShowAgri = () => {
        this.thanhToanModal.hide();
        this.huongDanAgriModal.show();
    }

    onShowVcb = () => {
        this.thanhToanModal.hide();
        this.huongDanVcbModal.show();
    }

    onShowThanhToan = () => {
        this.thanhToanModal.show();
        this.huongDanAgriModal.hide();
        this.huongDanVcbModal.hide();
    }

    toBack = () => {
        // T.post('/api/sv/hoc-phi/qr-vcb');
        window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    renderSection = (hocPhiTongAll) => {
        let counter = hocPhiTongAll.length;
        const dataNamHoc = hocPhiTongAll.groupBy('namHoc');
        const mienGiamTong = this.state?.mienGiam.reduce((total, item) => total + item.soTienMienGiam, 0);
        const soDuHocPhi = this.state?.soDuHocPhi || 0;

        const tongCongNo = (hocPhiDetail) => {
            return hocPhiDetail.reduce((total, item) => {
                if (item.isHocPhi == 1) {
                    return total + (item.soTien - item.daDong);
                } else {
                    return total;
                }
            }, 0);
        };
        const tongHocPhi = (hocPhiDetail) => {
            return hocPhiDetail.reduce((total, item) => {
                if (item.isHocPhi == 1) {
                    return total + item.soTien;
                } else {
                    return total;
                }
            }, 0);
        };
        const tongDaDong = (hocPhiDetail) => {
            return hocPhiDetail.reduce((total, item) => {
                if (item.isHocPhi == 1) {
                    return total + item.daDong;
                } else {
                    return total;
                }
            }, 0);
        };
        const tongLoaiPhiKhac = (hocPhiDetail) => {
            return hocPhiDetail.reduce((total, item) => {
                if (item.isHocPhi == 0) {
                    return total + item.daDong;
                } else {
                    return total;
                }
            }, 0);
        };
        const dataTong = this.state.hocPhiDetail.filter(item => item.active == 1);
        if (hocPhiTongAll.length) {
            const namHocKeys = Object.keys(dataNamHoc);
            return ([
                <React.Fragment key={'HocPhi'}>{namHocKeys.sort((a, b) => b - a).map(key => {
                    const dataHocKy = dataNamHoc[key].groupBy('hocKy');
                    return Object.keys(dataHocKy).sort((a, b) => b - a).map(keyHocKy => {
                        counter--;
                        const newDate = Date.now();
                        const { namHoc, hocKy } = dataHocKy[keyHocKy][0];
                        const ngayBatDau = this.state.hocPhiDetail.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)?.find(cur => cur.isHocPhi == 1)?.ngayBatDau || '';
                        const ngayKetThuc = this.state.hocPhiDetail.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)?.find(cur => cur.isHocPhi == 1)?.ngayKetThuc || '';
                        const listMienGiam = this.state?.mienGiam.filter(item => item.hocKy == hocKy && item.namHoc == namHoc);
                        const mienGiam = listMienGiam.reduce((total, cur) => total + cur.soTienMienGiam, 0);
                        const listData = this.state.hocPhiDetail.filter(item => item.namHoc == namHoc && item.hocKy == hocKy && item.active == 1);

                        return (
                            <div className='tile' key={`${namHoc}_${hocKy}_${key}`}>
                                <div data-toggle='collapse' data-target={`#collapseOne-${namHoc}_${hocKy}`} aria-expanded='true' aria-controls={`collapseOne-${namHoc}_${hocKy}`} className='tile-title collapsed' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ color: '#0139a6', fontWeight: 700 }}>Năm học {namHoc}-{Number(namHoc) + 1} - Học kỳ {hocKy}</div>
                                    {counter != hocPhiTongAll.length - 1 && <i className='fa fa-chevron-down' aria-hidden='true'></i>}
                                </div>
                                <div id={counter != hocPhiTongAll.length - 1 ? `collapseOne-${namHoc}_${hocKy}` : ''} className={counter != hocPhiTongAll.length - 1 ? 'collapse' : ''} style={{ marginBottom: '40px' }}>

                                    <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                                    {newDate >= ngayBatDau && this.renderTableHocPhi([...this.state.hocPhiDetail.filter(item => item.namHoc == namHoc && item.hocKy == hocKy), ...this.state?.listDataMonHoc.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)], namHoc, hocKy)}
                                    <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                                    <div className='tile-body'>
                                        <div className='row '>
                                            <div className='col-md-12 d-flex justify-content-between'>
                                                <div className=''>
                                                    <div>
                                                        <div>Miễn/giảm: <b>{T.numberDisplay(Number(mienGiam))} VNĐ</b> </div>
                                                        <div>{ngayBatDau && ngayKetThuc ? `Thời gian thu học phí: ${T.dateToText(new Date(ngayBatDau), 'HH:MM:ss dd/mm/yyyy')} - ${T.dateToText(new Date(ngayKetThuc), 'HH:MM:ss dd/mm/yyyy')}` : ''}</div>
                                                    </div>
                                                </div>
                                                <div className=''>
                                                    <table className='table-responsive'>
                                                        <tbody>
                                                            {tongLoaiPhiKhac(listData) ? <tr>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>BHYT/KSK/Tạm thu đã nộp</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongLoaiPhiKhac(listData)))} VNĐ</b></div></td>
                                                            </tr> : <></>}
                                                            <tr>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Học phí phải nộp</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongHocPhi(listData)))} VNĐ </b></div></td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Học phí đã nộp</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongDaDong(listData)))} VNĐ </b></div></td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>
                                                                    {tongHocPhi(listData) >= (tongDaDong(listData) + mienGiam) ?
                                                                        <div>Học phí chưa nộp </div>
                                                                        :
                                                                        <div>Học phí nộp dư </div>
                                                                    }
                                                                </td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>
                                                                    {tongHocPhi(listData) >= (tongDaDong(listData) + mienGiam) ?
                                                                        <div><b>{T.numberDisplay(Number(tongCongNo(listData) - mienGiam))} VNĐ </b></div>
                                                                        :
                                                                        <div><b>{T.numberDisplay(Number(tongCongNo(listData) - mienGiam) * (-1))} VNĐ </b></div>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div >
                                <ThanhToanModal ref={e => this.thanhToanModal = e} vnPayGoToTransaction={this.props.vnPayGoToTransaction} openQrModal={this.openQrModal} huongDanAgri={this.onShowAgri} huongDanVcb={this.onShowVcb} namTuyenSinh={this.state.namTuyenSinh} />
                                <SubDetail ref={e => this.subDetail = e} getSubDetailHocPhi={this.props.getSubDetailHocPhi} />
                            </div >
                        );
                    });
                })}</React.Fragment>,
                <React.Fragment key={'Payment'}>
                    <div className='tile' >
                        <div className='row'>
                            <div className='col-md-6 col-sm-12' style={{ color: 'red' }} dangerouslySetInnerHTML={{
                                __html: this.state.noiDungLuuY
                            }} >

                            </div>

                            <div className='col-md-6 col-sm-12' >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <i style={{ fontSize: '16px' }}></i>

                                    <div style={{}}>
                                        <table className='table-responsive'>
                                            <tbody style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto', fontSize: '1.0rem' }}>
                                                {
                                                    tongLoaiPhiKhac(dataTong) ? <tr style={{ color: 'red' }} >
                                                        <td >BHYT/KSK/GDQP/Tạm thu đã nộp</td>
                                                        <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                        <td ><div><b>{T.numberDisplay(Number(tongLoaiPhiKhac(dataTong)))} VNĐ</b></div></td>
                                                    </tr> : <></>
                                                }
                                                <tr>
                                                    <td>
                                                        Tổng học phí phải nộp
                                                    </td>
                                                    <td style={{ padding: '0 20px 0 4px' }}>
                                                        :
                                                    </td>
                                                    <td>
                                                        <b>{T.numberDisplay(tongHocPhi(dataTong))} VNĐ </b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Học phí đã nộp
                                                    </td>
                                                    <td style={{ padding: '0 20px 0 4px' }}>
                                                        :
                                                    </td>
                                                    <td>
                                                        <b> {T.numberDisplay(tongDaDong(dataTong) + parseInt(soDuHocPhi))} VNĐ </b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Học phí được miễn/giảm</td>
                                                    <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                    <td><b> {T.numberDisplay(mienGiamTong)} VNĐ </b></td>
                                                </tr>
                                                {
                                                    tongHocPhi(dataTong) >= (tongDaDong(dataTong) + mienGiamTong) && !soDuHocPhi ?
                                                        <tr style={{ color: 'red' }}>
                                                            <td> <b>Học phí chưa nộp</b></td>
                                                            <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                            <td><b>{T.numberDisplay(tongCongNo(dataTong) - mienGiamTong)} VNĐ </b></td>
                                                        </tr>
                                                        :
                                                        <tr>
                                                            <td>Học phí nộp dư</td>
                                                            <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                            <td><b> {T.numberDisplay((tongCongNo(dataTong) - mienGiamTong) * (-1) + parseInt(soDuHocPhi))} VNĐ </b></td>
                                                        </tr>
                                                }
                                            </tbody>
                                        </table>
                                        <br />
                                        <div>
                                            <Tooltip title='Thanh toán' arrow>
                                                <span>
                                                    <button id='btn-thanh-toan' className='btn btn-primary' style={{ width: '100%' }} onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                                                        Thanh toán
                                                    </button>
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> </React.Fragment>]);
        }
    }
    render() {
        return this.renderPage({
            title: 'Học Phí Sinh Viên',
            icon: 'fa fa-object-group',
            breadcrumb: ['Học Phí'],
            content:
                this.state.hocPhiTong ? <>
                    <div className='tile'>
                        <Img src='/img/headerHocPhi.png' style={{ maxWidth: '100%', marginRight: 20 }} ></Img>

                        {this.renderSection(this.state.hocPhiTong)}
                    </div>
                    {/* <HuongDanAgriModal ref={e => this.huongDanAgriModal = e} thanhToanModal={this.onShowThanhToan} /> */}
                    <HuongDanVcbModal ref={e => this.huongDanVcbModal = e} thanhToanModal={this.onShowThanhToan} />
                    <QR_Modal ref={e => this.qrModal = e} title='Thanh toán qua QR - VCB' />
                </> : this.renderIsNullHocPhi(),
            buttons: [{ className: 'btn-secondary', icon: 'fa fa-angle-double-down', tooltip: 'Đến phần thanh toán', onClick: (e) => e.preventDefault() || this.toBack() },
            { className: 'btn-warning', icon: 'fa-history', tooltip: 'Lịch sử giao dịch', onClick: (e) => e.preventDefault() || this.props.history.push('/user/hoc-phi/invoice') }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svHocPhi: state.student.svHocPhi });
const mapActionsToProps = { getDetailHocPhi, vnPayGoToTransaction, getSubDetailHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(UserHocPhi);
