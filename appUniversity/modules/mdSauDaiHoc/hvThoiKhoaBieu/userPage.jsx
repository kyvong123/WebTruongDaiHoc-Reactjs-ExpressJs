import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, getValue, FormSelect } from 'view/component/AdminPage';
import { getThoiKhoaBieuSdh, SelectAdapter_HocKySdh } from './redux';

class UserPageSdh extends AdminPage {
    state = { listTKB: [], isSearch: false }

    componentDidMount() {
        T.ready('/user/hoc-vien/thoi-khoa-bieu', () => {
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

    timKiem = () => {
        let namHoc = getValue(this.khoaSinhVien);
        let hocKy = getValue(this.hocKyFilter);
        this.setState({ namHoc, hocKy });
        if (namHoc && hocKy) {
            getThoiKhoaBieuSdh({ hocKy, namHoc }, listTKB => this.setState({ listTKB: listTKB.items }, () => this.setState({ isSearch: true })));
        } else {
            T.notify('Vui lòng chọn năm học và học kỳ!', 'danger');
        }
    }

    render() {
        const { namHoc, hocKy, listTKB, isSearch } = this.state;

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
                                    <TableCell content={hocPhan.tenMonHoc} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#ffffff' }}>
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            }
        });

        return this.renderPage({
            title: 'Thời khóa biểu',
            icon: 'fa fa-calendar-check-o',
            breadcrumb: ['Thời khóa biểu'],
            content: <div className='tile row'>
                <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-6' label='Năm học' data={this.state.namHoc || []} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_HocKySdh} />
                <div style={{ marginLeft: 'auto', marginRight: '1%' }} >
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.timKiem()}>
                        <i className='fa fa-fw fa-lg fa-search' /> Tìm kiếm
                    </button>
                </div>
                <div className='col-md-12' style={{ marginTop: '2%', display: isSearch ? '' : 'none' }}>
                    {table(listTKB)}
                </div>
            </div>,
            backRoute: '/user',
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserPageSdh);