import React from 'react';
import { Link } from 'react-router-dom';
import SubMenusPage from 'view/component/SubMenusPage';

export default class SdhMenuDiemPage extends React.Component {
    render() {
        return <SubMenusPage
            menuLink='/user/sau-dai-hoc'
            menuKey={7500} parentKey={7560}
            subTitle={'Quản lý điểm học phần'}
            headerIcon='fa-leaf'
            breadcrumb={[
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Quản lý điểm'
            ]}
        />;
    }
}