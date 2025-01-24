import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, TableHead, FormCheckbox, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtAdminSanPhamPage, createTmdtAdminSanPham, updateTmdtAdminSanPham, deleteTmdtAdminSanPham, clearUnsaveImages, toggleKichHoatTmdtAdminSanPham } from './redux/sanPhamRedux';
import { getTmdtAdminDuyetTaskPage, rejectSanPhamDuyetTask, approveCreateSanPhamDuyetTask, approveUpdateSanPhamDuyetTask } from './redux/sanPhamDuyetTaskRedux';
import { getTmdtAdminCauHinhDuyetTask, approveCreateCauHinhDuyetTask, approveUpdateCauHinhDuyetTask, rejectCauHinhDuyetTask } from './redux/cauHinhDuyetTaskRedux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import EditSanPhamModal from './modal/EditSanPhamModal';
import RejectSanPhamModal from './modal/RejectSanPhamModal';
import RejectCauHinhModal from './modal/RejectCauHinhModal';

class TMDTAdminPage extends AdminPage {
    scrollStyle = { width: '600px', minHeight: '100px', maxHeight: '500px', overflowX: 'auto', overflowY: 'auto' };

    state = { filter: {} };

    componentDidMount() {
        this.setState({ isLoading: true });
        T.ready('/user/tmdt/y-shop/admin', () => {
            this.props.clearUnsaveImages();
            this.props.getTmdtAdminSanPhamPage();
            this.props.getTmdtAdminDuyetTaskPage();
            this.props.getTmdtAdminCauHinhDuyetTask();
            this.setState({ isLoading: false });
        });
    }

