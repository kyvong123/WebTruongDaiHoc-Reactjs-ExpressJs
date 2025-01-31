import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTmdtAdminCauHinhBySanPhamId, createTmdtAdminCauHinh, updateTmdtAdminCauHinh, deleteTmdtAdminCauHinh } from './redux/cauHinhSanPhamRedux';
import { FormImageBox, AdminPage, TableCell, renderDataTable, TableHead, AdminModal, FormTextBox, FormCheckbox, getValue, FormSelect, FormEditor } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';

class EditCauHinhModal extends AdminModal {
    state = {};

    onShow = (data) => {
        const { item, maSanPham } = data ? data : { item: null, maSanPham: null };
        console.log('maSanPham', maSanPham);
        const { id, ten, gia } = item ? item : { ten: '', gia: '', id: null, image: '' };
        this.setState({ id, maSanPham }, () => {
            this.ten.value(ten || '');
            this.gia.value(gia || '');
            // this.image.value(image || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();

        try {
            const changes = {
                ten: getValue(this.ten),
                gia: getValue(this.gia),
                // image: getValue(this.image),
            };
            if (changes.ten == '') {
                this.ten.focus();
                T.notify('Không được để trống tên', 'danger');
            } else {
                if (this.state.id) {
                    this.props.update(this.state.maSanPham, this.state.id, changes);
                } else {
                    this.props.create(this.state.maSanPham, changes);
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
            title: this.state.id ? 'Chỉnh sửa cấu hình sản phẩm' : 'Tạo cấu hình sản phẩm mới',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên cấu hình' required placeholder='Nhập tên cấu hình' />
                <FormTextBox type='number' className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá cấu hình' />
                <FormImageBox className='col-12' ref={e => this.imageBox = e} label='Tải hình đính kèm tại đây' postUrl='/user/upload?category=tmdtCauHinhSpUploadFile' uploadType='tmdtCauHinhSpUploadFile' userData='tmdtCauHinhSpUploadFile' />
            </div>
        });
    };
}

class CauHinhAdminDetailPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/tmdt/y-shop/admin/san-pham/cau-hinh', () => {
            this.getData();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/tmdt/y-shop/admin/san-pham/:id/cau-hinh'), maSanPham = route.parse(window.location.pathname).id;
        this.setState({ maSanPham });
        this.props.getTmdtAdminCauHinhBySanPhamId(maSanPham, data => {
            if (data.error) {
                T.notify('Lấy cấu hình sản phảm bị lỗi!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            } else if (data.items || data.spItem) {
                this.setState({ maSanPham });
                const { id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, tagList, maCode, imagesUrl, gia, shippingInfo, paymentInfo } = data.spItem;
                this.setState({ id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, tagList, maCode, imagesUrl, gia, shippingInfo, paymentInfo }, () => {
                    this.ten.value(this.state.ten || '');
                    this.maCode.value(this.state.maCode) || '';
                    this.gia.value(this.state.gia || 0);
                    this.moTa.value(this.state.moTa || '');
                    this.shippingInfo.value(this.state.shippingInfo || '');
                    this.paymentInfo.value(this.state.paymentInfo || '');
                    this.maLoaiSanPham.value(this.state.maLoaiSanPham);
                    this.maDaiLy.value(this.state.maDaiLy);
                    this.tagList.value(this.state.tagList ? this.state.tagList.split(',') : []);
                });
            } else {
                T.notify('Không lấy được cấu hình của sản phẩm này!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            }
        });
    }

    delete = (item) => {
        T.confirm('Xóa cấu hình sản phẩm', 'Bạn có chắc bạn muốn xóa cấu hình sản phẩm này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTmdtAdminCauHinh(this.state.maSanPham, item.id);
        });
    }

    render() {
        const devPermission = this.getUserPermission('developer', ['login']);
        const cauHinhItems = this.props.tmdtAdminCauHinhSanPham && this.props.tmdtAdminCauHinhSanPham.items ? this.props.tmdtAdminCauHinhSanPham.items : [];
        const table = renderDataTable({
            data: cauHinhItems, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead ref={e => this.ks_ten = e} style={{ width: '800px', whiteSpace: 'nowrap' }} content='Tên cấu hình' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='ten' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Hình minh họa' />
                    <TableHead style={{ width: '600px', whiteSpace: 'nowrap' }} content='Giá sản phẩm (VNĐ)' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.image ? <img width='100px' className='m-2' src={`${item.image}`} alt={`${item.image}`} /> : 'Chưa có'} />
                    <TableCell type='number' content={item.gia ? item.gia : 0} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }} onChanged={(value) => T.confirm(value ? 'Hiện cấu hình sản phẩm?' : 'Ẩn cấu hình sản phẩm?', value ? 'Bạn có chắc bạn muốn hiện cấu hình sản phẩm này?' : 'Bạn có chắc bạn muốn ẩn cấu hình sản phẩm này?', 'warning', true, (isConfirm) => { isConfirm && this.props.updateTmdtAdminCauHinh(this.state.maSanPham, item.id, { kichHoat: value ? 1 : 0 }); })} />
                    <TableCell type='buttons'>
                        <>
                            <Tooltip title='Cập nhật cấu hình' arrow onClick={() => this.modal.show({ item, maSanPham: this.state.maSanPham })}>
                                <button className='btn btn-primary'>
                                    <i className='fa-lg fa fa-envelope' />
                                </button>
                            </Tooltip>
                            {devPermission && devPermission.login && <Tooltip title='Xóa cấu hình' arrow onClick={() => this.delete(item)}>
                                <button className='btn btn-danger'>
                                    <i className='fa-lg fa fa-times' />
                                </button>
                            </Tooltip>}
                        </>
                    </TableCell>
                </tr >
            )
        });

        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: 'Cấu hình sản phẩm',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                'Cấu hình sản phẩm'
            ],
            onCreate: () => this.modal.show({ maSanPham: this.state.maSanPham }),
            content: <>
                <div className='tile'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                        <div className='title'>
                            <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                        </div>
                    </div>
                    {table}
                    <EditCauHinhModal ref={e => this.modal = e} create={this.props.createTmdtAdminCauHinh} update={this.props.updateTmdtAdminCauHinh} clearImage={this.props.clearUnsaveImages} />
                </div>
                <div className='tile'>
                    <h3>Thông tin sản phẩm</h3>
                    <div className='row'>
                        <FormSelect readOnly={true} className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                        <FormTextBox type='number' readOnly={true} className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                        <div className='col-12' >Mô tả sản phẩm: <FormEditor ref={e => this.moTa = e} readOnly={true} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                        <FormSelect readOnly={true} className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                        <FormSelect readOnly={true} multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' required placeholder='Thông tin thanh toán' />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' required placeholder='Thông tin giao hàng' />
                    </div>
                </div>
            </>,
            backRoute: '/user/tmdt/y-shop/admin/san-pham-manage',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtAdminCauHinhSanPham: state.tmdt.tmdtAdminCauHinhSanPham });
const mapActionsToProps = { getTmdtAdminCauHinhBySanPhamId, createTmdtAdminCauHinh, updateTmdtAdminCauHinh, deleteTmdtAdminCauHinh };
export default connect(mapStateToProps, mapActionsToProps)(CauHinhAdminDetailPage);
