import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtSellerMyDaiLyList } from '../../redux/myDaiLyRedux';

class MyDaiLyPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/tmdt/y-shop/seller/my-dai-ly', () => {
            this.props.getTmdtSellerMyDaiLyList();
        });
    }

    render() {
        const items = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.items ? this.props.tmdtSellerMyDaiLy.items : [];
        return this.renderPage({
            icon: 'fa fa-store',
            title: 'Danh sách Đại Lý của bạn',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                'Danh sách Đại Lý của bạn'
            ],
            content: <>
                <div class="d-flex flex-wrap">
                    {
                        (!items || items.length == 0) && <div className='tile w-100'>
                            <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                                <h3>Bạn chưa tham gia đại lý nào!</h3>
                            </div>
                        </div>
                    }
                    {items && items.map((item, index) => <div key={index} href='#' style={{ cursor: 'pointer' }} className='col-md-4 col-lg-3' onClick={() => this.props.history.push(`/user/tmdt/y-shop/seller/my-dai-ly/${item.id}`)}>
                        <div className='widget-small coloured-icon'>
                            <i style={{ color: item.color || 'white', backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + (item.icon || 'fa-home')} />
                            <div className='info'>
                                <p>{item.ten}</p>
                            </div>
                        </div>
                    </div>)}
                </div>
            </>,
            backRoute: '/user/tmdt/y-shop'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtSellerMyDaiLyList };
export default connect(mapStateToProps, mapActionsToProps)(MyDaiLyPage);