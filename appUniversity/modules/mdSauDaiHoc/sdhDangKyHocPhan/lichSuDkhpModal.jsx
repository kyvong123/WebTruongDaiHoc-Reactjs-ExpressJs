import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getSdhLichSuDkhpPage } from 'modules/mdSauDaiHoc/sdhLichSuDkhp/redux';
import Pagination from 'view/component/Pagination';
class LichSuDKHPModal extends AdminModal {

    state = {
        sortTerm: 'thoiGianThacTac_DESC',
        filter: {},
        ksSearch: {}
    }
    defaultSortTerm = 'thoiGianThacTac_DESC'
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
    thaoTac = [
        { id: 'A', text: 'Đăng ký mới' },
        { id: 'D', text: 'Hủy đăng ký' },
        { id: 'C', text: 'Chuyển lớp' },
        { id: 'H', text: 'Hoàn tác' }
    ]

    onShow = (mssv, done) => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.setState({ filter: { namHoc, hocKy, userMssv: mssv } }, () => {
            this.getPage(undefined, undefined, '', done);
        });
    };

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ ksSearch: { ...this.state.ksSearch, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhLichSuDkhpPage(pageN, pageS, pageC, filter, page => {
            this.setState({ page });
            done && done();
        });
    }

    render = () => {
        const { namHoc, hocKy } = this.state.filter;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderDataTable({
            data: list,
            emptyTable: (namHoc && hocKy) ? `Không có dữ liệu lịch sử đăng ký học phần cho HK${hocKy}, năm học ${namHoc}` : '',
            header: 'thead-light',
            stickyHead: list && list.length > 12,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='nguoiThaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' keyCol='thoiGianThaoTac' />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} data={this.thaoTac} typeSearch='select' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.userModified} />
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
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={
                            item.thaoTac == 'C' ? `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`
                                : (item.thaoTac != 'A' && item.thaoTac != 'D' && item.thaoTac != 'H' ? item.thaoTac : item.ghiChu)
                        } />
                    </tr>
                );
            }
        });
        return this.renderModal({
            title: 'Lịch sử đăng ký học phần',
            size: 'elarge',
            body:
                <>
                    {table}
                    <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} pageRange={5} />
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhLichSuDkhpPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichSuDKHPModal);