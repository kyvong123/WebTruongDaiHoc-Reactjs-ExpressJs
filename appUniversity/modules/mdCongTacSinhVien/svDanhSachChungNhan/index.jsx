//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvDashboardChungNhan from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvDashboardChungNhan }
    },
    routes: [
        {
            path: '/user/ctsv/dashboard-chung-nhan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
