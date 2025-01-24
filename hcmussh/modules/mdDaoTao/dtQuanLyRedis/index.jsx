//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'daoTao',
        reducers: {}
    },
    routes: [
        {
            path: '/user/dao-tao/quan-ly-redis',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};