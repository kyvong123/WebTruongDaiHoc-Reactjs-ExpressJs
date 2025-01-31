//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDangKyHocPhan from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDangKyHocPhan }
    },
    routes: [
        {
            path: '/user/dao-tao/edu-schedule/dang-ky-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};