//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNhomDonVi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNhomDonVi }
    },
    routes: [
        {
            path: '/user/category/nhom-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};