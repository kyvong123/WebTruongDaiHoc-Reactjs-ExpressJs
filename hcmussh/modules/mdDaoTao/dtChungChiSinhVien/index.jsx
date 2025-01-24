//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtChungChiSinhVien from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtChungChiSinhVien }
    },
    routes: [
        {
            path: '/user/dao-tao/student-certificate-management',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/student-certificate-management/import',
            component: Loadable({ loading: Loading, loader: () => import('./importChungChi') })
        },
        {
            path: '/user/dao-tao/student-certificate-management/import/status',
            component: Loadable({ loading: Loading, loader: () => import('./importStatusChungChi') })
        },
    ],
};