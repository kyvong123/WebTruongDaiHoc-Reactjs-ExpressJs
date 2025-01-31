//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtSemester from 'modules/mdDaoTao/dtSemester/redux';
import dtThoiGianPhanCong from 'modules/mdDaoTao/dtThoiGianPhanCong/redux';
import SubMenusPage from 'view/component/SubMenusPage';
import React from 'react';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtSemester, dtThoiGianPhanCong }
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={7000} headerIcon='fa-diamond' />
        },
        {
            path: '/user/dao-tao/settings',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};