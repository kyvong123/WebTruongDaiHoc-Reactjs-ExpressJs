import React from 'react';
import { connect } from 'react-redux';
import { getTcDotDongPage, createTcDotDong, updateTcDotDong, deleteTcDotDong, getListLoaiPhi, updateListLoaiPhi } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import EditModal from './modal/editModal';
import DetailModal from './modal/detailModal';
import { Tooltip } from '@mui/material';
class tcDotDongAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcDotDongPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getTcDotDongPage();
        });
    }

    showEditModal = (e) => {
        e.preventDefault();
        this.editModal.show();
    }

    onDelete = (e, item) => {
        T.confirm('Xóa đợt đóng học phí', `Bạn có chắc chắn muốn xóa ${item.ten} ?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.notify('Xóa đợt đóng học phí thành công!', 'success');
                this.props.deleteTcDotDong(item.id, error => {
                    if (error) T.notify(error.message ? error.message : 'Xoá hoàn trả bị lỗi!', 'danger');
                });
            }
        });
        e.preventDefault();
    }

    onApply = (item) => {
        this.props.getListLoaiPhi({ id: item.id }, res => {
            if (!res || !res.length) {
                T.notify('Đợt đóng không thể áp dụng do chưa cấu hình loại phí', 'danger');
            }
            else {
                this.props.history.push(`/user/finance/cau-hinh-dot-dong?id=${item.id}`);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('tcDotDong', ['manage', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcDotDong && this.props.tcDotDong.page ?
            this.props.tcDotDong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let buttons = [];
        buttons.push({ className: 'btn-warning', icon: 'fa-lock', onClick: e => e.preventDefault() || this.props.history.push('/user/finance/khoa-giao-dich') });
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đợt đóng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - ${item.namHoc + 1}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.editModal.show(item)}
                        onDelete={this.onDelete}>
                        <Tooltip title='Áp dụng đợt đóng' arrow>
                            <button className='btn' style={{ color: '#fff', backgroundColor: '#696969' }} onClick={e => e.preventDefault() || this.onApply(item)} permission={{}}>
                                <i className='fa fa-cog' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Cấu hình loại phí' arrow>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.detailModal.show(item)}>
                                <i className='fa fa-lg fa-list-alt' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )

        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đợt đóng học phí (mới)',
            breadcrumb: [
                'Đợt đóng học phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcDotDongPage} />
                <EditModal ref={e => this.editModal = e} create={this.props.createTcDotDong} update={this.props.updateTcDotDong} readOnly={!permission.write} />
                <DetailModal ref={e => this.detailModal = e} loaiPhi={this.props.getListLoaiPhi} updateLoaiPhi={this.props.updateListLoaiPhi} readOnly={!permission.write} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showEditModal(e) : null,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDotDong: state.finance.tcDotDong });
const mapActionsToProps = {
    getTcDotDongPage, createTcDotDong, updateTcDotDong, deleteTcDotDong, getListLoaiPhi, updateListLoaiPhi
};
export default connect(mapStateToProps, mapActionsToProps)(tcDotDongAdminPage);

