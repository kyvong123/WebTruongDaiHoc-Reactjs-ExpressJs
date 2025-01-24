import React from 'react';
import { connect } from 'react-redux';
import {
    getTcDotDongHocPhiPage, createTcDotDongHocPhi, updateTcDotDongHocPhi, getListLoaiPhi, updateListLoaiPhi,
    deleteTcDotDongHocPhi, getLengthApplyDotDong, applyDotDong, getListSinhVienDongHocPhi, getLengthMailPhatSinh,
    sendMailPhatSinh, getTcDotDongHocPhi, rollBackDotDong, rollBackDotDongGetLength
} from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import EditModal from './modal/editModal';
import DetailModal from './modal/detailModal';
import ApplyModal from './modal/applyModal';
import RollBackModal from './modal/rollBackModal';
import SendMailPhatSinh from './modal/sendMailPhatSinh';
class tcDotDongHocPhiAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/finance/dot-dong-hoc-phi', () => {
            T.onSearch = (searchText) => this.props.getTcDotDongHocPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getTcDotDongHocPhiPage();
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
                this.props.deleteTcDotDongHocPhi(item.id, error => {
                    if (error) T.notify(error.message ? error.message : 'Xoá hoàn trả bị lỗi!', 'danger');
                });
            }
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('tcDotDong', ['manage', 'write', 'delete']);
        let buttons = [];
        if (permission.manage) {
            buttons.push({ className: 'btn-warning', icon: 'fa fa-envelope-o', tooltip: 'Gửi email phát sinh học phí', onClick: (e) => e.preventDefault() || this.sendMailModal.show() });
            buttons.push({ className: 'btn-danger', icon: 'fa fa-rotate-left', tooltip: 'Hoàn tác áp dụng đợt đóng', onClick: (e) => e.preventDefault() || this.rollBackModal.show() });
        }
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcDotDongHocPhi && this.props.tcDotDongHocPhi.page ?
            this.props.tcDotDongHocPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đợt đóng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayBatDau || ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayKetThuc || ''} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.editModal.show(item)}
                        onDelete={this.onDelete}>
                        <Tooltip title='Áp dụng đợt đóng' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.applyModal.show(item)}>
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Chi tiết loại phí' arrow>
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
            title: 'Đợt đóng học phí',
            breadcrumb: [
                'Đợt đóng học phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcDotDongHocPhiPage} />
                <EditModal ref={e => this.editModal = e} create={this.props.createTcDotDongHocPhi} update={this.props.updateTcDotDongHocPhi} readOnly={!permission.write} />
                <DetailModal ref={e => this.detailModal = e} loaiPhi={this.props.getListLoaiPhi} updateLoaiPhi={this.props.updateListLoaiPhi} readOnly={!permission.write} />
                <ApplyModal ref={e => this.applyModal = e} loaiPhi={this.props.getListLoaiPhi} applyDotDong={this.props.applyDotDong} getLength={this.props.getLengthApplyDotDong} getLengthHocPhi={this.props.getListSinhVienDongHocPhi} readOnly={!permission.write} />
                <SendMailPhatSinh ref={e => this.sendMailModal = e} getLengthMailPhatSinh={this.props.getLengthMailPhatSinh} sendMailPhatSinh={this.props.sendMailPhatSinh} />
                <RollBackModal ref={e => this.rollBackModal = e} loaiPhi={this.props.getListLoaiPhi} getDotDong={this.props.getTcDotDongHocPhi} rollBack={this.props.rollBackDotDong} rollBackLength={this.props.rollBackDotDongGetLength} readOnly={!permission.write} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showEditModal(e) : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDotDongHocPhi: state.finance.tcDotDongHocPhi });
const mapActionsToProps = {
    getTcDotDongHocPhiPage, createTcDotDongHocPhi, updateTcDotDongHocPhi, deleteTcDotDongHocPhi,
    getListLoaiPhi, updateListLoaiPhi, getLengthApplyDotDong, applyDotDong, getListSinhVienDongHocPhi,
    getLengthMailPhatSinh, sendMailPhatSinh, getTcDotDongHocPhi, rollBackDotDong, rollBackDotDongGetLength
};
export default connect(mapStateToProps, mapActionsToProps)(tcDotDongHocPhiAdminPage);

