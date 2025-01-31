import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class DanhMucTKBPage extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/dao-tao/danh-muc/thoi-khoa-bieu'
            subTitle={'Tra cứu và in thời khóa biểu'}
            headerIcon='fa-clipboard'
            menuKey={7000} parentKey={7069}
            backRoute={'/user/dao-tao/danh-muc/thoi-khoa-bieu'} />;
    }
}