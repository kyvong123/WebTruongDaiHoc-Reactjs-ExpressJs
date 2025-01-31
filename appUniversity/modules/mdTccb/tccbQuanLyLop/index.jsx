//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbLop from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbLop }
    },
    routes: [
        {
            path: '/user/tccb/lop',
            component: Loadable({ loading: Loading, loader: () => import('./commonPage') })
        },
        {
            path: '/user/tccb/lop/item',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/lop/detail/:maLop',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};