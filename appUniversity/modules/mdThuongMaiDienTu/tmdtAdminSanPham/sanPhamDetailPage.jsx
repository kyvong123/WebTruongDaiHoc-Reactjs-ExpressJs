import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, FormSelect, getValue, FormEditor, AdminPage, FormImageMultiBox } from 'view/component/AdminPage';
import { getTmdtAdminSanPhamItem, createTmdtAdminSanPham, updateTmdtAdminSanPham, deleteTmdtAdminSanPham } from './redux/sanPhamRedux';
import { Link } from 'react-router-dom';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';


class SanPhamAdminDetailPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/tmdt/y-shop/admin', () => {
            this.getData();
        });
    }
    getData = () => {
        const route = T.routeMatcher('/user/tmdt/y-shop/admin/san-pham/:id'), id = route.parse(window.location.pathname).id;
        this.setState({ id });
        this.props.getTmdtAdminSanPhamItem(id, data => {
            if (data.error) {
                T.notify('Lấy sản phảm bị lỗi!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            } else if (data.item) {
                const { id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, tagList, maCode, imagesUrl, gia, shippingInfo, paymentInfo } = data.item;
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
                T.notify('Không tìm thấy thông tin sản phẩm này!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            }
        });
    }
    save = () => {
        const changes = {
            ten: getValue(this.ten),
            maCode: getValue(this.maCode),
            gia: getValue(this.gia),
            moTa: this.moTa.value(),
            maLoaiSanPham: getValue(this.maLoaiSanPham),
            maDaiLy: getValue(this.maDaiLy),
            tagList: getValue(this.tagList).toString(),
            shippingInfo: getValue(this.shippingInfo),
            paymentInfo: getValue(this.paymentInfo),
            shippingInfo: '',
            paymentInfo: '',
        };
        console.log('after reading paymentInfo');
        this.props.updateTmdtAdminSanPham(this.state.id, changes, () => { });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Chi tiết sản phẩm',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop/admin/san-pham-manage' >Quản lý sản phẩm</Link>,
                'Chi tiết sản phẩm'
            ],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                        <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                        <FormTextBox type='number' className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                        <div className='col-12' ><FormEditor ref={e => this.moTa = e} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                        <FormSelect className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                        <FormSelect multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                        <FormTextBox className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' placeholder='Thông tin giao hàng' />
                        <FormTextBox className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' placeholder='Thông tin thanh toán' />
                        {this.state.imagesUrl && this.state.imagesUrl.length > 0 && <div className="col-12" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                            <div>Hình ảnh sản phẩm:</div>
                            <PhotoProvider>
                                {
                                    this.state.imagesUrl.map((item, index) => (
                                        <PhotoView key={index} src={`${item}`}>
                                            <img width='100px' className='m-2' src={`${item}`} alt={`${item}`} />
                                        </PhotoView>
                                    ))
                                }
                            </PhotoProvider>
                        </div>}
                        <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl={this.state.id ? '/user/upload?category=tmdtSpUploadFile&spId=' + this.state.id : '/user/upload?category=tmdtSpUploadFile'} uploadType='tmdtSpUploadFile' userData='tmdtSpUploadFile' />
                    </div>
                </div>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </>,
            backRoute: '/user/tmdt/y-shop/admin/san-pham-manage',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTmdtAdminSanPhamItem, createTmdtAdminSanPham, updateTmdtAdminSanPham, deleteTmdtAdminSanPham };
export default connect(mapStateToProps, mapActionsToProps)(SanPhamAdminDetailPage);
