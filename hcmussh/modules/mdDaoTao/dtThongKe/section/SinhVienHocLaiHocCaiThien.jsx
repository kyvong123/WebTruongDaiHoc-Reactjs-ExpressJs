import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { FormSelect, renderDataTable, TableHead, TableCell, AdminPage } from 'view/component/AdminPage';
import { getDtThongKeHLCTPage } from 'modules/mdDaoTao/dtThongKe/redux';
class SinhVienHocLaiHocCaiThien extends AdminPage {
    state = { isHien: true, filter: {}, khoa: {}, nganh: {}, sortTerm: 'mssv_ASC', ksSearch: {} }
    defaultSortTerm = 'mssv_ASC'
    isCaiThien = [
        { id: 0, text: 'Sinh viên học lại' },
        { id: 1, text: 'Sinh viên học cải thiện' }
    ]

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let filter = { ...history.state.state.filter, isCaiThien: 0 };
            this.setState({ filter }, () => {
                this.caiThien.value(0);
                this.getPage(undefined, undefined, '');
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThongKeHLCTPage(pageN, pageS, pageC, filter, done);
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
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngành' keyCol='nganh' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã Học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số TC' keyCol='soTinChi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số tiết' keyCol='soTiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
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
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTiet} />
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
                <FormSelect ref={e => this.caiThien = e} data={this.isCaiThien}
                    style={{ width: '250px', marginBottom: '0', marginRight: '10px' }} placeholder='Chọn'
                    onChange={(value) => this.setState({ filter: { ...this.state.filter, isCaiThien: value.id } }, () => this.getPage())} />
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
    getDtThongKeHLCTPage
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienHocLaiHocCaiThien); 