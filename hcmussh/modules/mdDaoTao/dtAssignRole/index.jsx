//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import assignRole from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { assignRole }
    },
    routes: [
        {
            path: '/user/dao-tao/assign-role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};