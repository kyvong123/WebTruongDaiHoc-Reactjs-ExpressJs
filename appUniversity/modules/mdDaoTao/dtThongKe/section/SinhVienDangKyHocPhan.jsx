import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { FormSelect, renderDataTable, TableHead, TableCell, AdminPage } from 'view/component/AdminPage';
import { getDtThongKeDangKyPage } from 'modules/mdDaoTao/dtThongKe/redux';
class SinhVienDangKyHocPhan extends AdminPage {
    state = { isHien: true, filter: {}, sortTerm: 'mssv_ASC', ksSearch: {} }
    defaultSortTerm = 'mssv_ASC'
    dangKy = [
        { id: 1, text: 'Sinh viên đã đăng ký' },
        { id: 0, text: 'Sinh viên chưa đăng ký' }
    ]

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let filter = { ...history.state.state.filter, isDangKy: 1 };
            this.setState({ filter }, () => {
                this.isDangKy.value(1);
                this.getPage(undefined, undefined, '');
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThongKeDangKyPage(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ ksSearch: { ...this.state.ksSearch, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtThongKe?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 11 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngành' keyCol='nganh' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng số môn học' keyCol='soLuongDangKy' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng STC' keyCol='soLuongTinChi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng số tiết' keyCol='soLuongTiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.khoaSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuongDangKy || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet || 0} />

                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thống kê chi tiết',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={0} to='/user/dao-tao/thong-ke'>Thống kê</Link>,
                'Thống kê chi tiết'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.isDangKy = e} data={this.dangKy}
                    style={{ width: '250px', marginBottom: '0', marginRight: '10px' }} placeholder='Chọn'
                    onChange={(value) => this.setState({ filter: { ...this.state.filter, isDangKy: value.id } }, () => this.getPage())} />
            </div>,
            content: <div>
                <div className='tile'>
                    <h6 className='tile-title'>Danh sách sinh viên đăng ký học phần</h6>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
            </div>,
            backRoute: '/user/dao-tao/thong-ke',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtThongKe: state.daoTao.dtThongKe });
const mapActionsToProps = {
    getDtThongKeDangKyPage
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienDangKyHocPhan); 