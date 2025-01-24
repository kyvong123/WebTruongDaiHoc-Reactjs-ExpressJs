//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtLop from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtLop }
    },
    routes: [
        {
            path: '/user/dao-tao/lop',
            component: Loadable({ loading: Loading, loader: () => import('./commonPage') })
        },
        {
            path: '/user/dao-tao/lop/item',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/lop/detail/:maLop',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};