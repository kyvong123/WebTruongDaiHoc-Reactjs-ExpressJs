//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmBacDonVi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmBacDonVi }
    },
    routes: [
        {
            path: '/user/category/bac-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};