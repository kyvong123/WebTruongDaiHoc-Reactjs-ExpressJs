//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dsdv from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { dsdv }
    },
    routes: [
        {
            path: '/user/tccb/ds-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
