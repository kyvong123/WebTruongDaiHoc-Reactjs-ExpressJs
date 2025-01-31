
import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class DiemConfigPage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/dao-tao'
            menuKey={7000} parentKey={7047}
            backRoute={'/user/dao-tao'}
            subTitle={'Quản lý điểm học phần'}
            headerIcon='fa-leaf'
            breadcrumb={[
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Quản lý điểm học phần'
            ]}
        />;
    }
}