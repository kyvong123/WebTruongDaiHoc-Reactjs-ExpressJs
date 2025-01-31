//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHocBong from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHocBong }
    },
    routes: [
        {
            path: '/user/finance/hoc-bong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/finance/hoc-bong/detail/:id',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') }),
        },
    ],
};