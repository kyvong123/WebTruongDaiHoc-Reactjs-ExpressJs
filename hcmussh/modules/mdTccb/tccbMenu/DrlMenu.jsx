import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';
import { Link } from 'react-router-dom';

export default class DrlMenu extends React.Component {
    render() {
        return <SubMenusPage subTitle='Điểm rèn luyện' menuLink='/user/ctsv' menuKey={1000} parentKey={6160} backRoute={'/user/ctsv'}
            breadcrumb={[
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Điểm rèn luyện',
            ]}
        />;
    }
}