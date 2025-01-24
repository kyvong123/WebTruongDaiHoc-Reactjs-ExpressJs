import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, TableHead, FormCheckbox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtSellerDonHangDaiLyPage, confirmTmdtNewOrder, denyTmdtNewOrder, confirmTmdtOrderPurchase, closeTmdtOrder, confirmPurchaseTmdtOrder, setTmdtOrderDeliveryDone, setTmdtOrderDelivering } from '../../redux/donHangRedux';
import { getTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';
import { Tooltip } from '@mui/material';
import { Img } from 'view/component/HomePage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

const STATUS_MAPPER = {
    0: <span className='text-secondary'><i className='fa fa-question-circle' /> Chưa xác định</span>,
    1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Chờ xác nhận</span>,
    2: <span className='text-info'><i className='fa fa-exclamation-circle' /> Đang xử lý</span>,
    3: <span className='text-success'><i className='fa fa-check-circle' /> Kết thúc</span>,
    4: <span className='text-muted'><i className='fa fa-times' /> Khách huỷ</span>,
    5: <span className='text-muted'><i className='fa fa-times' /> Shop từ chối</span>,
};

const GIAO_HANG_STATUS_MAPPER = {
    0: <span className='text-secondary'><i className='fa fa-question-circle' /> Chưa xác định</span>,
    1: <span className='text-secondary'><i className='fa fa-exclamation-circle' /> Đang trong kho</span>,
    2: <span className='text-info'><i className='fa fa-exclamation-circle' /> Đang giao hàng</span>,
    3: <span className='text-success'><i className='fa fa-check-circle' /> Đã giao thành công</span>,
    4: <span className='text-danger'><i className='fa fa-times' /> Giao hàng thất bại</span>,
};

const THANH_TOAN_STATUS_MAPPER = {
    0: <span className='text-secondary'><i className='fa fa-question-circle' /> Chưa xác định</span>,
    1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Chờ thanh toán</span>,
    2: <span className='text-success'><i className='fa fa-check-circle' /> Đã thanh toán</span>,
};

class DonHangDetailModal extends AdminModal {
    onShow = (data) => {
        const { id, maDon, maDaiLy, tenDaiLy, tongTien, trangThai, ngayDat, shippingMethod, userEmail, hoNguoiDat, tenNguoiDat, itemList, phoneNumber, mucGiam, voucherName } = data;
        this.setState({ id, maDon, maDaiLy, tenDaiLy, tongTien, trangThai, ngayDat, shippingMethod, userEmail, hoNguoiDat, tenNguoiDat, itemList, phoneNumber, mucGiam, voucherName });
    };

    render = () => {
        const table = renderDataTable({
            data: this.state.itemList, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Tên đơn hàng' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Hình ảnh sản phẩm' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Tên cấu hình' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Đơn giá' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Số lượng' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.tenSanPham ? item.tenSanPham : ''} />
                    <TableCell type='text' content={<Img height={200} src={item.image} />} />
                    <TableCell type='text' content={item.tenConfig ? item.tenConfig : 'Cấu hình mặc định'} />
                    <TableCell type='text' content={item.gia} />
                    <TableCell type='text' content={item.soLuong} />
                </tr >
            )
        });
        return this.renderModal({
            title: `Thông tin chi tiết đơn hàng mã ${this.state.id}`,
            size: 'elarge',
            body: <div className='row d-flex flex-wrap'>
                <div className='col-12'><p>Người đặt hàng: {`${this.state.hoNguoiDat} ${this.state.tenNguoiDat}`}</p></div>
                <div className='col-12'><p>Email: {`${this.state.userEmail}`}</p></div>
                <div className='col-12'><p>Số điện thoại: {`${this.state.phoneNumber ?? 'Chưa xác định'}`}</p></div>
                <div className='col-12'><p>Ngày đặt: {`${T.convertDate(this.state.ngayDat)}`}</p></div>
                <div className='col-12'><p>Trạng thái đơn hàng: {STATUS_MAPPER[this.state.trangThai]}</p></div>
                <div className='col-12'><p>Trạng thái giao hàng: {GIAO_HANG_STATUS_MAPPER[this.state.trangThaiGiaoHang]}</p></div>
                <div className='col-12'><p>Trạng thái thanh toán: {THANH_TOAN_STATUS_MAPPER[this.state.trangThaiThanhToan]}</p></div>
                <div className='col-12'>{table}</div>
                <div className='col-9' style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>Tổng tiền hàng:</div>
                <div className='col-3' style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>{T.numberDisplay(this.state.tongTien)} đ</div>
                <div className='col-9' style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>Mã Giảm giá:</div>
                <div className='col-3' style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>{this.state.voucherName} </div>
                <div className='col-9' style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>Giảm giá:</div>
                <div className='col-3' style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>{T.numberDisplay(this.state.mucGiam)} đ</div>
                <div className='col-9' style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>Tổng thanh toán:</div>
                <div className='col-3' style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>{T.numberDisplay(this.state.tongTien - this.state.mucGiam)} đ</div>
            </div>
        });
    };
}

