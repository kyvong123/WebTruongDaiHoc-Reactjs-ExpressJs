//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmBoMon from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmBoMon },
    },
    routes: [
        {
            path: '/user/category/bo-mon/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/category/bo-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};