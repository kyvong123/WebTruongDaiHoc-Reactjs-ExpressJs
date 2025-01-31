import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, FormSelect, FormEditor, AdminPage } from 'view/component/AdminPage';
import { getTmdtSanPhamDuyet } from './redux/sanPhamDuyetTaskRedux';
import { Link } from 'react-router-dom';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';


class duyetDetailPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/tmdt/y-shop/admin', () => {
            this.getData();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/tmdt/y-shop/admin/san-pham-duyet/:id'), id = route.parse(window.location.pathname).id;
        this.setState({ id });
        this.props.getTmdtSanPhamDuyet(id, data => {
            if (data.error) {
                T.notify('Lấy sản phảm chờ duyệt bị lỗi!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            } else if (data.item) {
                const { id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, tagList, maCode, imagesUrl, gia, shippingInfo, paymentInfo } = data.item;
                this.setState({ id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, tagList, maCode, imagesUrl, gia, shippingInfo, paymentInfo }, () => {
                    this.ten.value(this.state.ten);
                    this.gia.value(this.state.gia);
                    this.maCode.value(this.state.maCode);
                    this.moTa.value(this.state.moTa);
                    this.shippingInfo.value(this.state.shippingInfo);
                    this.paymentInfo.value(this.state.paymentInfo);
                    this.maLoaiSanPham.value(this.state.maLoaiSanPham);
                    this.maDaiLy.value(this.state.maDaiLy);
                    this.tagList.value(this.state.tagList ? this.state.tagList.split(',') : []);
                });
            } else {
                T.notify('Không tìm thấy thông tin sản phẩm chờ duyệt này!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/admin/san-pham-manage');
            }
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Chi tiết Sản phẩm chờ duyệt',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop/admin/san-pham-manage' >Quản lý Sản Phẩm Y-Shop</Link>,
                'Chi tiết Sản phẩm chờ duyệt'
            ],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect readOnly={true} className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                        <FormTextBox type='number' readOnly={true} className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                        <div className='col-12' >Mô tả sản phẩm: <FormEditor ref={e => this.moTa = e} readOnly={true} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                        <FormSelect readOnly={true} className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                        <FormSelect readOnly={true} multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' required placeholder='Nhập thông tin thanh toán' />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' required placeholder='Nhập thông tin giao hàng' />
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

                    </div>
                </div>
            </>,
            backRoute: '/user/tmdt/y-shop',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTmdtSanPhamDuyet };
export default connect(mapStateToProps, mapActionsToProps)(duyetDetailPage);