class TMDTSellerDonHangPage extends AdminPage {
    scrollStyle = { width: '600px', minHeight: '100px', maxHeight: '500px', overflowX: 'auto', overflowY: 'auto' };

    state = {
        maDaiLy: null,
        filter: {},
    };

    componentDidMount() {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/my-dai-ly/:id/don-hang'), maDaiLy = route.parse(window.location.pathname).id;
        this.setState({ maDaiLy, isLoading: true });
        T.ready('/user/tmdt/y-shop/seller/my-dai-ly/:id/don-hang', () => {
            T.clearSearchBox();
            T.onSearch = this.onSearchBar;
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.changeAdvancedSearch();
            this.props.getTmdtDaiLy(maDaiLy, () => {
                this.setState({ isLoading: false });
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        this.hideAdvanceSearch();
        if (isReset) {
            this.setState({ filter: {} }, () => this.getPage());
        } else {
            this.getPage();
        }
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtSellerDonHangDaiLyPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }


    setTrangThaiXacNhan = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận đơn hàng', 'Bạn có chắc bạn muốn xác nhận đơn hàng này?', true, isConfirm => isConfirm && this.props.confirmTmdtNewOrder(this.state.maDaiLy, item.id));
    }
    setTrangThaiTuChoi = (e, item) => {
        e.preventDefault();
        T.confirm('Từ chối đơn hàng', 'Bạn có chắc bạn muốn từ chối đơn hàng này?', true, isConfirm => isConfirm && this.props.denyTmdtNewOrder(this.state.maDaiLy, item.id));
    }
    setTrangThaiKetThuc = (e, item) => {
        e.preventDefault();
        T.confirm('Kết thúc đơn hàng', 'Bạn có chắc bạn muốn kết thúc đơn hàng này?', true, isConfirm => isConfirm && this.props.closeTmdtOrder(this.state.maDaiLy, item.id));
    }


    setThanhToanThanhCong = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận thanh toán', 'Bạn có chắc bạn xác nhận khách đã thanh toán đơn hàng này?', true, isConfirm => isConfirm && this.props.confirmPurchaseTmdtOrder(this.state.maDaiLy, item.id));
    }


    setGiaoHangDangGiao = (e, item) => {
        e.preventDefault();
        T.confirm('Đang giao hàng', 'Bạn có chắc bạn muốn xác nhận đang giao hàng đơn hàng này?', true, isConfirm => isConfirm && this.props.setTmdtOrderDelivering(this.state.maDaiLy, item.id));
    }
    setGiaoHangThanhCong = (e, item) => {
        e.preventDefault();
        T.confirm('Giao hàng thành công', 'Bạn có chắc bạn muốn xác nhận giao hàng thành công đơn hàng này?', true, isConfirm => isConfirm && this.props.setTmdtOrderDeliveryDone(this.state.maDaiLy, item.id));
    }


    generateTrangThaiButtons = (item) => {
        const buttonToolTips = [];
        if (item.trangThai == 1) {
            buttonToolTips.push(<Tooltip title='Xác nhận đơn hàng' arrow>
                <button className='btn btn-success' onClick={(e) => this.setTrangThaiXacNhan(e, item)}>
                    <i className='fa-lg fa fa-check' />
                </button>
            </Tooltip>);
            buttonToolTips.push(<Tooltip title='Từ chối đơn hàng' arrow>
                <button className='btn btn-danger' onClick={(e) => this.setTrangThaiTuChoi(e, item)}>
                    <i className='fa-lg fa fa-times' />
                </button>
            </Tooltip>);
        } else if (item.trangThai == 2) {
            buttonToolTips.push(<Tooltip title='Kết thúc đơn hàng' arrow>
                <button className='btn btn-success' onClick={(e) => this.setTrangThaiKetThuc(e, item)}>
                    <i className='fa-lg fa fa-check-square' />
                </button>
            </Tooltip>);
        }
        return <>{buttonToolTips}</>;
    }
    generateTrangThaiGiaoHangButtons = (item) => {
        const buttonToolTips = [];
        if (item.trangThaiGiaoHang == 1) {
            buttonToolTips.push(<Tooltip title='Đang giao hàng' arrow>
                <button className='btn btn-secondary' onClick={(e) => this.setGiaoHangDangGiao(e, item)}>
                    <i className='fa-lg fa fa-truck' />
                </button>
            </Tooltip>);
        }
        else if (item.trangThaiGiaoHang == 2) {
            buttonToolTips.push(<Tooltip title='Giao thành công' arrow>
                <button className='btn btn-success' onClick={(e) => this.setGiaoHangThanhCong(e, item)}>
                    <i className='fa-lg fa fa-truck' />
                </button>
            </Tooltip>);
        }
        return <>{buttonToolTips}</>;
    }
    generateTrangThaiThanhToanButtons = (item) => {
        const buttonToolTips = [];
        if (item.trangThaiThanhToan == 1) {
            buttonToolTips.push(
                <Tooltip title='Đã thanh toán' arrow>
                    <button className='btn btn-success' onClick={(e) => this.setThanhToanThanhCong(e, item)}>
                        <i className='fa-lg fa fa-credit-card' />
                    </button>
                </Tooltip>
            );
        }
        return <>{buttonToolTips}</>;
    }

    render() {
        const daiLyInfo = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.item ? this.props.tmdtSellerMyDaiLy.item : null;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtSellerDonHang && this.props.tmdtSellerDonHang.page ?
            this.props.tmdtSellerDonHang.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='#' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Mã đơn hàng' />
                    <TableHead style={{ width: '300px', whiteSpace: 'nowrap' }} content='Ngày đặt' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Người đặt hàng' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Mã Voucher' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Thanh toán (VNĐ)' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Chi tiết đơn' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Trạng thái đơn' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác trạng thái' />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Trạng thái thanh toán' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={<>Thao tác trạng<br /> thái thanh toán</>} />
                    <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Trạng thái giao hàng' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={<>Thao tác trạng<br /> thái giao hàng</>} />
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' content={item.R ? item.R : ''} />
                        <TableCell type='text' content={item.id ? item.id : ''} />
                        <TableCell type='text' content={item.ngayDat ? T.convertDate(item.ngayDat) : ''} />
                        <TableCell type='text' content={<p>{`${item.hoNguoiDat} ${item.tenNguoiDat}`}<br />{`Email: ${item.userEmail}`}<br />{`SĐT: ${item.phoneNumber ?? 'Chưa xác định'}`}</p>} />
                        <TableCell type='text' content={item.voucher && item.voucher.name ? item.voucher.name : ''} />
                        <TableCell type='number' content={<p>{`Tổng tiền hàng: ${T.numberDisplay(item.tongTien) ?? 0}`} <br />{`Giảm giá: ${T.numberDisplay(item.mucGiam)}`}<br />{`Tổng Thanh toán: ${item.tongTien ? T.numberDisplay(item.tongTien - item.mucGiam) : 0}`}</p>} />
                        <TableCell type='buttons'>
                            {
                                <>
                                    <Tooltip title='Xem thông tin đơn hàng' arrow>
                                        <button className='btn btn-primary' onClick={() => this.detailModal.show(item)}>
                                            <i className='fa-lg fa fa-envelope' />
                                        </button>
                                    </Tooltip>
                                </>
                            }
                        </TableCell>
                        <TableCell type='text' content={STATUS_MAPPER[item.trangThai ? item.trangThai : 0]} />
                        <TableCell type='buttons'>
                            {
                                <>
                                    {this.generateTrangThaiButtons(item)}
                                </>
                            }
                        </TableCell>
                        <TableCell type='text' content={THANH_TOAN_STATUS_MAPPER[item.trangThaiThanhToan ? item.trangThaiThanhToan : 0]} />
                        <TableCell type='buttons'>
                            {
                                <>
                                    {this.generateTrangThaiThanhToanButtons(item)}
                                </>
                            }
                        </TableCell>
                        <TableCell type='text' content={GIAO_HANG_STATUS_MAPPER[item.trangThaiGiaoHang ? item.trangThaiGiaoHang : 0]} />
                        <TableCell type='buttons'>
                            {
                                <>
                                    {this.generateTrangThaiGiaoHangButtons(item)}
                                </>
                            }
                        </TableCell>
                    </tr >
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: `Quản lý Đơn hàng ${daiLyInfo?.ten} (${daiLyInfo?.maCode})`,
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={1} to='/user/tmdt/y-shop/seller/my-dai-ly'>Đại lý của tôi</Link>,
                'Quản lý Đơn hàng Y-Shop'
            ],
            advanceSearchTitle: 'Lọc đơn hàng',
            advanceSearch: <>
                <div className='d-flex justify-content-between flex-wrap'>
                    <FormSelect label='Trạng thái đơn hàng' className='p-2 col-4' value={0} data={[
                        { id: 0, text: 'Không xác định' },
                        { id: 1, text: 'Chờ xác nhận' },
                        { id: 2, text: 'Đang xử lý' },
                        { id: 3, text: 'Đã kết thúc' },
                        { id: 4, text: 'Đã huỷ' },
                        { id: 5, text: 'Shop từ chối' },
                    ]} onChange={value => { this.state.filter.trangThai = value.id; }} />
                    <FormSelect label='Trạng thái thanh toán' className='p-2 col-4' value={0} data={[
                        { id: 0, text: 'Không xác định' },
                        { id: 1, text: 'Chờ thanh toán' },
                        { id: 2, text: 'Đã thanh toán' },
                    ]} onChange={value => { this.state.filter.trangThaiThanhToan = value.id; }} />
                    <FormSelect label='Trạng thái giao hàng' className='p-2 col-4' value={0} data={[
                        { id: 0, text: 'Chưa xác định' },
                        { id: 1, text: 'Đang trong kho' },
                        { id: 2, text: 'Đang giao hàng' },
                        { id: 3, text: 'Đã giao hàng' },
                    ]} onChange={value => { this.state.filter.trangThaiGiaoHang = value.id; }} />
                    <FormDatePicker type='time' ref={e => this.fromNhapHoc = e} className='p-2 col-4' label='Ngày đặt đơn từ' onChange={value => { this.state.filter.fromNgayDat = value ? value.getTime() : ''; }} />
                    <FormDatePicker type='time' ref={e => this.toNhapHoc = e} className='p-2 col-4' label='Đến' onChange={value => { this.state.filter.toNgayDat = value ? value.getTime() : ''; }} />
                    <div className='col-12 py-3' style={{ textAlign: 'right' }}>
                        <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.changeAdvancedSearch(true)} style={{ marginRight: '15px' }}>
                            <i className='fa fa-lg fa-times' />Reset
                        </button>
                        <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                {this.state.maDaiLy && <div className='tile'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                        <div className='title'><h3>Đơn hàng của đại lý {this.state.tenDaiLy}</h3></div>
                        <div className='title'>
                            <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                        </div>
                        <div className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} />
                        </div>
                    </div>
                    {table}
                </div>}
                <DonHangDetailModal ref={e => this.detailModal = e} />
            </>,
            backRoute: `/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`,
            collapse: [
                {
                    icon: 'fa-download', name: 'Xuất excel', permission: true, type: 'success', onClick: (e) => {
                        e.preventDefault();
                        const { fromNgayDat, toNgayDat, trangThai } = this.state.filter ? this.state.filter : { fromNgayDat: null, toNgayDat: null, trangThai: null };
                        T.handleDownload(`/api/tmdt/y-shop/seller/download-excel/du-lieu-don-hang/${this.state.maDaiLy ? this.state.maDaiLy : null}/${fromNgayDat ? fromNgayDat : null}/${toNgayDat ? toNgayDat : null}/${trangThai ? trangThai : null}`, 'donHang.xlsx');
                    }
                },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerDonHang: state.tmdt.tmdtSellerDonHang, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtSellerDonHangDaiLyPage, confirmTmdtNewOrder, denyTmdtNewOrder, confirmTmdtOrderPurchase, getTmdtDaiLy, closeTmdtOrder, confirmPurchaseTmdtOrder, setTmdtOrderDeliveryDone, setTmdtOrderDelivering };
export default connect(mapStateToProps, mapActionsToProps)(TMDTSellerDonHangPage);