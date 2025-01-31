//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SubMenusPage from 'view/component/SubMenusPage';
import React from 'react';

export default {
    routes: [
        {
            path: '/user/ctsv',
            component: () => <SubMenusPage menuLink='/user/ctsv' menuKey={6100} headerIcon='fa-users' />
        },
        {
            path: '/user/ctsv/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./DashboardPage') })
        },
    ],
};
