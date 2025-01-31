import React from 'react';
import { AdminPage, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { connect } from 'react-redux';
import { GetDanhSachSinhVienPage } from './redux';


class DanhSachSinhVien extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.getStudentsPage(undefined, undefined, '');
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
        });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => this.props.GetDanhSachSinhVienPage(pageNumber, pageSize, pageCondition, this.state.filter, done);

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcDanhSachSinhVien && this.props.tcDanhSachSinhVien.page ?
            this.props.tcDanhSachSinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='CCCD/CMND' keyCol='cmnd' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Khoa' keyCol='khoa' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngành' keyCol='Nganh' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lớp' keyCol='Lop' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Khoá sinh viên' keyCol='namTuyenSinh' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={<a href={`/user/finance/danh-sach-sinh-vien/${item.mssv}`} target='_blank' rel='noreferrer' >{item.mssv}</a>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.cmnd} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh} - ${item.tenNganh}` || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách sinh viên',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/finance'>Kế hoạch tài chính</Link>,
                'Danh sách sinh viên'
            ],
            content: <><div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getStudentsPage} pageRange={3} />
            </div>
            </>,
            backRoute: '/user/finance'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDanhSachSinhVien: state.finance.tcDanhSachSinhVien });
const mapActionsToProps = {
    GetDanhSachSinhVienPage
};
export default connect(mapStateToProps, mapActionsToProps)(DanhSachSinhVien);