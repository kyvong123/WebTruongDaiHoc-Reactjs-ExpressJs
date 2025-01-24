//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/ctsv/diem-ren-luyen',
            component: Loadable({ loading: Loading, loader: () => import('./DrlMenu.jsx') })
        },
        {
            path: '/user/ctsv/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./KyLuatMenu.jsx') })
        },
        {
            path: '/user/ctsv/tu-dien-du-lieu',
            component: Loadable({ loading: Loading, loader: () => import('./TuDienDuLieu.jsx') })
        },
        {
            path: '/user/ctsv/chung-nhan-truc-tuyen',
            component: Loadable({ loading: Loading, loader: () => import('./ChungNhanTrucTuyenMenu.jsx') })
        },
        {
            path: '/user/ctsv/quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./QuyetDinhMenu.jsx') })
        },
        {
            path: '/user/ctsv/tot-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./TotNghiepMenu.jsx') })
        },
        {
            path: '/user/ctsv/su-kien',
            component: Loadable({ loading: Loading, loader: () => import('./SuKienMenu.jsx') })
        },
    ],
};