    /**
     * Sản phẩm
     */
    getSanPhamPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtAdminSanPhamPage(pageN, pageS, pageC, this.state.filter, done);
    }
    sanPhamHandleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getSanPhamPage(pageNumber, pageSize, pageCondition);
        });
    }
    deleteSanPham = (item) => {
        T.confirm('Xóa sản phẩm?', 'Bạn có chắc bạn muốn xóa sản phẩm này?', 'warning', true, (isConfirm) => {
            isConfirm && this.props.deleteTmdtAdminSanPham(item.id);
        });
    }

    /**
     * Duyệt sản phẩm
     */
    getDuyetSanPhamPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtAdminDuyetTaskPage(pageN, pageS, pageC, this.state.filter, done);
    }
    approveSanPham = (e, item) => {
        e.preventDefault();
        T.confirm('Duyệt thêm/cập nhật sản phẩm', `Chấp thuận yêu cầu ${item.maDuyetType == 1 ? 'tạo' : 'chỉnh sửa thông tin'} sản phẩm?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                if (item.maDuyetType == 1) {
                    this.props.approveCreateSanPhamDuyetTask(item.id);
                } else if (item.maDuyetType == 2) {
                    this.props.approveUpdateSanPhamDuyetTask(item.id);
                }
            }
        });
    }
    rejectSanPham = (e, item) => {
        e.preventDefault();
        this.rejectSanPhamModal.show(item);
    }
    duyetSanPhamHandleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getDuyetSanPhamPage(pageNumber, pageSize, pageCondition);
        });
    }

    /**
     * Duyệt cấu hình sản phẩm
     */
    getCauHinhPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtAdminCauHinhDuyetTask(pageN, pageS, pageC, this.state.filter, done);
    }
    duyetCauHinhHandleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getCauHinhPage(pageNumber, pageSize, pageCondition);
        });
    }
    approveCauHinh = (e, item) => {
        e.preventDefault();
        T.confirm(`Duyệt ${item.maDuyetType == 4 ? 'tạo' : 'chỉnh sửa thông tin'} cấu hình sản phẩm`, `Chấp thuận yêu cầu ${item.maDuyetType == 4 ? 'tạo' : 'chỉnh sửa thông tin'} cấu hình sản phẩm?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                if (item.maDuyetType == 4) {
                    this.props.approveCreateCauHinhDuyetTask(item.id);
                } else if (item.maDuyetType == 5) {
                    this.props.approveUpdateCauHinhDuyetTask(item.id);
                }
            }
        });
    }
    rejectCauHinh = (e, item) => {
        e.preventDefault();
        this.rejectCauHinhModal.show(item);
    }


    render() {
        const STATUS_MAPPER = {
            0: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đã chờ duyệt</span>,
            1: <span className='text-success'><i className='fa fa-check-circle' /> Chấp thuận</span>,
            2: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Từ chối (hết hạn hoặc đã sửa lại)</span>,
        };

        /**
         * Sản phẩm
         */
        const devPermission = this.getUserPermission('developer', ['login']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtAdminSanPham && this.props.tmdtAdminSanPham.page ? this.props.tmdtAdminSanPham.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const sanPhamTable = renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead ref={e => this.ks_ten = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.sanPhamHandleKeySearch(ks)} keyCol='ten' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Mã code sản phẩm' onKeySearch={(ks) => this.sanPhamHandleKeySearch(ks)} keyCol='ma_code' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Đại lý' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Loại sản phẩm' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                    <TableCell type='text' content={item.tenDaiLy ? item.tenDaiLy : ''} />
                    <TableCell type='number' content={item.gia ? item.gia : 0} />
                    <TableCell type='text' content={item.tenLoaiSanPham ? item.tenLoaiSanPham : ''} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }} onChanged={
                        (value) => T.confirm(value ? 'Hiện sản phẩm?' : 'Ẩn sản phẩm?', value ? 'Bạn có chắc bạn muốn hiện sản phẩm này?' : 'Bạn có chắc bạn muốn ẩn sản phẩm này?', 'warning', true, (isConfirm) => { isConfirm && this.props.toggleKichHoatTmdtAdminSanPham(item.id, value ? 1 : 0); })
                    } />
                    <TableCell type='buttons'>
                        {
                            <>
                                <Tooltip title='Xem thông tin chi tiết sản phẩm' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/admin/san-pham/${item.id}`)}>
                                    <button className='btn btn-primary'>
                                        <i className='fa-lg fa fa-envelope' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Xem các cấu hình sản phẩm' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/admin/san-pham/${item.id}/cau-hinh`)}>
                                    <button className='btn btn-secondary'>
                                        <i className='fa-lg fa fa-gear' />
                                    </button>
                                </Tooltip>
                                {devPermission && devPermission.login && <Tooltip title='Xóa sản phẩm' arrow onClick={() => this.deleteSanPham(item)}>
                                    <button className='btn btn-danger'>
                                        <i className='fa-lg fa fa-times' />
                                    </button>
                                </Tooltip>}
                            </>
                        }
                    </TableCell>
                </tr >
            )
        });

        /**
         * Duyệt sản phẩm
         */
        const { pageNumber: duyetSanPhamPageNumber, pageSize: duyetSanPhamPageSize, pageTotal: duyetSanPhamPageTotal, totalItem: duyetSanPhamTotalItem, pageCondition: duyetSanPhamPageCondition, list: duyetSanPhamList } = this.props.tmdtAdminDuyetTask && this.props.tmdtAdminDuyetTask.page ?
            this.props.tmdtAdminDuyetTask.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const duyetSanPhamTable = renderDataTable({
            data: duyetSanPhamList, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Mã tác vụ' />
                    <TableHead style={{ width: '150px', whiteSpace: 'nowrap' }} content='Loại tác vụ' />
                    <TableHead ref={e => this.ks_ten = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.duyetSanPhamHandleKeySearch(ks)} keyCol='ten' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Mã code sản phẩm' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Loại sản phẩm' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Tag sản phẩm' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin thanh toán' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin giao hàng' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Trạng thái' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Lý do từ chối (nếu có)' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.id ? item.id : ''} />
                    <TableCell type='text' content={item.tenDuyetType ? item.tenDuyetType : ''} />
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                    <TableCell type='number' content={item.gia ? item.gia : 0} />
                    <TableCell type='text' content={item.tenLoaiSanPham ? item.tenLoaiSanPham : ''} />
                    <TableCell type='text' content={item.tagTenList ? item.tagTenList : ''} />
                    <TableCell type='text' content={item.paymentInfo ? item.paymentInfo : ''} />
                    <TableCell type='text' content={item.shippingInfo ? item.shippingInfo : ''} />
                    <TableCell type='text' content={STATUS_MAPPER[item.tinhTrangDuyet]} />
                    <TableCell type='text' content={item.rejectComment} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons'>
                        {
                            <>
                                <Tooltip title='Xem thông tin chi tiết sản phẩm' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/admin/san-pham-duyet/${item.id}`)}>
                                    <button className='btn btn-secondary'>
                                        <i className='fa-lg fa fa-envelope' />
                                    </button>
                                </Tooltip>
                                {item.tinhTrangDuyet == 0 && <>
                                    <Tooltip title='Approve' arrow onClick={(e) => this.approveSanPham(e, item)}>
                                        <button className='btn btn-success'>
                                            <i className='fa-lg fa fa-check' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Reject' arrow onClick={(e) => this.rejectSanPham(e, item)}>
                                        <button className='btn btn-danger'>
                                            <i className='fa-lg fa fa-times' />
                                        </button>
                                    </Tooltip>
                                </>}
                            </>
                        }
                    </TableCell>
                </tr >
            )
        });

        /**
         * Duyệt cấu hình
         */
        const { pageNumber: duyetCauHinhPageNumber, pageSize: duyetCauHinhPageSize, pageTotal: duyetCauHinhPageTotal, totalItem: duyetCauHinhTotalItem, pageCondition: duyetCauHinhPageCondition, list: duyetCauHinhList } = this.props.tmdtAdminCauHinhDuyetTask && this.props.tmdtAdminCauHinhDuyetTask.page ?
            this.props.tmdtAdminCauHinhDuyetTask.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let duyetCauHinhTable = renderDataTable({
            data: duyetCauHinhList, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: '50px', whiteSpace: 'nowrap' }} content='Mã tác vụ' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Loại tác vụ' />
                    <TableHead ref={e => this.ks_ten_cau_hinh = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên cấu hình' onKeySearch={(ks) => this.duyetCauHinhHandleKeySearch(ks)} keyCol='ten_cau_hinh' />
                    <TableHead ref={e => this.ks_ten_san_pham = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.duyetCauHinhHandleKeySearch(ks)} keyCol='ten_san_pham' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giá cấu hình (VNĐ)' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Trạng thái' />
                    <TableHead style={{ width: '600px', whiteSpace: 'nowrap' }} content='Lý do từ chối (nếu có)' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.id ? item.id : ''} />
                    <TableCell type='text' content={item.tenDuyetType ? item.tenDuyetType : ''} />
                    <TableCell type='text' content={item.tenCauHinh ? item.tenCauHinh : ''} />
                    <TableCell type='link' onClick={() => this.props.history.push(`/user/tmdt/y-shop/admin/san-pham/${item.maSanPham}`)} content={item.tenSanPham ? item.tenSanPham : ''} />
                    <TableCell type='number' content={item.giaCauHinh ? item.giaCauHinh : 0} />
                    <TableCell type='text' content={STATUS_MAPPER[item.tinhTrangDuyet]} />
                    <TableCell type='text' content={item.rejectComment} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons'>
                        {
                            <>
                                <Tooltip title='Xem thông tin sản phẩm của cấu hình' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/admin/san-pham/${item.maSanPham}`)}>
                                    <button className='btn btn-secondary'>
                                        <i className='fa-lg fa fa-envelope' />
                                    </button>
                                </Tooltip>
                                {item.tinhTrangDuyet == 0 && <>
                                    <Tooltip title='Approve' arrow onClick={(e) => this.approveCauHinh(e, item)}>
                                        <button className='btn btn-success'>
                                            <i className='fa-lg fa fa-check' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Reject' arrow onClick={(e) => this.rejectCauHinh(e, item)}>
                                        <button className='btn btn-danger'>
                                            <i className='fa-lg fa fa-times' />
                                        </button>
                                    </Tooltip>
                                </>}
                            </>
                        }
                    </TableCell>
                </tr >
            )
        });

        let tabs = <FormTabs
            tabs={[
                {
                    title: 'Sản phẩm', component: <div className='tile'>
                        <h3>Danh sách Sản phẩm Y-Shop</h3>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getSanPhamPage} />
                            </div>
                        </div>
                        {sanPhamTable}
                    </div>
                },
                {
                    title: 'Duyệt sản phẩm', component: <div className='tile'>
                        <h3>Duyệt Sản phẩm Y-Shop</h3>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={duyetSanPhamPageNumber} pageSize={duyetSanPhamPageSize} pageTotal={duyetSanPhamPageTotal} totalItem={duyetSanPhamTotalItem} pageCondition={duyetSanPhamPageCondition} getPage={this.getDuyetSanPhamPage} />
                            </div>
                        </div>
                        {duyetSanPhamTable}
                    </div>
                },
                {
                    title: 'Duyệt cấu hình sản phẩm', component: <div className='tile'>
                        <h3>Duyệt Cấu hình Sản phẩm Y-Shop</h3>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={duyetCauHinhPageNumber} pageSize={duyetCauHinhPageSize} pageTotal={duyetCauHinhPageTotal} totalItem={duyetCauHinhTotalItem} pageCondition={duyetCauHinhPageCondition} getPage={this.getCauHinhPage} />
                            </div>
                        </div>
                        {duyetCauHinhTable}
                    </div>
                }
            ]}
        />;

        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: 'Danh sách Sản phẩm',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                'Danh sách Sản phẩm'
            ],
            onCreate: () => this.editSanPhamModal.show(),
            content: <>{
                this.state.isLoading ? (<div className='tile'>
                    <div className='overlay' style={{ minHeight: '120px' }}>
                        <div className='m-loader mr-4'>
                            <svg className='m-circular' viewBox='25 25 50 50'>
                                <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                            </svg>
                        </div>
                        <h3 className='l-text'>Đang tải</h3>
                    </div>
                </div>)
                    :
                    <>
                        {tabs}
                    </>}
                <EditSanPhamModal ref={e => this.editSanPhamModal = e} create={this.props.createTmdtAdminSanPham} update={this.props.updateTmdtAdminSanPham} clearImage={this.props.clearUnsaveImages} />
                <RejectSanPhamModal ref={e => this.rejectSanPhamModal = e} reject={this.props.rejectSanPhamDuyetTask} />
                <RejectCauHinhModal ref={e => this.rejectCauHinhModal = e} reject={this.props.rejectCauHinhDuyetTask} />
            </>,
            backRoute: '/user/tmdt/y-shop',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtAdminSanPham: state.tmdt.tmdtAdminSanPham, tmdtAdminDuyetTask: state.tmdt.tmdtAdminDuyetTask, tmdtAdminCauHinhDuyetTask: state.tmdt.tmdtAdminCauHinhDuyetTask });
const mapActionsToProps = { getTmdtAdminSanPhamPage, createTmdtAdminSanPham, updateTmdtAdminSanPham, deleteTmdtAdminSanPham, clearUnsaveImages, toggleKichHoatTmdtAdminSanPham, getTmdtAdminDuyetTaskPage, rejectSanPhamDuyetTask, approveCreateSanPhamDuyetTask, approveUpdateSanPhamDuyetTask, getTmdtAdminCauHinhDuyetTask, approveCreateCauHinhDuyetTask, approveUpdateCauHinhDuyetTask, rejectCauHinhDuyetTask };
export default connect(mapStateToProps, mapActionsToProps)(TMDTAdminPage);