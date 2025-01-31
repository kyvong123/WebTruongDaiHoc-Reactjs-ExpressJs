import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';
import { Link } from 'react-router-dom';
export default class DictionarySdhPage extends React.Component {
    render() {
        return <SubMenusPage subTitle='Tuyển sinh' breadcrumb={[
            <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
            'Tuyển sinh'
        ]} backRoute='/user/sau-dai-hoc' menuLink='/user/sau-dai-hoc/tuyen-sinh' menuKey={7500} parentKey={7544} />;
    }
}