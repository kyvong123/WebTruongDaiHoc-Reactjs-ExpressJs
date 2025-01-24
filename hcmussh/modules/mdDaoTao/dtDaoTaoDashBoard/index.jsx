//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDaoTaoDashBoard from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDaoTaoDashBoard }
    },
    routes: [
        {
            path: '/user/dao-tao/dashboard-tong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};