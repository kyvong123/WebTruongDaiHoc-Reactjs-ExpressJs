//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhKyLuat from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhKyLuat }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/hinh-thuc-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};