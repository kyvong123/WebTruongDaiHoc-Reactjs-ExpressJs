import React from 'react';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { Img } from 'view/component/HomePage';
import { Tooltip } from '@mui/material';

export class SectionHocPhi extends React.Component {
    roundToTwo = (num) => {
        return +(Math.round(num + 'e+2') + 'e-2');
    }

    render = () => {
        const { data } = this.props;
        const renderTableHocPhi = (data, namHoc, hocKy) => {
            const objRender = {
                '3': {
                    color: 'green',
                    content: 'Bổ sung'
                },
                '2': {
                    color: 'red',
                    content: 'Đã hủy'
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
                                            <span style={{ marginTop: '1.0rem' }}>&nbsp;&nbsp;{item.status ? `${item.maHocPhan ? `${item.maHocPhan}: ` : ''} ${T.parse(item.tenLoaiPhi, { vi: '' }).vi} ${item.loaiDangKy ? `(${item.loaiDangKy})` : ''}` : item.tenLoaiPhi}</span>
                                        </div>
                                    }>

                                    </TableCell>
                            }
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongSoTiet} />
                            <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi && item.soTien ? T.numberDisplay(this.roundToTwo(parseInt(item.soTien) / parseInt(item.tongTinChi))) : ''} />
                            <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap', color: item.soTien != null ? '' : 'green' }} type={item.soTien != null ? 'number' : 'text'} content={item.soTien != null ? item.soTien : 'Chưa định phí'} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.thoiGianDangKy ? T.dateToText(item.thoiGianDangKy, 'dd/mm/yyyy') : ''} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', color: item.tinhTrangDong ? 'green' : 'red' }} type='text' content={item.tinhTrangDong ? 'Đã nộp' : 'Chưa nộp'} />
                        </tr>
                    );
                }
            });
        };
        const infoHocPhi = data?.infoHocPhi || [];
        const infoMienGiam = data?.infoMienGiam || [];
        const infoSoDuHocPhi = data?.infoSoDuHocPhi?.soTien || 0;
        const listDataTong = infoHocPhi.filter(item => item.isTamThu == 0 && item.active == 1);
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
        const mienGiamTong = infoMienGiam.reduce((total, item) => total + item.soTienMienGiam, 0);
        if (infoHocPhi.length) {
            let dataNamHoc = infoHocPhi.groupBy('namHoc');
            const namHocKeys = Object.keys(dataNamHoc);
            let counter = infoHocPhi.length;
            return ([<Img key='img' src='/img/headerHocPhi.png' style={{ maxWidth: '100%', marginRight: 20 }} ></Img>,
            <>{namHocKeys.sort((a, b) => b - a).map(key => {
                const dataHocKy = dataNamHoc[key]?.groupBy('hocKy');
                return Object.keys(dataHocKy).sort((a, b) => b - a).map((hocKy, i) => {
                    counter = counter - 1;
                    const { namHoc } = dataHocKy[hocKy][0];
                    const ngayBatDau = infoHocPhi.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)?.find(cur => cur.isHocPhi == 1)?.ngayBatDau || '';
                    const ngayKetThuc = infoHocPhi.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)?.find(cur => cur.isHocPhi == 1)?.ngayKetThuc || '';
                    const listData = dataHocKy[hocKy].filter(item => item.active == 1);
                    const listDataMienGiam = infoMienGiam.filter(item => item.namHoc == namHoc && item.hocKy == hocKy);
                    const mienGiam = listDataMienGiam.reduce((total, item) => total + item.soTienMienGiam, 0);
                    return (
                        <div className='tile' key={i}>
                            <h4 style={{ margin: '10px 4px ', color: '#0139a6' }}>Năm học {key}-{parseInt(key) + 1} - Học kỳ {hocKy}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                                <i style={{ fontSize: '16px' }}></i>
                            </div>
                            <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                            {renderTableHocPhi([...dataHocKy[hocKy], ...data?.listMonHoc?.filter(item => item.namHoc == namHoc && item.hocKy == hocKy)], namHoc, hocKy)}
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
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>BHYT/KSK/GDQP/Tạm thu đã nộp</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongLoaiPhiKhac(listData)))} VNĐ</b></div></td>
                                                    </tr> : <></>}
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>Học phí phải nộp</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongHocPhi(listData)))} VNĐ </b></div></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>Học phí đã nộp</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(tongDaDong(listData)))} VNĐ </b></div></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>
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
                        </div>

                    );
                });
            })
            }</>,
            <>
                <div className='tile' >
                    <div className='row'>
                        <div className='col-md-6 col-sm-12' style={{ color: 'red' }} dangerouslySetInnerHTML={{
                            __html: data?.noiDungLuuY
                        }} >

                        </div>

                        <div className='col-md-6 col-sm-12' >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <i style={{ fontSize: '16px' }}></i>

                                <div>
                                    <table className='table-responsive'>
                                        <tbody style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto', fontSize: '1.0rem' }}>
                                            {
                                                tongLoaiPhiKhac(listDataTong) ? <tr style={{ color: 'red' }} >
                                                    <td >BHYT/KSK/GDQP/Tạm thu đã nộp</td>
                                                    <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                    <td ><div><b>{T.numberDisplay(Number(tongLoaiPhiKhac(listDataTong)))} VNĐ</b></div></td>
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
                                                    <b>{T.numberDisplay(tongHocPhi(listDataTong))} VNĐ </b>
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
                                                    <b> {T.numberDisplay(tongDaDong(listDataTong) + parseInt(infoSoDuHocPhi))} VNĐ </b>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Học phí được miễn/giảm</td>
                                                <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                <td><b> {T.numberDisplay(mienGiamTong)} VNĐ </b></td>
                                            </tr>
                                            {
                                                tongHocPhi(listDataTong) >= (tongDaDong(listDataTong) + mienGiamTong) && !parseInt(infoSoDuHocPhi) ?
                                                    <tr style={{ color: 'red' }}>
                                                        <td> <b>Học phí chưa nộp</b></td>
                                                        <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                        <td><b>{T.numberDisplay(tongCongNo(listDataTong) - mienGiamTong)} VNĐ </b></td>
                                                    </tr>
                                                    :
                                                    <tr>
                                                        <td>Học phí nộp dư</td>
                                                        <td style={{ padding: '0 20px 0 4px' }}>:</td>
                                                        <td><b>{T.numberDisplay((-1) * (tongCongNo(listDataTong) - mienGiamTong) + parseInt(infoSoDuHocPhi))} VNĐ </b></td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                    <br />
                                    <div>
                                        <Tooltip title='Thanh toán' arrow>
                                            <span>
                                                <button id='btn-thanh-toan' disabled={true} className='btn btn-primary' style={{ width: '100%' }} onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                                                    Thanh toán
                                                </button>
                                            </span>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>]);
        } else {
            return (<>
                <div className='tile'>
                    <h4 style={{ display: 'flex', justifyContent: 'center' }}>Sinh viên không có thông tin học phí</h4>
                </div>
            </>);
        }
    }
}
