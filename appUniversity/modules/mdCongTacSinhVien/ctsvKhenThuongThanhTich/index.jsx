//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvThanhTich from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvThanhTich }
    },
    routes: [
        {
            path: '/user/ctsv/dm-thanh-tich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};