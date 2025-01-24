import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, FormSelect, renderDataTable, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { getGvLichGiangDayPage } from './redux';
import { gvLichGiangDayBaoBuDelete } from 'modules/mdGiangVien/gvLichGiangDay/redux';
import BaoBuModal from './BaoBuModal';
import { Tooltip } from '@mui/material';


class GvLichGiangDayPage extends AdminPage {
    state = { lichNghiBu: [], filter: {} }
    componentDidMount() {
        T.ready('/user/affair', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                T.alert('Đang load dữ liệu', 'info', false, null, true);
                this.props.getGvLichGiangDayPage({ hocKy, namHoc }, lichNghiBu => {
                    this.setState({ filter: { hocKy, namHoc }, lichNghiBu }, () => T.alert('Load dữ liệu thành công', 'success', true, 5000));
                });
            });
        });
    }

    mapperStatus = {
        0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Đã duyệt', color: 'green' },
        2: { icon: 'fa fa-lg fa-ban', text: 'Từ chối', color: 'red' },
    }

    handleChange = (key, value) => {
        const { filter } = this.state;
        filter[key] = value;
        T.alert('Đang load dữ liệu', 'info', false, null, true);
        this.props.getGvLichGiangDayPage(filter, lichNghiBu => {
            this.setState({ filter, lichNghiBu }, () => T.alert('Load dữ liệu thành công', 'success', true, 5000));
        });
    }

    getData = (done) => {
        this.props.getGvLichGiangDayPage(this.state.filter, lichNghiBu => {
            this.setState({ lichNghiBu }, () => done && done());
        });
    }

    handleDeleteTuan = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa lịch bù này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa lịch bù. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.gvLichGiangDayBaoBuDelete(item.idTuan, () => {
                    this.getData(() => T.alert('Xóa lịch bù thành công', 'success', false, 500));
                });
            }
        });
    }

    border = '1px solid #d0d3d6'

    table = (list) => renderDataTable({
        data: list,
        emptyTable: 'Chưa có lịch nghỉ bù',
        header: 'thead-light',
        stickyHead: list && list.length > 14,
        renderHead: () => (<>
            <tr>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>#</th>
                <th rowSpan='2' style={{ width: '30%', border: this.border }}>Mã học phần</th>
                <th rowSpan='2' style={{ width: '70%', border: this.border }}>Tên môn học</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lớp</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>SLSV</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Giảng viên</th>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>Thứ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th colSpan='4' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>NGHỈ</th>
                <th colSpan='6' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>THÔNG TIN DẠY BÙ</th>
            </tr>
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ngày nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lý do nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Người báo nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Thời gian báo nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ngày bù</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ghi chú</th>
            </tr>
        </>
        ),
        renderRow: (item, index) => {
            const rows = [];
            const { dataNghi, dataBu } = item;

            if (!dataNghi.length) {
                rows.push(<tr>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} />
                    <TableCell style={{ textAlign: 'center' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                </tr>);
            } else {
                const rowSpan = dataNghi.reduce((acc, cur) => acc + (dataBu.filter(i => i.idNgayNghi == cur.idTuan).length || 1), 0);

                dataNghi.forEach((nghi, nIdx) => {
                    const listBu = dataBu.filter(i => i.idNgayNghi == nghi.idTuan);
                    if (!listBu.length) {
                        if (nIdx == 0) {
                            rows.push(<tr>
                                <TableCell style={{ textAlign: 'center' }} content={index + 1} rowSpan={rowSpan} />
                                <TableCell content={item.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ textAlign: 'center' }} content={item.siSo} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} rowSpan={rowSpan} />
                                <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} rowSpan={rowSpan} />
                                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} rowSpan={rowSpan} />
                                <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                                <TableCell content={nghi.ghiChu} />
                                <TableCell content={nghi.nguoiBaoNghi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} />
                            </tr>);
                        } else {
                            rows.push(<tr>
                                <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                                <TableCell content={nghi.ghiChu} />
                                <TableCell content={nghi.nguoiBaoNghi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} />
                            </tr>);
                        }
                    } else {
                        listBu.forEach((bu, bIdx) => {
                            const icon = this.mapperStatus[bu.status].icon,
                                text = this.mapperStatus[bu.status].text,
                                color = this.mapperStatus[bu.status].color;

                            if (bIdx == 0 && nIdx == 0) {
                                rows.push(<tr>
                                    <TableCell style={{ textAlign: 'center' }} content={index + 1} rowSpan={rowSpan} />
                                    <TableCell content={item.maHocPhan} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center' }} content={item.siSo} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} rowSpan={rowSpan} />
                                    <TableCell content={item.phong} rowSpan={rowSpan} />
                                    <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} rowSpan={listBu.length} />
                                    <TableCell content={nghi.ghiChu} rowSpan={listBu.length} />
                                    <TableCell content={nghi.nguoiBaoNghi} rowSpan={listBu.length} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} rowSpan={listBu.length} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(bu.ngayHoc), 'dd/mm/yyyy')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={bu.thu == 8 ? 'CN' : bu.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${bu.tietBatDau} - ${Number(bu.tietBatDau) + Number(bu.soTietBuoi) - 1}`} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={bu.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                    <TableCell content={bu.ghiChu} />
                                </tr>);
                            } else if (bIdx == 0) {
                                rows.push(<tr>
                                    <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} rowSpan={listBu.length} />
                                    <TableCell content={nghi.ghiChu} rowSpan={listBu.length} />
                                    <TableCell content={nghi.nguoiBaoNghi} rowSpan={listBu.length} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} rowSpan={listBu.length} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(bu.ngayHoc), 'dd/mm/yyyy')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={bu.thu == 8 ? 'CN' : bu.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${bu.tietBatDau} - ${Number(bu.tietBatDau) + Number(bu.soTietBuoi) - 1}`} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={bu.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                    <TableCell content={bu.ghiChu} />
                                </tr>);
                            } else {
                                rows.push(<tr>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(bu.ngayHoc), 'dd/mm/yyyy')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={bu.thu == 8 ? 'CN' : bu.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${bu.tietBatDau} - ${Number(bu.tietBatDau) + Number(bu.soTietBuoi) - 1}`} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={bu.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                    <TableCell content={bu.ghiChu} />
                                </tr>);
                            }
                        });
                    }
                });
            }
            return rows;
        }
    });

    tableNghi = (list) => renderDataTable({
        data: list,
        emptyTable: 'Chưa có lịch nghỉ bù',
        header: 'thead-light',
        stickyHead: list && list.length > 14,
        renderHead: () => (<>
            <tr>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>#</th>
                <th rowSpan='2' style={{ width: '30%', border: this.border }}>Mã học phần</th>
                <th rowSpan='2' style={{ width: '70%', border: this.border }}>Tên môn học</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lớp</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>SLSV</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Giảng viên</th>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>Thứ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th colSpan='4' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>NGHỈ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', display: this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test') ? '' : 'none' }}>Thao tác</th>
            </tr>
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ngày nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lý do nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Người báo nghỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Thời gian báo nghỉ</th>
            </tr>
        </>
        ),
        renderRow: (item, index) => {
            const rows = [],
                { dataNghi } = item,
                isTest = this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test');

            if (!dataNghi.length) {
                rows.push(<tr>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} />
                    <TableCell style={{ textAlign: 'center' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                </tr>);
            } else {
                dataNghi.forEach((nghi, nIdx) => {
                    if (nIdx == 0) {
                        rows.push(<tr>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} rowSpan={dataNghi.length} />
                            <TableCell content={item.maHocPhan} rowSpan={dataNghi.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={dataNghi.length} />
                            <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} rowSpan={dataNghi.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.siSo} rowSpan={dataNghi.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} rowSpan={dataNghi.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} rowSpan={dataNghi.length} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} rowSpan={dataNghi.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} rowSpan={dataNghi.length} />
                            <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell content={nghi.ghiChu} />
                            <TableCell content={nghi.nguoiBaoNghi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest ? '' : 'none' }} content={item}>
                                <Tooltip title='Báo bù tuần học' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, nghi, isEdit: false })}>
                                        <i className='fa fa-lg fa-retweet' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    } else {
                        rows.push(<tr>
                            <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell content={nghi.ghiChu} />
                            <TableCell content={nghi.nguoiBaoNghi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest ? '' : 'none' }} content={item}>
                                <Tooltip title='Báo bù tuần học' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, nghi, isEdit: false })}>
                                        <i className='fa fa-lg fa-retweet' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    }
                });
            }
            return rows;
        }
    });

    tableBu = (list) => renderDataTable({
        data: list,
        emptyTable: 'Chưa có lịch nghỉ bù',
        header: 'thead-light',
        stickyHead: list && list.length > 14,
        renderHead: () => (<>
            <tr>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>#</th>
                <th rowSpan='2' style={{ width: '30%', border: this.border }}>Mã học phần</th>
                <th rowSpan='2' style={{ width: '70%', border: this.border }}>Tên môn học</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lớp</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>SLSV</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Giảng viên</th>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>Thứ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th colSpan='6' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>THÔNG TIN DẠY BÙ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', display: this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test') ? '' : 'none' }}>Thao tác</th>
            </tr>
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ngày bù</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ghi chú khác</th>
            </tr>
        </>
        ),
        renderRow: (item, index) => {
            const rows = [],
                { dataBu } = item,
                isTest = this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test');

            if (!dataBu.length) {
                rows.push(<tr>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} />
                    <TableCell style={{ textAlign: 'center' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                </tr>);
            } else {
                dataBu.forEach((bu, bIdx) => {
                    const icon = this.mapperStatus[bu.status].icon,
                        text = this.mapperStatus[bu.status].text,
                        color = this.mapperStatus[bu.status].color;

                    if (bIdx == 0) {
                        rows.push(<tr>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} rowSpan={dataBu.length} />
                            <TableCell content={item.maHocPhan} rowSpan={dataBu.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={dataBu.length} />
                            <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} rowSpan={dataBu.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.siSo} rowSpan={dataBu.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} rowSpan={dataBu.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} rowSpan={dataBu.length} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} rowSpan={dataBu.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} rowSpan={dataBu.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(bu.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={bu.thu == 8 ? 'CN' : bu.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={`${bu.tietBatDau} - ${Number(bu.tietBatDau) + Number(bu.soTietBuoi) - 1}`} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={bu.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                            <TableCell content={bu.ghiChu} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest && !Number(bu.status) ? '' : 'none' }} content={item}>
                                <Tooltip title='Cập nhật lịch bù' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, bu, isEdit: true })}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Xóa lịch bù' arrow>
                                    <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.handleDeleteTuan(bu)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    } else {
                        rows.push(<tr>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(bu.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={bu.thu == 8 ? 'CN' : bu.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={`${bu.tietBatDau} - ${Number(bu.tietBatDau) + Number(bu.soTietBuoi) - 1}`} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={bu.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                            <TableCell content={bu.ghiChu} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest && !Number(bu.status) ? '' : 'none' }} content={item}>
                                <Tooltip title='Cập nhật lịch bù' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, bu, isEdit: true })}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Xóa lịch bù' arrow>
                                    <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.handleDeleteTuan(bu)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    }
                });
            }
            return rows;
        }
    });

    tableVang = (list) => renderDataTable({
        data: list,
        emptyTable: 'Chưa có lịch vắng',
        header: 'thead-light',
        stickyHead: list && list.length > 14,
        renderHead: () => (<>
            <tr>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>#</th>
                <th rowSpan='2' style={{ width: '30%', border: this.border }}>Mã học phần</th>
                <th rowSpan='2' style={{ width: '70%', border: this.border }}>Tên môn học</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Lớp</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>SLSV</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Giảng viên</th>
                <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', border: this.border }}>Thứ</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>Tiết</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Phòng</th>
                <th colSpan='4' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: this.border }}>VẮNG</th>
                <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', display: this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test') ? '' : 'none' }}>Thao tác</th>
            </tr>
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ngày vắng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Người báo vắng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Thời gian ghi nhận</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', border: this.border }}>Ghi chú</th>
            </tr>
        </>
        ),
        renderRow: (item, index) => {
            const rows = [],
                { dataVang } = item,
                isTest = this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test');

            if (!dataVang.length) {
                rows.push(<tr>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} />
                    <TableCell style={{ textAlign: 'center' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                </tr>);
            } else {
                dataVang.forEach((nghi, nIdx) => {
                    if (nIdx == 0) {
                        rows.push(<tr>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} rowSpan={dataVang.length} />
                            <TableCell content={item.maHocPhan} rowSpan={dataVang.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={dataVang.length} />
                            <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.maLop} rowSpan={dataVang.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.siSo} rowSpan={dataVang.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} rowSpan={dataVang.length} />
                            <TableCell style={{ textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} rowSpan={dataVang.length} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tietBatDau && item.soTietBuoi ? `${item.tietBatDau} - ${Number(item.tietBatDau) + Number(item.soTietBuoi) - 1}` : ''} rowSpan={dataVang.length} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} rowSpan={dataVang.length} />
                            <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{nghi.donVi ? <span className='text-primary'>{nghi.donVi} < br /> </span> : ''} {nghi.nguoiBaoVang}</>} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoVang))} />
                            <TableCell content={nghi.ghiChu} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest ? '' : 'none' }} content={item}>
                                <Tooltip title='Báo bù tuần học' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, nghi, isEdit: false })}>
                                        <i className='fa fa-lg fa-retweet' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    } else {
                        rows.push(<tr>
                            <TableCell content={T.dateToText(Number(nghi.ngayHoc), 'dd/mm/yyyy')} />
                            <TableCell content={nghi.ghiChu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{nghi.donVi ? <span className='text-primary'>{nghi.donVi} < br /> </span> : ''} {nghi.nguoiBaoVang}</>} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(nghi.thoiGianBaoNghi))} />
                            <TableCell type='buttons' style={{ textAlign: 'center', display: isTest ? '' : 'none' }} content={item}>
                                <Tooltip title='Báo bù tuần học' arrow>
                                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, nghi, isEdit: false })}>
                                        <i className='fa fa-lg fa-retweet' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>);
                    }
                });
            }
            return rows;
        }
    });

    render() {
        const { lichNghiBu } = this.state;

        return this.renderPage({
            title: 'Lịch nghỉ bù',
            icon: 'fa fa-bookmark',
            breadcrumb: [
                <Link key={0} to='/user/affair'>Giảng viên</Link>,
                'Lịch nghỉ - bù'
            ],
            content: <>
                <BaoBuModal ref={e => this.baoBuModal = e} baoBu={this.getData} />
                <div className='tile row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={e => this.handleChange('namHoc', e.id)} />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={e => this.handleChange('hocKy', e.id)} />
                    <div className='col-md-12'>
                        <FormTabs tabs={[
                            { title: 'Lịch nghỉ - bù', component: <>{this.table(lichNghiBu)}</> },
                            { title: 'Lịch nghỉ', component: <>{this.tableNghi(lichNghiBu)}</> },
                            { title: 'Lịch bù', component: <>{this.tableBu(lichNghiBu)}</> },
                            { title: 'Lịch vắng', component: <>{this.tableVang(lichNghiBu)}</> }
                        ]} />
                    </div>
                </div>
            </>,
            backRoute: '/user/affair',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings, getGvLichGiangDayPage, gvLichGiangDayBaoBuDelete };
export default connect(mapStateToProps, mapActionsToProps)(GvLichGiangDayPage);