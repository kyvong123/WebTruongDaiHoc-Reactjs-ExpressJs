import React from 'react';
import { AdminPage, FormSelect, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViByFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getStudentListPage } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';


class ListStudentPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: { listFaculty: '' }, sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.getStudentsPage(undefined, undefined, '');
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
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            role = 'dtDanhSachSinhVien:manage';

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            divStyle: { height: '65vh' },
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Giới tính' keyCol='gioiTinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Ngày sinh' keyCol='ngaySinh' onKeySearch={this.handleKeySearch} typeSearch='date' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Nơi sinh' keyCol='noiSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='CTDT' keyCol='ctdt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Mã ngành' keyCol='maNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tên ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Năm tuyển sinh' keyCol='namTuyenSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khóa sinh viên' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Dân tộc' keyCol='danToc' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tôn giáo' keyCol='tonGiao' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Quốc tịch' keyCol='quocTich' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Thường trú' keyCol='thuongTru' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tạm trú' keyCol='tamTru' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Địa chỉ liên lạc' keyCol='diaChi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Ngày nhập học' keyCol='ngayNhapHoc' onKeySearch={this.handleKeySearch} typeSearch='date' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Đối tượng tuyển sinh' keyCol='doiTuongTuyenSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khu vực tuyển sinh' keyCol='khuVucTuyenSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Phương thức tuyển sinh' keyCol='phuongThucTuyenSinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Điểm thi' keyCol='diemThi' onKeySearch={this.handleKeySearch} />
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
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinhQuocGia ? (item.noiSinhQuocGia + (item.noiSinh ? `, ${item.noiSinh}` : '')) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maCtdt || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.danToc || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tonGiao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.quocTich || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                        + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                        + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                        + (item.tinhThuongTru ? item.tinhThuongTru : '')} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaTamTru ? item.soNhaTamTru + ', ' : '')
                        + (item.xaTamTru ? item.xaTamTru + ', ' : '')
                        + (item.huyenTamTru ? item.huyenTamTru + ', ' : '')
                        + (item.tinhTamTru ? item.tinhTamTru : '')} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaLienLac ? item.soNhaLienLac + ', ' : '')
                        + (item.xaLienLac ? item.xaLienLac + ', ' : '')
                        + (item.huyenLienLac ? item.huyenLienLac + ', ' : '')
                        + (item.tinhLienLac ? item.tinhLienLac : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc ? (item.ngayNhapHoc == -1 ? 'Đang chờ nhập học'
                        : (item.ngayNhapHoc.toString().length > 10 ? T.dateToText(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.doiTuongTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khuVucTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phuongThucTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemThi || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'Thống kê sinh viên',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thống kê sinh viên'
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
            onExport: e => e && e.preventDefault() || T.handleDownload(`/api/dt/manage-student/export-danh-sach?filter=${T.stringify(this.state.filter)}`),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.daoTao.manageSinhVien });
const mapActionsToProps = { getStudentListPage };
export default connect(mapStateToProps, mapActionsToProps)(ListStudentPage);