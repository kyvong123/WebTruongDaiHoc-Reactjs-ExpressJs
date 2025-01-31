//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import TcSetting from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { TcSetting }
    },
    routes: [
        {
            path: '/user/finance/admin-setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingPage') })
        },
        {
            path: '/user/finance/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/finance/setting/mail',
            component: Loadable({ loading: Loading, loader: () => import('./emailPage') })
        },
    ],
};