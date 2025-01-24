
import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default class DictionaryPage extends React.Component {
    render() {
        return <SubMenusPage menuLink='/user/dao-tao' menuKey={7000} parentKey={7028} backRoute={'/user/dao-tao'} />;
    }
}