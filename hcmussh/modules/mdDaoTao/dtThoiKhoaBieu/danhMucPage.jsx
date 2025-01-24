
import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class DanhMucTKBPage extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/dao-tao/edu-schedule'
            subTitle={'Thời khóa biểu'}
            headerIcon='fa-calendar'
            menuKey={7000} parentKey={7001}
            backRoute={'/user/dao-tao/edu-schedule'} />;
    }
}