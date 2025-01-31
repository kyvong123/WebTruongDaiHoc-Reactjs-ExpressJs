import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell, } from 'view/component/AdminPage';

import { getDtThongKeDangKyPage } from 'modules/mdDaoTao/dtThongKe/redux';
class SectionDanhSachDkMonHoc extends React.Component {
    state = { isHien: true, sortTerm: 'mssv_ASC', ksSearch: {}, data: {} }
    defaultSortTerm = 'mssv_ASC'

    getData = (value) => {
        let { filter, filterNgay } = this.props;
        if (value && value == 1) filter = { ...filter, ...filterNgay };

        this.setState({ filter }, () => this.getPage(undefined, undefined, ''));
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let { filter } = this.state;
        filter = JSON.stringify(filter);
        T.handleDownload(`/api/dt/thong-ke-dkhp/ds-dang-ky-mon-hoc/download?filter=${filter}`,
            'Thong_ke_DS_DKMH.xlsx');
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm, isDangKy: 1 };
        this.props.getDtThongKeDangKyPage(pageN, pageS, pageC, filter, (page) => {
            this.setState({ page });
            done && done();
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ ksSearch: { ...this.state.ksSearch, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '50vh' },
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

        return (
            <div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDtThongKeDangKyPage
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionDanhSachDkMonHoc);