import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormRichTextBoxV2, FormTextBox, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtDaiLy, updateTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';

class TMDTSellerInfoPage extends AdminPage {
    state = {
        maDaiLy: null,
        filter: {},
    };

    componentDidMount() {
        T.ready('/user/tmdt/y-shop/seller/my-dai-ly/:id/info', () => {
            this.getData();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/my-dai-ly/:id/info'), maDaiLy = route.parse(window.location.pathname).id;
        this.props.getTmdtDaiLy(maDaiLy, data => {
            if (data.error) {
                T.notify('Lấy sản phảm bị lỗi!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/seller/my-dai-ly');
            } else if (data.item) {
                const { id, ten, gioiThieu, paymentInfo, shippingInfo } = data.item;
                this.setState({ maDaiLy: id, ten, gioiThieu, paymentInfo, shippingInfo }, () => {
                    this.ten.value(this.state.ten);
                    this.gioiThieu.value(this.state.gioiThieu);
                    this.paymentInfo.value(this.state.paymentInfo);
                    this.shippingInfo.value(this.state.shippingInfo);
                });
            } else {
                T.notify('Không tìm thấy thông tin đại lý này!', 'danger');
                this.props.history.push('/user/tmdt/y-shop/seller/my-dai-ly');
            }
        });
    }

    save = () => {
        const changes = {
            ten: getValue(this.ten),
            gioiThieu: getValue(this.gioiThieu),
            shippingInfo: getValue(this.shippingInfo),
            paymentInfo: getValue(this.paymentInfo),
        };
        this.props.updateTmdtDaiLy(this.state.maDaiLy, changes, () => {
            this.props.history.push(`/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`);
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: 'Thông tin đại lý',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={1} to='/user/tmdt/y-shop/seller/my-dai-ly'>Đại lý của tôi</Link>,
                'Thông tin đại lý'
            ],
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
                        {this.state.maDaiLy && <>
                            <div className='tile'>
                                <div className='row'>
                                    <FormTextBox readOnly={true} className='col-12' ref={e => this.ten = e} label='Tên đại lý' required placeholder='Nhập tên đại lý' />
                                    <FormRichTextBoxV2 className='col-12' ref={e => this.gioiThieu = e} label='Mô tả đại lý' required placeholder='Nhập mô tả đại lý' />
                                    <FormRichTextBoxV2 className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' required placeholder='Nhập thông tin thanh toán' />
                                    <FormRichTextBoxV2 className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' required placeholder='Nhập thông tin giao hàng' />
                                </div>
                            </div>
                            <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                                <i className='fa fa-lg fa-save' />
                            </button>
                        </>}
                    </>}
            </>,
            backRoute: `/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, tmdtSellerDonHang: state.tmdt.tmdtSellerDonHang });
const mapActionsToProps = { getTmdtDaiLy, updateTmdtDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(TMDTSellerInfoPage);