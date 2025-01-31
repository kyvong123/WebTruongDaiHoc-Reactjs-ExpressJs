//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCauHinhKyLuat from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmCauHinhKyLuat }
    },
    routes: [
        {
            path: '/user/ctsv/dm-cau-hinh-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};