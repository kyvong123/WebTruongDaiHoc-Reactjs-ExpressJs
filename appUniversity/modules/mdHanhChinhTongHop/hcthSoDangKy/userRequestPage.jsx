import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import CreateRequest from './components/createRequest';
import { getPage, deleteRequest } from './redux/request';

class RequestPage extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user', () => {
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize, pageCondition } = this.props.hcthSoVanBanRequest?.page || { pageNumber: 1, pageSize: 50, pageCondition: '' };
        //TODO: implement AdvanceSearch
        this.getPage(pageNumber, pageSize, pageCondition);
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPage(pageNumber, pageSize, pageCondition, this.state.filter, done);
    }

    renderTrangThai = (trangThai) => {
        switch (trangThai) {
            case 'success':
                return <TableCell content={'Đã cấp'} className='text-success' />;
            case 'decline':
                return <TableCell content={'Từ chối'} className='text-danger' />;
            case 'waiting':
            default:
                return <TableCell content={'Chờ cấp'} className='text-warning' />;
        }
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa yêu cầu', 'Xác nhận xóa yêu cầu cấp số', true, isConfirm => {
            isConfirm && this.props.deleteRequest(item.id, this.getPage);
        });
    }

    render() {
        const { list, pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthSoVanBanRequest?.page || {};
        const permissions = this.getCurrentPermissions();
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '60%' }}>Lý do</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Loại văn bản</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Đơn vị</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Số lùi ngày</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày lùi</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Người tạo</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày tạo</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Trạng thái</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày cập nhật</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Số văn bản</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>,
            renderRow: (item) => {
                return <tr key={item.id}>
                    <TableCell content={item.R} />
                    <TableCell content={item.lyDo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiVanBan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                    <TableCell type='checkbox' content={item.soLuiNgay} />
                    <TableCell content={item.ngayLui && T.dateToText(item.ngayLui, 'dd/mm/yyyy')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNguoiTao?.trim().normalizedName() || ''} />
                    <TableCell content={T.dateToText(item.ngayTao, 'dd/mm/yyyy')} />
                    {this.renderTrangThai(item.trangThai)}
                    <TableCell content={item.ngayCapNhat ? T.dateToText(item.ngayCapNhat, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soCongVan || 'Chưa cấp'} />
                    <TableCell type='buttons' >
                        {item.trangThai == 'waiting' && <Tooltip arrow title='Xóa'>
                            <button className='btn btn-danger' onClick={e => this.onDelete(e, item)}><i className='fa fa-lg fa-trash' /></button>
                        </Tooltip>}
                    </TableCell>
                </tr>;
            },
        });
        return this.renderPage({
            title: 'Yêu cầu cấp số văn bản',
            content: <div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <CreateRequest ref={e => this.requestModal = e} getPage={this.getPage} />
            </div>,
            backRoute: '/user/so-dang-ky',
            onCreate: permissions.includes('donViCongVanDi:edit') && (() => this.requestModal.show()),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthSoVanBanRequest: state.hcth.hcthSoVanBanRequest });
const mapActionsToProps = { getPage, deleteRequest };
export default connect(mapStateToProps, mapActionsToProps)(RequestPage);
