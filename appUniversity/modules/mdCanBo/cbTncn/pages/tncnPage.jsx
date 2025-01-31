
import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class TcThuNhapCaNhan extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user'
            menuKey={1000} parentKey={5120}
            backRoute={'/user'}
            subTitle={'Thu nhập cá nhân'}
            headerIcon='fa fa-th'
            breadcrumb={[
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Thu nhập cá nhân'
            ]}
        />;
    }
}
