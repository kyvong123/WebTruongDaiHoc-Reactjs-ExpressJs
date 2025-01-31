//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svQtKyLuat from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svQtKyLuat }
    },
    routes: [
        {
            path: '/user/ctsv/qua-trinh/ky-luat/group/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./groupPage') })
        },
        {
            path: '/user/ctsv/qua-trinh/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/qua-trinh/cau-hinh-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./xetKyLuatPage') })
        },
    ],
};
