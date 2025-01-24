import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class TuDienDuLieuMenu extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/tmdt/tu-dien-du-lieu' menuKey={10000} parentKey={10100} backRoute={'/user/tmdt/y-shop'} />;
    }
}