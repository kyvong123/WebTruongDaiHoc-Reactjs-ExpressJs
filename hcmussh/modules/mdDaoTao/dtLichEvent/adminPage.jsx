import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

import { AdminPage, AdminModal, renderDataTable, TableCell, TableHead, FormDatePicker, getValue } from 'view/component/AdminPage';
import { getDtLichEventPage, deleteDtLichEvent } from './redux';

import AddModal from './addModal';
import EditModal from './editModal';
class ExportModal extends AdminModal {
    componentDidMount() {
    }

    onShow = () => {
        this.setState({ tuNgay: null, denNgay: null }, () => {
            this.tuNgay.value(null);
            this.denNgay.value(null);
        });
    };

    getFullDateTime = (value) => {
        if (value == null) return;
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        return `${date}-${month}-${year}`;
    }

    onDownload = (e) => {
        e.preventDefault();
        if (!this.tuNgay.value()) {
            T.notify('Chưa chọn ngày bắt đầu!', 'danger');
            this.tuNgay.focus();
        } else if (!this.denNgay.value()) {
            T.notify('Chưa chọn ngày kết thúc!', 'danger');
            this.denNgay.focus();
        } else {
            let tuNgay = getValue(this.tuNgay).getTime(),
                denNgay = getValue(this.denNgay).getTime(),
                ngayBD = this.getFullDateTime(tuNgay),
                ngayKT = this.getFullDateTime(denNgay);
            if (tuNgay > denNgay) {
                T.notify('Ngày kết thúc trước ngày bắt đầu!', 'danger');
                this.denNgay.focus();
            } else {
                T.handleDownload(`/api/dt/lich-event/download?tuNgay=${tuNgay}&denNgay=${denNgay}`,
                    `SU_KIEN_TU_NGAY_${ngayBD}_DEN_${ngayKT}.xlsx`);
            }
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Export dữ liệu sự kiện',
            size: 'large',
            body: <div>
                <div className='row'>
                    <FormDatePicker className='col-6' type='time' ref={e => this.tuNgay = e} label='Từ ngày' required />
                    <FormDatePicker className='col-6' type='time' ref={e => this.denNgay = e} label='Đến ngày' required />
                </div>
            </div>,
            buttons: <button type='button' className='btn btn-warning' onClick={e => this.onDownload(e)}>
                <i className='fa fa-fw fa-lg fa-print' />Export
            </button>
        }
        );
    };
}
class DtLichEventPage extends AdminPage {
    state = { sortTerm: 'time_DESC' }
    defaultSortTerm = 'time_DESC'
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtLichEventPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    delete = (id) => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn hủy sự kiện không?', true, isConfirm => {
            if (isConfirm) this.props.deleteDtLichEvent(id);
        });
    }

    render() {
        const permission = this.getUserPermission('dtLichEvent', ['write', 'delete', 'manage', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtLichEvent?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Chưa có dữ liệu sự kiện',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên sự kiện' keyCol='ten'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' keyCol='coSo'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian bắt đầu' keyCol='time'
                        onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số tuần lặp' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cán bộ' keyCol='giangVien'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu'
                        onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell type='link' contentClassName='multiple-lines-2' content={item.ten} url={`${window.location.origin}/user/dao-tao/lich-event/item/${item.id}`} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(item.tenCoSo, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayBatDau} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thoiGian} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTuanLap} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.lop} />
                        <TableCell content={item.giangVien} />
                        <TableCell content={item.ghiChu} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onEdit={(e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/lich-event/item/${item.id}`)}
                            onDelete={(e) => e.preventDefault() || this.delete(item.id)}
                        />
                    </tr >
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-microphone',
            title: 'Quản lý sự kiện',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý sự kiện'
            ],
            content: <>
                <div className='tile'>
                    <div>{table}</div>
                </div>

                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
                <EditModal ref={e => this.editModal = e} />
                <AddModal ref={e => this.addModal = e} />
                <ExportModal ref={e => this.exportModal = e} />
            </>,
            backRoute: '/user/dao-tao/edu-schedule',
            collapse: [
                { icon: 'fa-plus', name: 'Tạo sự kiện', permission: permission.write, type: 'success', onClick: e => e.preventDefault() || this.addModal.show(null) },
                { icon: 'fa-print', name: 'Export', permission: permission.export, type: 'warning', onClick: e => e.preventDefault() || this.exportModal.show(null) },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtLichEvent: state.daoTao.dtLichEvent });
const mapActionsToProps = { getDtLichEventPage, deleteDtLichEvent };
export default connect(mapStateToProps, mapActionsToProps)(DtLichEventPage);
