//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtChungChiTinHocSinhVien from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtChungChiTinHocSinhVien }
    },
    routes: [
        {
            path: '/user/dao-tao/student-others-certificate',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/student-others-certificate/import',
            component: Loadable({ loading: Loading, loader: () => import('./importChungChi') })
        },
    ],
};