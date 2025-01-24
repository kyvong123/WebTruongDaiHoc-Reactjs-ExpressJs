//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ldv from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { ldv }
    },
    routes: [
        {
            path: '/user/tccb/loai-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};