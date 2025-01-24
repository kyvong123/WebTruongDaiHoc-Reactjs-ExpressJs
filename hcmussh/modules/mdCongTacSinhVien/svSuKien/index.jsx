//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svSuKien from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svSuKien }
    },
    routes: [
        {
            path: '/user/ctsv/danh-sach-su-kien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/danh-sach-su-kien/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
        {
            path: '/user/ctsv/duyet-su-kien/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./detailPageDuyetSuKien') })
        },
        {
            path: '/user/ctsv/su-kien/view/:id/:version',
            component: Loadable({ loading: Loading, loader: () => import('./historyInfoPage') })
        },
        {
            path: '/user/ctsv/duyet-su-kien',
            component: Loadable({ loading: Loading, loader: () => import('./duyetSuKienPage') })
        },
        {
            path: '/user/ctsv/phan-quyen-su-kien',
            component: Loadable({ loading: Loading, loader: () => import('./phanQuyenPage') })
        },
    ],
};
