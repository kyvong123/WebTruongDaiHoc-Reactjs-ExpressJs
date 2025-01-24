
import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class SchedulePage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/dao-tao'
            menuKey={7000} parentKey={7029}
            backRoute={'/user/dao-tao'}
            subTitle={'Quản lý học phần'}
            headerIcon='fa-calendar-check-o'
            breadcrumb={[
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Quản lý học phần'
            ]}
        />;
    }
}