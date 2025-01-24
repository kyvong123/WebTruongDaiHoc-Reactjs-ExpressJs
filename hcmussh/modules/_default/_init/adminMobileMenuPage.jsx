import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class SchedulePage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/settings/mobile'
            menuKey={2000} parentKey={2001}
            backRoute={'/user/settings'}
            subTitle={'Mobile'}
            headerIcon='fa-calendar-check-o'
            breadcrumb={[
                <Link key={0} to='/user/settings'>Cấu hinh</Link>,
                'Cấu hình mobile'
            ]}
        />;
    }
}
