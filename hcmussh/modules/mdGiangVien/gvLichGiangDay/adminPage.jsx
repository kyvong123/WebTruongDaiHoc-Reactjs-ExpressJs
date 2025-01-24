import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, getValue } from 'view/component/AdminPage';
import { getGvLichGiangDayPage, getLichGiangDay, downLoadLichDay } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';


class GvLichGiangDayPage extends AdminPage {
    state = { listTkbGv: [], filter: {}, isLoading: true }
    componentDidMount() {
        T.ready('/user/affair', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                T.alert('Đang load dữ liệu', 'info', false, null, true);
                this.props.getLichGiangDay({ hocKy, namHoc }, listLichGiangDay => {
                    this.setState({ filter: { hocKy, namHoc }, listLichGiangDay, isSearch: true }, () => T.alert('Load dữ liệu thành công', 'success', true, 5000));
                });
            });
        });
    }

    timKiem = () => {
        let namHoc = getValue(this.namHoc),
            hocKy = getValue(this.hocKy),
            loaiHinhDaoTao = getValue(this.loaiHinhDaoTao);

        if (namHoc && hocKy) {
            T.alert('Đang load dữ liệu', 'info', false, null, true);
            this.props.getLichGiangDay({ hocKy, namHoc, loaiHinhDaoTao }, listLichGiangDay => {
                this.setState({ filter: { hocKy, namHoc, loaiHinhDaoTao }, listLichGiangDay, isSearch: true }, () => T.alert('Load dữ liệu thành công', 'success', true, 5000));
            });
        } else {
            T.notify('Vui lòng chọn năm học và học kỳ!', 'danger');
        }
    }

    handleDownload = () => {
        T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
        this.props.downLoadLichDay(this.state.filter);
    }

    render() {
        const { listLichGiangDay = [], isSearch } = this.state;

        let table = (list) => renderTable({
            getDataSource: () => Object.keys(list.groupBy('maHocPhan')),
            emptyTable: 'Chưa có lịch giảng dạy',
            header: 'thead-light',
            stickyHead: list && list.length > 14,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%' }}>Mã học phần</th>
                    <th style={{ width: '70%', textAlign: 'center' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại hình</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cơ sở</th>
                    <th style={{ width: 'auto' }}>Phòng</th>
                    <th style={{ width: 'auto' }}>Thứ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổng tiết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                </tr>
            ),
            renderRow: (item, index) => {
                const rows = [];
                let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                if (rowSpan) {
                    for (let idx = 0; idx < rowSpan; idx++) {
                        const hocPhan = listHocPhan[idx];
                        if (idx == 0) {
                            rows.push(<tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} rowSpan={rowSpan} />
                                <TableCell style={{ width: 'auto' }} type='link' content={hocPhan.maHocPhan} rowSpan={rowSpan} url={`${window.location.origin}/user/affair/lich-giang-day/detail/${hocPhan.maHocPhan}`} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.loaiHinhDaoTao} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.coSoPhong || hocPhan.coSo} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau && hocPhan.soTietBuoi ? `${hocPhan.tietBatDau} - ${parseInt(hocPhan.tietBatDau) + parseInt(hocPhan.soTietBuoi) - 1}` : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                            </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.coSo} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.coSoPhong || hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau && hocPhan.soTietBuoi ? `${hocPhan.tietBatDau} - ${parseInt(hocPhan.tietBatDau) + parseInt(hocPhan.soTietBuoi) - 1}` : ''} />
                                </tr>);
                        }
                    }
                }
                return rows;
            }
        });

        return this.renderPage({
            title: 'Thời khoá biểu',
            icon: 'fa fa-bookmark',
            breadcrumb: [
                <Link key={0} to='/user/affair'>Giảng viên</Link>,
                'Thời khoá biểu'
            ],
            content: <>
                <div className='tile row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-4' label='Năm học' data={SelectAdapter_SchoolYear} />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' data={SelectAdapter_DtDmHocKy} />
                    <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-4' label='Hình thức đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} allowClear />

                    <div style={{ marginLeft: 'auto', marginRight: '1%', display: isSearch ? '' : 'none' }} >
                        <button style={{ marginRight: '10px' }} className='btn btn-warning' onClick={e => e.preventDefault() || this.handleDownload()}>
                            <i className='fa fa-fw fa-lg fa-download' /> In học phần giảng dạy
                        </button>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.timKiem()}>
                            <i className='fa fa-fw fa-lg fa-search' /> Tìm kiếm
                        </button>
                    </div>
                    <div className='col-md-12' style={{ marginTop: '2%', display: isSearch ? '' : 'none' }}>
                        {table(listLichGiangDay)}
                    </div>
                </div>
            </>,
            backRoute: '/user/affair/',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, gvLichGiangDay: state.giangVien.gvLichGiangDay });
const mapActionsToProps = { getGvLichGiangDayPage, getLichGiangDay, getScheduleSettings, downLoadLichDay };
export default connect(mapStateToProps, mapActionsToProps)(GvLichGiangDayPage);