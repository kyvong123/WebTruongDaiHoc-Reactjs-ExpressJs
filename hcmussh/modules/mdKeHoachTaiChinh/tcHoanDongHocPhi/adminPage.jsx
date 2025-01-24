import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { getTcHoanDongHocPhiPage, deleteTcHoanDongHocPhi, updateTcHoanDongHocPhi, createTcHoanDongHocPhi, exportFileWord, xacNhanHoanDongHocPhi } from './redux';
import EditModal from './modal/editModal';
import DanhSachGiaHanModal from './modal/uploadDanhSachModal';
import { Tooltip } from '@mui/material';

class tcHoanDongHocPhiAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcHoanDongHocPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getTcHoanDongHocPhiPage(undefined, undefined, '');
            this.tabHoanDong.tabClick(null, 0);
        });

        T.socket.on('updatedHoanDong', () => {
            this.props.getTcHoanDongHocPhiPage(undefined, undefined, '');
        });

    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHoanDongHocPhiPage(pageN, pageS, pageC, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.editModal.show();
    }

    xacNhanHoanDong = (item) => {
        T.confirm('Xác nhận hoãn đóng', `Đồng ý xác nhận đơn hoãn đóng học phí của sinh viên ${item.hoVaTen} (MSSV: ${item.mssv})?`, 'warning', true, isConfirm => {
            isConfirm && this.props.xacNhanHoanDongHocPhi(item.id, error => {
                if (!error) T.alert(`Xác nhận hoãn đóng cho sinh viên ${item.mssv} thành công!`, 'success', false, 800);
            });
        });
    }

    exportFileWord = (item) => {
        this.props.exportFileWord(item, data => {
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
        });
    }

    onDelete = (e, item) => {
        T.confirm('Xóa đơn hoãn đóng học phí', `Bạn có chắc chắn muốn xóa đơn hoãn đóng học phí của sinh viên ${item.hoVaTen} (MSSV: ${item.mssv})?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcHoanDongHocPhi(item.id, error => {
                if (!error) T.alert(`Xoá đơn hoãn đóng của sinh viên ${item.mssv} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('tcHoanDongHocPhi', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHoanDongHocPhi && this.props.tcHoanDongHocPhi.page ?
            this.props.tcHoanDongHocPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let buttons = [];
        permission.write && buttons.push({ className: 'btn-success', icon: 'fa-upload', tooltip: 'Tải lên danh sách', onClick: e => e.preventDefault() || this.uploadModal.show() });

        const mapTrangThai = {
            'chuaThanhToan': {
                text: 'Chưa thanh toán',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-warning'>Chưa thanh toán <i className='fa fa-clock-o'></i></p>
            },
            'daThanhToan': {
                text: 'Đã thanh toán',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-primary'>Đã thanh toán <i className='fa fa-clock-o'></i></p>
            },
            'daXacNhan': {
                text: 'Đã xác nhận',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-success'>Đã xác nhận <i className='fa fa-check-circle' ></i></p>
            },
            'daHuy': {
                text: 'Đã hủy',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-danger'>Đã hủy <i className='fa fa-times'></i></p>
            },
        };

        const renderTabs = (data) => <div className='tile'>{table(data)}</div>;

        const table = (data) => renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => data,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lý do</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Thời hạn thanh toán</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thu trước (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th> */}
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.timeCreated} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen} />
                    <TableCell style={{ textAlign: 'justify' }} content={item.lyDo} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy ' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiHanThanhToan} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienThuTruoc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={mapTrangThai[item.trangThai]?.viewText} />
                    {/* <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ghiChu} /> */}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.editModal.show(item)} onDelete={this.onDelete}>
                        <Tooltip title='Xác nhận hoãn đóng' arrow disableHoverListener={!!item.xacNhan || !item.status}>
                            <span><button className='btn btn-success' disabled={item.xacNhan || !item.status} onClick={e => e.preventDefault() || this.xacNhanHoanDong(item)}><i className='fa fa-lg fa-check-square-o' content={item} /></button></span>
                        </Tooltip>
                        <Tooltip title='Xuất đơn hoãn đóng'>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.exportFileWord(item)}><i className='fa fa-lg fa-file-text' content={item} /></button>
                        </Tooltip>
                    </TableCell>

                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Gia hạn học phí',
            breadcrumb: [
                'Hoãn đóng học phí'
            ],
            content: <>
                <FormTabs contentClassName='tile-body' ref={e => this.tabHoanDong = e} tabs={[
                    { title: <>Tất cả {list && <span className="badge badge-secondary">{list?.length}</span>}</>, component: renderTabs(list) },
                    ...Object.keys(mapTrangThai).map(item => {
                        const listData = list.filter(subItem => subItem.trangThai == item);
                        return Object({ title: <> {mapTrangThai[item]?.text} {list && <span className="badge badge-secondary">{listData?.length}</span>}</>, component: renderTabs(listData) });
                    })
                ]} />
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <EditModal ref={e => this.editModal = e} create={this.props.createTcHoanDongHocPhi} update={this.props.updateTcHoanDongHocPhi} apDungHoanDong={this.props.apDungHoanDong} readOnly={!permission.write} permission={permission} />
                <DanhSachGiaHanModal ref={e => this.uploadModal = e} getPage={this.getPage} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHoanDongHocPhi: state.finance.tcHoanDongHocPhi });
const mapActionsToProps = { getTcHoanDongHocPhiPage, deleteTcHoanDongHocPhi, updateTcHoanDongHocPhi, createTcHoanDongHocPhi, exportFileWord, xacNhanHoanDongHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(tcHoanDongHocPhiAdminPage);