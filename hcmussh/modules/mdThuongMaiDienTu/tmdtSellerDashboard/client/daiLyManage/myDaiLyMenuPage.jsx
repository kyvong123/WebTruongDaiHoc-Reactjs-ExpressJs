import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { getTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';

class DaiLyMenuPage extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/my-dai-ly/:id'), maDaiLy = route.parse(window.location.pathname).id;
        this.setState({ maDaiLy });
        this.props.getTmdtDaiLy(maDaiLy);
    }

    render() {
        const daiLyInfo = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.item ? this.props.tmdtSellerMyDaiLy.item : null;
        return this.renderPage({
            icon: 'fa fa-store',
            title: `Dashboard Quản lý Đại lý: ${daiLyInfo?.ten} (${daiLyInfo?.maCode})`,
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={0} to='/user/tmdt/y-shop/seller/my-dai-ly' >Danh sách Đại Lý của bạn</Link>,
                'Dashboard Quản lý Đại lý'
            ],
            content: <>
                <div class="d-flex flex-wrap">
                    <div href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}/san-pham`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + 'fa-home'} />
                            <div className='info'>
                                <p>Quản lý sản phẩm</p>
                            </div>
                        </div>
                    </div>
                    <div href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}/don-hang`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + 'fa-home'} />
                            <div className='info'>
                                <p>Quản lý đơn hàng</p>
                            </div>
                        </div>
                    </div>
                    <div href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/voucher/${this.state.maDaiLy}`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + 'fa-home'} />
                            <div className='info'>
                                <p>Quản lý voucher</p>
                            </div>
                        </div>
                    </div>
                    <div href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}/info`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + 'fa-home'} />
                            <div className='info'>
                                <p>Thông tin đại lý bạn</p>
                            </div>
                        </div>
                    </div>
                    <div href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/dia-chi/${this.state.maDaiLy}`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + 'fa-home'} />
                            <div className='info'>
                                <p>Quản lý địa chỉ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/tmdt/y-shop/seller/my-dai-ly'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(DaiLyMenuPage);