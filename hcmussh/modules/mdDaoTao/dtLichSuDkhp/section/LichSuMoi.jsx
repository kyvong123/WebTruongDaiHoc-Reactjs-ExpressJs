import React from 'react';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getDtLichSuDkhpDashBoard } from 'modules/mdDaoTao/dtLichSuDkhp/redux';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';


class LichSuMoi extends AdminPage {
    state = {
        sortTerm: 'thoiGian_DESC',
        filter: {},
        ksSearch: {}
    }
    defaultSortTerm = 'thoiGian_DESC'
    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }
    loaiDangKy = [
        { id: 'KH', text: 'Theo kế hoạch' },
        { id: 'NKH', text: 'Ngoài kế hoạch' },
        { id: 'NCTDT', text: 'Ngoài CTĐT' },
        { id: 'CT', text: 'Cải thiện' },
        { id: 'HL', text: 'Học lại' },
        { id: 'HV', text: 'Học vượt' }
    ]

    getLichSu = (done) => {
        this.setState({ filter: { ...this.props.filter, thaoTac: 'A' } }, () => {
            this.getPage(undefined, undefined, '', done);
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ ksSearch: { ...this.state.ksSearch, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtLichSuDkhpDashBoard(pageN, pageS, pageC, filter, page => {
            this.setState({ page });
            done && done();
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderDataTable({
            data: list,
            emptyTable: 'Không có dữ liệu lịch sử đăng ký học phần',
            header: 'thead-light',
            stickyHead: list && list.length > 11,
            divStyle: { height: '60vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='nguoiThaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' keyCol='thoiGian' onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                    <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <div style={{ color: 'green' }}>                                    <i className='fa fa-lg fa-check-circle-o' /> Đăng ký mới </div>
                        } />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    </tr>
                );
            }
        });
        return (
            <>
                {table}

                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} pageRange={5} />
            </>
        );
    }
}

const mapActionsToProps = {
    getDtLichSuDkhpDashBoard
};
export default connect(null, mapActionsToProps, null, { forwardRef: true })(LichSuMoi);