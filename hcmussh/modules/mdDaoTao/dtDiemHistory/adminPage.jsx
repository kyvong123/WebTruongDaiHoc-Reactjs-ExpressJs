import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead, getValue, FormDatePicker } from 'view/component/AdminPage';
import { getDtDiemHistoryPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';


class DtDiemHistoryPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    state = {
        page: null, filter: {}, sortTerm: 'maHocPhan_ASC'
    }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let ngayKetThuc = new Date().setHours(23, 59, 59, 0);
            let ngayBatDau = new Date().setHours(0, 0, 0, 0);
            this.ngayBatDau.value(ngayBatDau);
            this.ngayKetThuc.value(ngayKetThuc);
            this.setState({
                filter: { ngayBatDau, ngayKetThuc }
            }, () => this.getPage(1, 50, ''));
        });
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtDiemHistoryPage(pageN, pageS, pageC, filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    handleFilterNgay = (e) => {
        e && e.preventDefault();
        let { filter } = this.state;
        let ngayBatDau = getValue(this.ngayBatDau).getTime();
        let ngayKetThuc = getValue(this.ngayKetThuc).getTime();
        if (!ngayBatDau || !ngayKetThuc) T.notify('Khoảng thời gian trống', 'danger');
        else if (ngayKetThuc <= ngayBatDau) T.notify('Khoảng thời gian không hợp lệ', 'danger');
        else if ((ngayKetThuc - ngayBatDau) > 31536000000) T.notify('Vượt khoảng thời gian cho phép: 365 ngày', 'danger');
        else {
            this.setState({
                filter: {
                    ...filter,
                    ngayBatDau: ngayBatDau,
                    ngayKetThuc: ngayKetThuc
                }
            }, () => this.getPage());
        }
    }

    downloadExcel = () => {
        let { filter } = this.state;
        T.get(`/api/dt/diem-history/export?filter=${T.stringify(filter)}`);
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDiemHistory?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };

        let table = renderDataTable({
            data: list,
            stickyHead: list && list.length > 15,
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' style={{ width: '100px' }} keyCol='mssv' onKeySearch={this.handleKeySearch} />
                <TableHead content='Họ tên' style={{ width: '250px' }} keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                <TableHead content='Học phần' style={{ width: '150px' }} keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead content='Tên học phần' style={{ width: '50%' }} keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead content='Loại' style={{ width: '10%' }} keyCol='loaiDiem' onKeySearch={this.handleKeySearch} />
                <TableHead content='%' style={{ width: '10%' }} keyCol='phanTram' onKeySearch={this.handleKeySearch} />
                <TableHead content='Điểm mới' style={{ width: '20%', textAlign: 'center' }} keyCol='newDiem' onKeySearch={this.handleKeySearch} />
                <TableHead content='Điểm cũ' style={{ width: '20%', textAlign: 'center' }} keyCol='oldDIem' onKeySearch={this.handleKeySearch} />
                <TableHead content='Điểm khác' style={{ width: '10%', textAlign: 'center' }} keyCol='diemDacBiet' onKeySearch={this.handleKeySearch} />
                <TableHead content='Người chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} keyCol='userModified' onKeySearch={this.handleKeySearch} />
                <TableHead content='Thời gian chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} />
                <TableHead content='Ghi chú' style={{ width: '10%', textAlign: 'center' }} keyCol='ghiChu' onKeySearch={this.handleKeySearch} />
                <TableHead content='Hình thức ghi' style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }} keyCol='hinhThucGhi' onKeySearch={this.handleKeySearch} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={item.R} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<><span className='text-primary'>{item.mssv}</span></>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell content={item.maHocPhan} />
                <TableCell content={T.parse(item.tenMonHoc)?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.newDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.oldDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemDacBiet} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.userModified} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(item.timeModified)} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ghiChu} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hinhThucGhi} />
            </tr>
        });

        return this.renderPage({
            icon: 'fa fa-history',
            title: 'Lịch sử nhập điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Lịch sử'
            ],
            header: <div className='d-flex justify-content-right align-items-center'>
                <FormDatePicker type='time' ref={e => this.ngayBatDau = e} className='mr-3' label='Từ ngày' />
                <FormDatePicker type='time' ref={e => this.ngayKetThuc = e} className='mr-3' label='Đến ngày' />
                <Tooltip title='Tìm kiếm' arrow>
                    <button className='btn btn-info ' onClick={this.handleFilterNgay}>
                        <i className='fa fa-filter'></i>
                    </button>
                </Tooltip>
            </div>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onExport: e => e && e.preventDefault() || this.downloadExcel(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemHistory: state.daoTao.dtDiemHistory });
const mapActionsToProps = { getDtDiemHistoryPage };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemHistoryPage);