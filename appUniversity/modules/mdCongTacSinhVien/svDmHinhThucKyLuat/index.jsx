//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHinhThucKyLuat from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmHinhThucKyLuat }
    },
    routes: [
        {
            path: '/user/ctsv/hinh-thuc-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};