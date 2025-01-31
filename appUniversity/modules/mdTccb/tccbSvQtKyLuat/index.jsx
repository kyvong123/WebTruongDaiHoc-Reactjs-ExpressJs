//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbSvKyLuat from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbSvKyLuat }
    },
    routes: [
        {
            path: '/user/tccb/sv-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};