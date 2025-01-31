import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtUserSanPhamPage } from './redux';

class TMDTUserHomePage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tmdt/y-shop/admin', () => {
            this.props.getTmdtUserSanPhamPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtAdminSanPhamPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: 'Trang chủ Sản phẩm Y-Shop',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                'Trang chủ Sản phẩm Y-Shop'
            ],
            onCreate: () => this.modal.show(),
            content: <div className='tile'>
                <h3>Trang chủ Sản phẩm Y-Shop</h3>
                <p>Tính năng đang được hiện thực, vui lòng quay lại sau!</p>
            </div>,
            backRoute: '/user/tmdt/y-shop',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtUserSanPham: state.tmdt.tmdtUserSanPham });
const mapActionsToProps = { getTmdtUserSanPhamPage };
export default connect(mapStateToProps, mapActionsToProps)(TMDTUserHomePage);