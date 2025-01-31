import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, getValue, FormSelect } from 'view/component/AdminPage';
import { getThoiKhoaBieu } from './redux';
import { SelectAdapter_HocKy } from './redux';
import { Tooltip } from '@mui/material';

class UserPage extends AdminPage {
    state = { listTKB: [] }

    componentDidMount() {
        T.ready('/user/thoi-khoa-bieu', () => {
            this.genDataNamHoc();
        });
    }

    genDataNamHoc = () => {
        try {
            let nam = parseInt(this.props.system.user.data.khoaSV);
            const currYear = new Date().getFullYear();
            this.setState({ namHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1}`) });
        } catch (error) {
            T.notify('Không tìm thấy khoá học của sinh viên', 'danger');
            console.error(error);
        }

    }

    renderTiet = (tuan) => {
        let { tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc } = tuan;
        let tietKetThuc = tietBatDau + soTietBuoi - 1;
        const dataTiet = tietBatDau == tietKetThuc ? tietBatDau : `${tietBatDau} - ${tietKetThuc}`;
        return `Tiết: ${dataTiet} (${thoiGianBatDau} - ${thoiGianKetThuc})`;
    }

    mapperTiet = (item) => {
        if (item.isNgayLe) return `Nghỉ lễ: ${item.tenNgayLe}`;
        else if (item.isNghi) return `Giảng viên báo nghỉ: ${item.ghiChu}`;
        else return this.renderTiet(item);
    }

    timKiem = () => {
        let namHoc = getValue(this.khoaSinhVien);
        let hocKy = getValue(this.hocKyFilter);
        this.setState({ namHoc, hocKy });
        if (namHoc && hocKy) {
            T.alert('Đang load dữ liệu', 'info', false, null, true);
            this.props.getThoiKhoaBieu({ hocKy, namHoc }, data => {
                this.setState({ filter: { namHoc, hocKy }, listTKB: data.items, listDataTuanHoc: Object.keys(data.dataTuan || []).length ? data.dataTuan : [] }, () => T.alert('Load dữ liệu thành công', 'success', true, 5000));
            });
        } else {
            T.notify('Vui lòng chọn năm học và học kỳ!', 'danger');
        }
    }

    render() {
        const { namHoc, hocKy, listTKB, isCheckTuanHoc, listDataTuanHoc } = this.state;

        let table = (list) => renderTable({
            getDataSource: () => Object.keys((list).groupBy('maHocPhan')),
            emptyTable: (namHoc && hocKy) ? `Không tìm thấy thời khóa biểu cho HK${hocKy}, năm học ${namHoc}` : '',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>TC</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Tổng tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}></th>
            </tr>),
            renderRow: (item, index) => {
                const rows = [];
                let listHocPhan = (list || []).groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = listHocPhan[i];
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#ffffff' }}>
                                    <TableCell content={index + 1} rowSpan={rowSpan} />
                                    <TableCell content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                    <TableCell content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ textAlign: 'center' }} content={T.convertDate(hocPhan.ngayBatDau, 'DD/MM/YYYY')} />
                                    <TableCell style={{ textAlign: 'center' }} content={T.convertDate(hocPhan.ngayKetThuc, 'DD/MM/YYYY')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: ' center', color: 'blue', cursor: 'pointer' }} rowSpan={rowSpan} content={
                                        <Tooltip title='Xem chi tiết tuần học' arrow>
                                            <i className='fa fa-lg fa-search' onClick={e => {
                                                e && e.preventDefault();
                                                if (isCheckTuanHoc == item) this.setState({ isCheckTuanHoc: null });
                                                else this.setState({ isCheckTuanHoc: item });
                                            }} />
                                        </Tooltip>
                                    } />
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#ffffff' }}>
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.convertDate(hocPhan.ngayBatDau, 'DD/MM/YYYY')} />
                                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.convertDate(hocPhan.ngayKetThuc, 'DD/MM/YYYY')} />
                                </tr>
                            );
                        }
                    }
                }
                let dataTuan = (listDataTuanHoc || []).filter(i => i.maHocPhan == item);
                rows.push(<tr style={{ display: isCheckTuanHoc == item ? '' : 'none' }}>
                    <td colSpan={13}>
                        {
                            renderTable({
                                getDataSource: () => dataTuan,
                                emptyTable: 'Chưa có thông tin tuần học!',
                                header: 'thead-light',
                                stickyHead: dataTuan.length > 15,
                                renderHead: () => <tr>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                    <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Tuần</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày học</th>
                                    <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Thứ</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cơ sở</th>
                                    <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Phòng</th>
                                    <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Tiết học</th>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Giảng viên</th>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                                </tr>,
                                renderRow: (item, index) => {
                                    return (<tr key={item.maHocPhan + index}>
                                        <TableCell content={index + 1} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={new Date(item.ngayHoc).getWeek()} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.convertDate(item.ngayHoc, 'DD/MM/YYYY')} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.coSo} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                                        <TableCell content={this.mapperTiet(item)} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenGiangVien && item.dataTenGiangVien.length ? item.dataTenGiangVien.split(',').map((gv, i) => <div key={i}>{gv}</div>) : ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenTroGiang && item.dataTenTroGiang.length ? item.dataTenTroGiang.split(',').map((tg, i) => <div key={i}>{tg}</div>) : ''} />
                                    </tr>);
                                }
                            })
                        }
                    </td>
                </tr>
                );
                return rows;
            }
        });

        return this.renderPage({
            title: 'Thời khóa biểu',
            icon: 'fa fa-calendar-check-o',
            breadcrumb: ['Thời khóa biểu'],
            content: <div className='tile row'>
                <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-6' label='Năm học' data={this.state.namHoc || []} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_HocKy} />
                <div style={{ marginLeft: 'auto', marginRight: '1%' }} >
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.timKiem()}>
                        <i className='fa fa-fw fa-lg fa-search' /> Tìm kiếm
                    </button>
                </div>
                <div style={{ marginLeft: '10px', display: listTKB.length ? '' : 'none' }} >
                    <button className='btn btn-warning' onClick={e => e.preventDefault() || T.handleDownload(`/api/sv/thoi-khoa-bieu/export?filter=${T.stringify(this.state.filter)}`, 'ketQuaDangKyMonHoc.pdf')}>
                        <i className='fa fa-fw fa-lg fa-download' /> In kết quả đăng ký
                    </button>
                </div>
                <div className='col-md-12' style={{ marginTop: '2%', display: listTKB.length ? '' : 'none' }}>
                    {table(listTKB)}
                </div>
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);