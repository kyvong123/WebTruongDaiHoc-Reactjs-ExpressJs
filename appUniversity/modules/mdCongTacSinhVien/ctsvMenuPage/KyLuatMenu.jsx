import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class KyLuatMenu extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/ctsv' menuKey={6100} parentKey={6140} backRoute={'/user/ctsv'} />;
    }
}