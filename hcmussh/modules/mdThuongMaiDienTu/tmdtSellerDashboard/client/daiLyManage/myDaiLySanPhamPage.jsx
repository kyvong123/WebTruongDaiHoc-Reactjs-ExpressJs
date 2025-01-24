import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, TableHead, AdminModal, FormTextBox, FormCheckbox, FormSelect, getValue, FormImageMultiBox, FormEditor, FormRichTextBoxV2, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtSellerSanPhamPage, getTmdtSellerSanPhamDraftPage, createTmdtSellerSanPhamDraft, updateTmdtSellerSanPhamDraft, deleteTmdtSellerSanPham, clearUnsaveImages, toggleKichHoatTmdtSellerSanPham } from '../../redux/sanPhamRedux';
import { getTmdtSellerCauHinhDraftByDaiLyPage } from '../../redux/cauHinhSanPhamRedux';
import { getTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux.jsx';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux.jsx';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';

class EditSanPhamModal extends AdminModal {
    state = {};
    onShow = (data) => {
        this.props.clearImage();
        const { item, maDaiLy } = data;
        const { id, ten, moTa, maLoaiSanPham, maCode, tagList, gia, shippingInfo, paymentInfo, optionLable } = item ? item : { ten: '', moTa: '', id: null, maLoaiSanPham: null, maDaiLy: null, maCode: '', tagList: '', gia: '', shippingInfo: '', paymentInfo: '', optionLable: 'Loại sản phẩm' };
        this.setState({ id, ten, maDaiLy }, () => {
            this.ten.value(ten || '');
            this.gia.value(gia || '');
            this.maCode.value(maCode || '');
            this.moTa.value(moTa || '');
            this.maDaiLy.value(maDaiLy || null);
            this.maLoaiSanPham.value(maLoaiSanPham || null);
            this.tagList.value(tagList || null);
            this.shippingInfo.value(shippingInfo || '');
            this.paymentInfo.value(paymentInfo || '');
            this.optionLable.value(optionLable || 'Loại sản phẩm');
            this.imageMultiBox.clear();
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: getValue(this.ten),
                gia: getValue(this.gia),
                maCode: getValue(this.maCode),
                moTa: this.moTa.value(),
                maDaiLy: getValue(this.maDaiLy),
                maLoaiSanPham: getValue(this.maLoaiSanPham),
                tagList: getValue(this.tagList).toString(),
                shippingInfo: getValue(this.shippingInfo),
                paymentInfo: getValue(this.paymentInfo),
                optionLable: getValue(this.optionLable)
            };
            if (changes.ten == '') {
                this.ten.focus();
                T.notify('Không được để trống tên', 'danger');
            }
            else if (changes.maCode == '') {
                this.maCode.focus();
                T.notify('Không được để trống tên', 'danger');
            }
            else {
                if (this.state.id) {
                    this.props.update(this.state.maDaiLy, this.state.id, changes);
                } else {
                    this.props.create(this.state.maDaiLy, changes);
                }
                this.hide();
            }
        } catch (error) {
            console.error('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa thông tin sản phẩm' : 'Tạo sản phẩm mới',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect readOnly={true} className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                <FormTextBox type='number' className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                <FormTextBox readOnly={this.state.id ? true : false} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập tên sản phẩm' />
                <div className='col-12' ><FormEditor label='Bài viết mô tả sản phẩm (Vui lòng không upload hình)' ref={e => this.moTa = e} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                <FormSelect className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                <FormSelect multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                <FormRichTextBoxV2 className='col-12' maxLen={500} rows={5} ref={e => this.shippingInfo = e} type='text' label='Thông tin giao hàng' placeholder='Thông tin giao hàng ...' />
                <FormRichTextBoxV2 className='col-12' maxLen={500} rows={5} ref={e => this.paymentInfo = e} type='text' label='Thông tin thanh toán' placeholder='Thông tin thanh toán ...' />
                <FormTextBox className='col-12' ref={e => this.optionLable = e} type='text' label='Option label' placeholder='Option label' />
                <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl='/user/upload?category=tmdtDraftUpload' uploadType='tmdtDraftUpload' userData='tmdtDraftUpload' />
            </div>
        });
    };
}

class TMDTSellerSanPhamPage extends AdminPage {
    scrollStyle = { width: '600px', minHeight: '100px', maxHeight: '500px', overflowX: 'auto', overflowY: 'auto' };

    state = {
        maDaiLy: null,
        filter: {},
        sanPhamDraftFilter: {},
        cauHinhDraftFilter: {}
    };

    componentDidMount() {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/my-dai-ly/:id/san-pham'), maDaiLy = route.parse(window.location.pathname).id;
        this.setState({ maDaiLy, isLoading: true });
        T.ready('/user/tmdt/y-shop/seller/my-dai-ly/:id/san-pham', () => {
            this.getPage();
            this.getDraftPage();
            this.getCauHinhDraftPage();
            this.props.getTmdtDaiLy(maDaiLy);
            this.setState({ maDaiLy, isLoading: false });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtSellerSanPhamPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.filter, done);
    }

    getDraftPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtSellerSanPhamDraftPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.sanPhamDraftFilter, done);
    }

    getCauHinhDraftPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtSellerCauHinhDraftByDaiLyPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.cauHinhDraftFilter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleKeySearchDraft = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ sanPhamDraftFilter: { ...this.state.sanPhamDraftFilter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getDraftPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleKeySearchCauHinhDraft = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ cauHinhDraftFilter: { ...this.state.cauHinhDraftFilter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getCauHinhDraftPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const STATUS_MAPPER = {
            0: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đã chờ duyệt</span>,
            1: <span className='text-success'><i className='fa fa-check-circle' /> Chấp thuận</span>,
            2: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Từ chối (hết hạn hoặc đã sửa lại)</span>,
        };

        const daiLyInfo = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.item ? this.props.tmdtSellerMyDaiLy.item : null;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtSellerSanPham && this.props.tmdtSellerSanPham.page ?
            this.props.tmdtSellerSanPham.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const { pageNumber: pageNumberDraft, pageSize: pageSizeDraft, pageTotal: pageTotalDraft, totalItem: totalItemDraft, pageCondition: pageConditionDraft, list: listDraft } = this.props.tmdtSellerSanPham && this.props.tmdtSellerSanPham.draftPage ?
            this.props.tmdtSellerSanPham.draftPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const { pageNumber: pageNumberCauHinhDraft, pageSize: pageSizeCauHinhDraft, pageTotal: pageTotalCauHinhDraft, totalItem: totalItemCauHinhDraft, list: listCauHinhDraft } = this.props.tmdtSellerCauHinhSanPham && this.props.tmdtSellerCauHinhSanPham.cauHinhDraftPage ?
            this.props.tmdtSellerCauHinhSanPham.cauHinhDraftPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        let table = 'Vui lòng chọn đại lý trước!';
        let tableDraft = 'Vui lòng chọn đại lý trước!';
        let tableCauHinhDraft = 'Vui lòng chọn đại lý trước';
        if (this.state.maDaiLy) {
            table = renderDataTable({
                data: list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <TableHead ref={e => this.ks_ten = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='ten' />
                        <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Loại sản phẩm' />
                        <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Mã code' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='ma_code' />
                        <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                        <TableHead style={{ width: '300px', whiteSpace: 'nowrap' }} content='Tag' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin thanh toán' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin giao hàng' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' />
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.tenLoaiSanPham ? item.tenLoaiSanPham : ''} />
                        <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                        <TableCell type='number' content={item.gia ? item.gia : 0} />
                        <TableCell type='text' content={item.tagTenList ? item.tagTenList : ''} />
                        <TableCell type='text' content={item.paymentInfo ? item.paymentInfo : ''} />
                        <TableCell type='text' content={item.shippingInfo ? item.shippingInfo : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }} onChanged={(value) => T.confirm(value ? 'Hiện sản phẩm?' : 'Ẩn sản phẩm?', value ? 'Bạn có chắc bạn muốn hiện sản phẩm này?' : 'Bạn có chắc bạn muốn ẩn sản phẩm này?', 'warning', true, (isConfirm) => { isConfirm && this.props.toggleKichHoatTmdtSellerSanPham(this.state.maDaiLy, item.id, value ? 1 : 0); })} />
                        <TableCell type='buttons'>
                            {
                                <>
                                    <Tooltip title='Xem thông tin chi tiết sản phẩm' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/san-pham/${item.id}`)}>
                                        <button className='btn btn-primary'>
                                            <i className='fa-lg fa fa-envelope' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Xem các cấu hình sản phẩm' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/san-pham/cau-hinh/${item.id}`)}>
                                        <button className='btn btn-secondary'>
                                            <i className='fa-lg fa fa-gear' />
                                        </button>
                                    </Tooltip>
                                </>
                            }
                        </TableCell>
                    </tr >
                )
            });

            tableDraft = renderDataTable({
                data: listDraft, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <TableHead style={{ width: '50px', whiteSpace: 'nowrap' }} content='Mã tác vụ' />
                        <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Loại tác vụ' />
                        <TableHead ref={e => this.ks_ten = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.handleKeySearchDraft(ks)} keyCol='ten' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Mã code sản phẩm' onKeySearch={(ks) => this.handleKeySearchDraft(ks)} keyCol='ma_code' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Loại sản phẩm' />
                        <TableHead style={{ width: '300px', whiteSpace: 'nowrap' }} content='Tag' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin thanh toán' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Thông tin giao hàng' />
                        <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Trạng thái' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Lý do từ chối (nếu có)' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</TableHead>
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
                        <TableCell type='buttons'>
                            {
                                <>
                                    <Tooltip title='Xem thông tin chi tiết sản phẩm nháp ' arrow onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/san-pham-draft/${item.id}`)}>
                                        <button className='btn btn-primary'>
                                            <i className='fa-lg fa fa-envelope' />
                                        </button>
                                    </Tooltip>
                                </>
                            }
                        </TableCell>
                    </tr >
                )
            });

            tableCauHinhDraft = renderDataTable({
                data: listCauHinhDraft, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <TableHead style={{ width: '50px', whiteSpace: 'nowrap' }} content='Mã tác vụ' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Loại tác vụ' />
                        <TableHead ref={e => this.ks_ten_cau_hinh = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên cấu hình' onKeySearch={(ks) => this.handleKeySearchCauHinhDraft(ks)} keyCol='ten_cau_hinh' />
                        <TableHead ref={e => this.ks_ten_san_pham = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Tên sản phẩm' onKeySearch={(ks) => this.handleKeySearchCauHinhDraft(ks)} keyCol='ten_san_pham' />
                        <TableHead ref={e => this.ks_ten_san_pham = e} style={{ width: '100px', whiteSpace: 'nowrap' }} content='Mã code sản phẩm' onKeySearch={(ks) => this.handleKeySearchCauHinhDraft(ks)} keyCol='ma_code_san_pham' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                        <TableHead style={{ width: '200px', whiteSpace: 'nowrap' }} content='Trạng thái' />
                        <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Lý do từ chối (nếu có)' />
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.id ? item.id : ''} />
                        <TableCell type='text' content={item.tenDuyetType ? item.tenDuyetType : ''} />
                        <TableCell type='text' content={item.tenCauHinh ? item.tenCauHinh : ''} />
                        <TableCell type='text' content={item.tenSanPham ? item.tenSanPham : ''} />
                        <TableCell type='text' content={item.maCodeSanPham ? item.maCodeSanPham : ''} />
                        <TableCell type='number' content={item.giaCauHinh ? item.giaCauHinh : 0} />
                        <TableCell type='text' content={STATUS_MAPPER[item.tinhTrangDuyet]} />
                        <TableCell type='text' content={item.rejectComment} />
                    </tr >
                )
            });
        }

        let tabs = <FormTabs
            tabs={[
                {
                    title: 'Sản phẩm đăng bán', component: <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'><h3>Danh sách sản phẩm đăng bán của đại lý {this.state.tenDaiLy}</h3></div>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} />
                            </div>
                        </div>
                        {table}

                    </div>
                },
                {
                    title: 'Sản phẩm chờ duyệt', component: <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <h3>Danh sách cấu hình sản phẩm <strong>đang chờ duyệt</strong> của đại lý {this.state.tenDaiLy}</h3>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumberCauHinhDraft} pageSize={pageSizeCauHinhDraft} pageTotal={pageTotalCauHinhDraft} totalItem={totalItemCauHinhDraft} pageCondition={pageConditionDraft} getPage={this.getCauHinhDraftPage} />
                            </div>
                        </div>
                        {tableDraft}
                    </div>
                },
                {
                    title: 'Cấu hình sản phẩm chờ duyệt', component: <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <h3>Danh sách sản phẩm <strong>đang chờ duyệt</strong> của đại lý {this.state.tenDaiLy}</h3>
                            <div className='title'>
                                <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumberDraft} pageSize={pageSizeDraft} pageTotal={pageTotalDraft} totalItem={totalItemDraft} pageCondition={pageConditionDraft} getPage={this.getDraftPage} />
                            </div>
                        </div>
                        {tableCauHinhDraft}
                    </div>
                }
            ]}
        />;

        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: `Quản lý Danh sách Sản phẩm ${daiLyInfo?.ten} (${daiLyInfo?.maCode})`,
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={1} to='/user/tmdt/y-shop/seller/my-dai-ly'>Đại lý của tôi</Link>,
                'Quản lý Danh sách Sản phẩm Y-Shop'
            ],
            onCreate: this.state.maDaiLy ? () => this.modal.show({ maDaiLy: this.state.maDaiLy }) : null,
            content: <>
                {this.state.isLoading ?
                    (<div className='tile'>
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
                        {this.state.maDaiLy && tabs}
                    </>}
                <EditSanPhamModal clearImage={this.props.clearUnsaveImages} ref={e => this.modal = e} create={this.props.createTmdtSellerSanPhamDraft} update={this.props.updateTmdtSellerSanPhamDraft} />
            </>,
            backRoute: `/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerSanPham: state.tmdt.tmdtSellerSanPham, tmdtSellerCauHinhSanPham: state.tmdt.tmdtSellerCauHinhSanPham, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtSellerSanPhamPage, getTmdtSellerSanPhamDraftPage, createTmdtSellerSanPhamDraft, updateTmdtSellerSanPhamDraft, deleteTmdtSellerSanPham, clearUnsaveImages, toggleKichHoatTmdtSellerSanPham, getTmdtSellerCauHinhDraftByDaiLyPage, getTmdtDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(TMDTSellerSanPhamPage);