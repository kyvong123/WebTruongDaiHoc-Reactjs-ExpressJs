import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class DrlMenu extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/ctsv' menuKey={6100} parentKey={6129} backRoute={'/user/ctsv'} />;
    }
}