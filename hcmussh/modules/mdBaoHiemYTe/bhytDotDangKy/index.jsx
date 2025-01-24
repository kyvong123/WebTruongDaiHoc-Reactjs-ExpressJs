//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvDotDangKyBhyt from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvDotDangKyBhyt }
    },
    routes: [
        {
            path: '/user/bao-hiem-y-te/cau-hinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};