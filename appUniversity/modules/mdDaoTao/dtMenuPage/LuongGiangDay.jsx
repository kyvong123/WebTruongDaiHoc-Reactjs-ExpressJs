
import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class LuongGiangDayPage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/dao-tao'
            menuKey={7000} parentKey={7050}
            backRoute={'/user/dao-tao'}
            subTitle={'Thù lao giảng dạy'}
            headerIcon='fa fa-th'
            breadcrumb={[
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thù lao giảng dạy'
            ]}
        />;
    }
}