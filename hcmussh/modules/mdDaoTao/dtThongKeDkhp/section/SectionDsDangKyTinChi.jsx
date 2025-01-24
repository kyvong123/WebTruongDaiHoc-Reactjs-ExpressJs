import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell, } from 'view/component/AdminPage';

import { getDtThongKeDangKyPage } from 'modules/mdDaoTao/dtThongKeDkhp/redux';
class SectionDsDangKyTinChi extends React.Component {
    state = { isHien: true, sortTerm: 'thoiGianDangKy_DESC', ksSearch: {}, data: {} }
    defaultSortTerm = 'thoiGianDangKy_DESC'
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

    getData = (value) => {
        let { filter, filterNgay } = this.props;
        if (value && value == 1) filter = { ...filter, ...filterNgay };

        this.setState({ filter }, () => this.getPage(undefined, undefined, ''));
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let { filter } = this.state;
        filter = JSON.stringify(filter);
        T.handleDownload(`/api/dt/thong-ke-dkhp/ds-dang-ky-tin-chi/download?filter=${filter}`,
            'Thong_ke_DS_DKTC.xlsx');
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

        let table = (list) => renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên Môn' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Loại đăng ký' keyCol='loaiDangKy' onKeySearch={this.handleKeySearch} onSort={this.onSort} typeSearch='select' data={this.loaiDangKy || []} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người đăng ký' keyCol='nguoiDangKy' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian đăng ký' keyCol='thoiGianDangKy' onSort={this.onSort} />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMon, { vi: '' })?.vi} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.loaiDangKy && this.mapperLoaiDangKy[item.loaiDangKy] ? this.mapperLoaiDangKy[item.loaiDangKy] : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nguoiDangKy} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianDangKy} />

                    </tr >
                );
            }
        });

        return (
            <div className='tile'>
                {table(list)}
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
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionDsDangKyTinChi);