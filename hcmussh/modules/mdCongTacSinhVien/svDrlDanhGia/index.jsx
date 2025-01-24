//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvDanhGiaDrl from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvDanhGiaDrl }
    },
    routes: [
        {
            path: '/user/ctsv/danh-gia-drl',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/danh-gia-drl/chi-tiet/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./danhGiaDrlPage') })
        },
        {
            path: '/user/ctsv/danh-gia-drl/upload',
            component: Loadable({ loading: Loading, loader: () => import('./uploadPage') })
        },
    ],
};
