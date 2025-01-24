
import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class SchedulePage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/dao-tao'
            menuKey={7000} parentKey={7080}
            backRoute={'/user/dao-tao'}
            subTitle={'Xét tốt nghiệp'}
            headerIcon='fa-graduation-cap'
            breadcrumb={[
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Xét tốt nghiệp'
            ]}
        />;
    }
}