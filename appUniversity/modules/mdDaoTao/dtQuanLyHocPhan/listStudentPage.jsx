import React from 'react';
import { AdminPage, TableCell, TableHead, renderDataTable, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { connect } from 'react-redux';
import { getStudentListPage } from './redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViByFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';


class ListStudentPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: { listFaculty: '' }, sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.getStudentsPage(undefined, undefined, '');
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => this.props.getStudentListPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleFilter = (key, value, pageNumber, pageSize) => {
        const { filter } = this.state;
        this.setState({ filter: { ...filter, [key]: value?.id } }, () => this.getStudentsPage(pageNumber, pageSize, ''));
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let { isPhongDaoTao } = this.props.system.user, role = 'dtQuanLyHocPhan:manage';

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Giới tính' keyCol='gioiTinh' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='CTDT' keyCol='ctdt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Môn CTDT' keyCol='soLuong' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Ngành' keyCol='nganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khoá' keyCol='namTuyenSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tình trạng sinh viên' keyCol='tinhTrangSinhVien' typeSearch='select' data={SelectAdapter_DmTinhTrangSinhVienV2} onKeySearch={this.handleKeySearch} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='link' content={item.mssv} url={`${window.location.origin}/user/dao-tao/students/edit/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell type={Number(isPhongDaoTao) ? 'link' : 'text'} style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }}
                        onClick={(e) => e.preventDefault() || (Number(isPhongDaoTao) && this.props.history.push({ pathname: `chuong-trinh-dao-tao/${item.idCtdt}` }))}
                        content={item.soLuong == 0
                            ? <Tooltip title='Chương trình đào tạo bị trống'>
                                <div>{item.maCtdt}</div>
                            </Tooltip> : item.maCtdt} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }}
                        content={item.soLuong == 0
                            ? <Tooltip title='Chương trình đào tạo bị trống'>
                                <div>{item.soLuong}</div>
                            </Tooltip> : item.soLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách sinh viên',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách sinh viên'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter(role)} allowClear onChange={value => this.handleFilter('loaiHinhFilter', value, pageNumber, pageSize)} />
                <FormSelect className='col-md-3' label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter(role)} allowClear onChange={value => this.handleFilter('khoaSinhVienFilter', value, pageNumber, pageSize)} />
                <FormSelect className='col-md-3' label='Khoa' data={SelectAdapter_DmDonViByFilter(role)} allowClear onChange={value => this.handleFilter('khoaFilter', value, pageNumber, pageSize)} />
                <FormSelect className='col-md-3' label='Lớp' data={SelectAdapter_DtLop({ role })} allowClear onChange={value => this.handleFilter('lopFilter', value, pageNumber, pageSize)} />
            </div>,
            content: <><div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getStudentsPage} pageRange={5} />
            </div>
            </>,
            backRoute: '/user/dao-tao',
            onExport: e => e && e.preventDefault() || T.handleDownload(`/api/dt/student/export-danh-sach?filter=${T.stringify(this.state.filter)}`),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.daoTao.dataSinhVien });
const mapActionsToProps = {
    getStudentListPage
};
export default connect(mapStateToProps, mapActionsToProps)(ListStudentPage);