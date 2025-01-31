//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDangKyHocPhanCu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDangKyHocPhanCu }
    },
    routes: [
        {
            path: '/user/dao-tao/dang-ky-cu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};