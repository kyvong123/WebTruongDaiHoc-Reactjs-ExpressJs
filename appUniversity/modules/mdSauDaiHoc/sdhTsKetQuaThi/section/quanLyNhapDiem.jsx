import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead, getValue, FormDatePicker } from 'view/component/AdminPage';
import { getSdhTsDiemHistoryPage } from 'modules/mdSauDaiHoc/sdhTsQuanLyDiem/redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class lichSuNhapDiem extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    state = {
        page: null, filter: {}, sortTerm: 'maHocPhan_ASC'
    }
    ngayBatDau = '';
    ngayKetThuc = '';
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
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
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm, idDot: this.props.idDot };
        this.props.getSdhTsDiemHistoryPage(pageN, pageS, pageC, filter);
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
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhTsDiemHistory?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        let table = renderDataTable({
            data: list,
            stickyHead: list && list.length > 15,
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='Số báo danh' style={{ width: 'auto' }} keyCol='sbd' onKeySearch={this.handleKeySearch} />
                <TableHead content='Họ tên' style={{ width: '250px' }} keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                <TableHead content='Mã môn thi' style={{ width: '150px' }} keyCol='maMonThi' onKeySearch={this.handleKeySearch} />
                <TableHead content='Môn thi' style={{ width: '40%' }} keyCol='tenMonThi' onKeySearch={this.handleKeySearch} />
                <TableHead content='Điểm cũ' style={{ width: '20%', textAlign: 'center' }} keyCol='oldDIem' onKeySearch={this.handleKeySearch} />
                <TableHead content='Điểm mới' style={{ width: '20%', textAlign: 'center' }} keyCol='newDiem' onKeySearch={this.handleKeySearch} />
                <TableHead content='Người chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} keyCol='userModified' onKeySearch={this.handleKeySearch} />
                <TableHead content='Thời gian chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} />
                <TableHead content='Hình thức ghi' style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }} keyCol='hinhThucGhi' onKeySearch={this.handleKeySearch} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={item.R} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<><span className='text-primary'>{item.sbd}</span></>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell content={item.maMonThi} />
                <TableCell content={item.tenMonThi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.oldDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.newDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.userModified} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(Number(item.timeModified))} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hinhThucGhi} />
            </tr>
        });
        return <>
            <div className='tile'>
                <div className='d-flex justify-content-right align-items-center'>
                    <FormDatePicker type='time' ref={e => this.ngayBatDau = e} className='mr-3' label='Từ ngày' />
                    <FormDatePicker type='time' ref={e => this.ngayKetThuc = e} className='mr-3' label='Đến ngày' />
                    <Tooltip title='Tìm kiếm' arrow>
                        <button className='btn btn-info ' onClick={this.handleFilterNgay}>
                            <i className='fa fa-filter'></i>
                        </button>
                    </Tooltip>
                </div>
                {table}
            </div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsDiemHistory: state.sdh.sdhTsDiemHistory });
const mapActionsToProps = { getSdhTsDiemHistoryPage };
export default connect(mapStateToProps, mapActionsToProps)(lichSuNhapDiem);