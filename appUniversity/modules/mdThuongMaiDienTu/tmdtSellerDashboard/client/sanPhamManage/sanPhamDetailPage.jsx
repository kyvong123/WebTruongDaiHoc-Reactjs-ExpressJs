import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, FormSelect, getValue, FormImageMultiBox, FormEditor, AdminPage } from 'view/component/AdminPage';
import { getTmdtSellerSanPhamItem, updateTmdtSellerSanPhamDraft, clearUnsaveImages } from '../../redux/sanPhamRedux';
import { Link } from 'react-router-dom';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';


class SanPhamDetailPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/tmdt/y-shop/seller', () => {
            this.getData();
            this.props.clearUnsaveImages();
        });
    }
    getData = () => {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/san-pham/:id'), id = route.parse(window.location.pathname).id;
        this.setState({ id });
        this.props.getTmdtSellerSanPhamItem(id, data => {
            if (data.error) {
                T.notify('Lấy sản phảm bị lỗi!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/seller/my-dai-ly');
            } else if (data.item) {
                const { id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, maCode, tagList, imagesUrl, gia, shippingInfo, paymentInfo, optionLabel } = data.item;
                this.setState({ id, ten, moTa, maLoaiSanPham, tenLoaiSanPham, maDaiLy, tenDaiLy, maCode, tagList, imagesUrl, gia, shippingInfo, paymentInfo, optionLabel }, () => {
                    this.ten.value(this.state.ten);
                    this.gia.value(this.state.gia);
                    this.moTa.value(this.state.moTa);
                    this.maLoaiSanPham.value(this.state.maLoaiSanPham);
                    this.maDaiLy.value(this.state.maDaiLy);
                    this.maCode.value(this.state.maCode);
                    this.tagList.value(this.state.tagList ? this.state.tagList.split(',') : []);
                    this.maCode.value(this.state.maCode);
                    this.shippingInfo.value(this.state.shippingInfo || '');
                    this.paymentInfo.value(this.state.paymentInfo || '');
                    this.optionLabel.value(this.state.optionLabel || 'Loại sản phẩm');
                    this.imageMultiBox.clear();
                });
            } else {
                T.notify('Không tìm thấy thông tin sản phẩm này!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/seller/my-dai-ly');
            }
        });
    }
    save = () => {
        const changes = {
            ten: getValue(this.ten),
            gia: getValue(this.gia),
            moTa: this.moTa.value(),
            maLoaiSanPham: getValue(this.maLoaiSanPham),
            maCode: getValue(this.maCode),
            tagList: getValue(this.tagList).toString(),
            shippingInfo: getValue(this.shippingInfo),
            paymentInfo: getValue(this.paymentInfo),
            optionLabel: getValue(this.optionLabel)
        };
        this.props.updateTmdtSellerSanPhamDraft(this.state.maDaiLy, this.state.id, changes, () => {
            this.props.history.push('/user/tmdt/y-shop/seller/my-dai-ly');
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Chi tiết sản phẩm',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop/seller/my-dai-ly' >Đại lý của tôi</Link>,
                'Chi tiết sản phẩm'
            ],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect readOnly={true} className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                        <FormTextBox readOnly={true} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                        <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                        <FormTextBox type='number' className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                        <div className='col-12' ><FormEditor ref={e => this.moTa = e} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                        <FormSelect className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                        <FormSelect multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                        <FormTextBox className='col-12' ref={e => this.optionLabel = e} label='Option label' placeholder='Option label' />
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
                        <FormTextBox className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' placeholder='Thông tin thanh toán' />
                        <FormTextBox className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' placeholder='Thông tin giao hàng' />
                        <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl={'/user/upload?category=tmdtDraftUpload&spId=' + this.state.id} uploadType='tmdtDraftUpload' userData='tmdtDraftUpload' />
                    </div>
                </div>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTmdtSellerSanPhamItem, updateTmdtSellerSanPhamDraft, clearUnsaveImages };
export default connect(mapStateToProps, mapActionsToProps)(SanPhamDetailPage);
