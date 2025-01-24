import React from 'react';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getSdhLichSuDkhpDashBoard } from 'modules/mdSauDaiHoc/sdhLichSuDkhp/redux';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';


class LichSuDKHP extends AdminPage {
    state = {
        sortTerm: 'thoiGian_DESC',
        filter: {},
        ksSearch: {}
    }
    defaultSortTerm = 'thoiGian_DESC'
    thaoTac = [
        { id: 'A', text: 'Đăng ký mới' },
        { id: 'D', text: 'Hủy đăng ký' },
        { id: 'C', text: 'Chuyển lớp' },
        { id: 'H', text: 'Hoàn tác' }
    ]
    getLichSu = (done) => {
        this.setState({ filter: this.props.filter }, () => {
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
        this.props.getSdhLichSuDkhpDashBoard(pageN, pageS, pageC, filter, page => {
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
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} data={this.thaoTac} typeSearch='select' />
                    <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.thaoTac == 'A' ? (
                                <div style={{ color: 'green' }}>
                                    <i className='fa fa-lg fa-check-circle-o' /> Đăng ký mới </div>
                            ) : (
                                item.thaoTac == 'D' ? (
                                    <div style={{ color: 'red' }}>
                                        <i className='fa fa-lg fa-times-circle-o' /> Hủy đăng ký </div>
                                ) : (
                                    item.thaoTac == 'H' ? (
                                        <div style={{ color: 'orange' }}>
                                            <i className='fa fa-lg fa-undo' /> Hoàn tác </div>
                                    ) : (
                                        <div style={{ color: 'blue' }}>
                                            <i className='fa fa-lg fa-repeat' /> Chuyển lớp </div>
                                    )
                                )

                            )
                        } />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={
                            item.thaoTac == 'C' ? `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`
                                : (item.thaoTac != 'A' && item.thaoTac != 'D' && item.thaoTac != 'H' ? item.thaoTac : item.ghiChu)
                        } />
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
    getSdhLichSuDkhpDashBoard
};
export default connect(null, mapActionsToProps, null, { forwardRef: true })(LichSuDKHP);