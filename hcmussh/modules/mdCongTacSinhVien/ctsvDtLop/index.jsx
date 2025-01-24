//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvLop from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvLop }
    },
    routes: [
        {
            path: '/user/ctsv/lop',
            component: Loadable({ loading: Loading, loader: () => import('./commonPage') })
        },
        {
            path: '/user/ctsv/lop/item',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/lop/detail/:maLop',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};