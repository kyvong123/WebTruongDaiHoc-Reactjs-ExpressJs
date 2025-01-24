import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { getTcTncnPage, updateTcTncn, tiepNhanTncn, xacNhanTncn, deleteTcTncn } from './redux';
import { Tooltip } from '@mui/material';
import EditModal from './editModal';

class tcHoanDongHocPhiAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcTncnPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getTcTncnPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcTncnPage(pageN, pageS, pageC, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.editModal.show();
    }

    onReceive = (item) => {
        T.confirm('Tiếp nhận yêu cầu', `Tiếp nhận yêu cầu đăng ký MST của cán bộ ${item.hoVaTen}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.tiepNhanTncn(item.id, error => {
                if (!error) T.alert('Tiếp nhận yêu cầu đăng ký MST thành công!', 'success', false, 800);
            });
        });
    }

    onComplete = (item) => {
        T.confirm('Xác thực hoàn tất', `Xác thực hoàn thành cấp MST của cán bộ ${item.hoVaTen}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.xacNhanTncn(item.id, error => {
                if (!error) T.alert('Xác thực cấp MST thành công!', 'success', false, 800);
            });
        });
    }

    onDelete = (e, item) => {
        T.confirm('Hủy yêu cầu', `Hủy yêu cầu đăng ký MST của cán bộ ${item.hoVaTen}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcTncn(item.id, error => {
                if (!error) T.alert('Hủy yêu cầu đăng ký MST thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('tcTncn', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcTncn && this.props.tcTncn.page ?
            this.props.tcTncn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let buttons = [];
        // permission.write && buttons.push({ className: 'btn-success', icon: 'fa-upload', tooltip: 'Tải lên danh sách', onClick: e => e.preventDefault() || this.uploadModal.show() });

        const mapTrangThai = {
            'CHO_XAC_NHAN': {
                text: 'Chờ xác nhận',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-warning'>Chờ xác nhận <i className='fa fa-clock-o'></i></p>
            },
            'TIEP_NHAN': {
                text: 'Đã tiếp nhận',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-primary'>Đã tiếp nhận <i className='fa fa-clock-o'></i></p>
            },
            'HOAN_TAT': {
                text: 'Hoàn tất',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-success'>Hoàn tất <i className='fa fa-check-circle' ></i></p>
            },
            'HUY': {
                text: 'Đã hủy',
                viewText: <p style={{ fontWeight: 'bold' }} className='p-0 mb-0 text-danger'>Đã hủy <i className='fa fa-times'></i></p>
            },
        };

        const typeKeKhai = {
            1: 'Đăng ký',
            2: 'Cập nhật',
            3: 'Kê khai'
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
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSCB</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>CMND/CCCD</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã số thuế</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại kê khai</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayTao} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.shcc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.cmnd} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maSoThue} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={typeKeKhai[item.typeKeKhai]} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={mapTrangThai[item.trangThai]?.viewText} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.editModal.show(item)} onDelete={this.onDelete}>
                        {item.trangThai == 'CHO_XAC_NHAN' && <Tooltip title='Tiếp nhận yêu cầu' arrow>
                            <span><button className='btn btn-warning' disabled={item.trangThai != 'CHO_XAC_NHAN'} onClick={e => e.preventDefault() || this.onReceive(item)}><i className='fa fa-lg fa-forward' content={item} /></button></span>
                        </Tooltip>}
                        {item.trangThai == 'TIEP_NHAN' && <Tooltip title='Xác thực hoàn tất' arrow>
                            <span><button className='btn btn-success' disabled={item.trangThai != 'TIEP_NHAN'} onClick={e => e.preventDefault() || this.onComplete(item)}><i className='fa fa-lg fa-check-square-o' content={item} /></button></span>
                        </Tooltip>}
                        <Tooltip title='Tải minh chứng' arrow disableHoverListener={!item.pathFolder}>
                            <button className='btn btn-warning' disabled={!item.pathFolder} onClick={e => e.preventDefault() || T.download(`/api/cb/tncn/ke-khai/tai-minh-chung/${item.id}`)}>
                                <i className='fa fa-download' />
                            </button>
                        </Tooltip>
                    </TableCell>

                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Quản lý đăng ký MST',
            breadcrumb: [
                'QL đăng ký MST'
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
                <EditModal ref={e => this.editModal = e} update={this.props.updateTcTncn} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcTncn: state.finance.tcTncn });
const mapActionsToProps = { getTcTncnPage, updateTcTncn, tiepNhanTncn, xacNhanTncn, deleteTcTncn };
export default connect(mapStateToProps, mapActionsToProps)(tcHoanDongHocPhiAdminPage);