import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class QuyetDinhMenu extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/ctsv' menuKey={6100} parentKey={6111} backRoute={'/user/ctsv'} />;
    }
}