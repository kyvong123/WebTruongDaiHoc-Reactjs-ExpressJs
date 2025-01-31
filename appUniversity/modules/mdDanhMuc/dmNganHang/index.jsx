//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNganHang from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNganHang }
    },
    routes: [
        {
            path: '/user/category/ngan-hang-sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};