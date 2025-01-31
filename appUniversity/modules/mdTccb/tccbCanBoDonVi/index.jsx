//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import canBoDonVi from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { canBoDonVi }
    },
    routes: [
        {
            path: '/user/tccb/can-bo-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
