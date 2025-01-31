//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDotDong from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDotDong }
    },
    routes: [
        {
            path: '/user/finance/dot-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/finance/cau-hinh-dot-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetailPage') })
        },
        {
            path: '/user/finance/khoa-giao-dich',
            component: Loadable({ loading: Loading, loader: () => import('./lockTransactionPage') })
        },
    ],
};