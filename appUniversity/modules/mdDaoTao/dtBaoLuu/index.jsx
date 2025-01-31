//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtBaoLuu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtBaoLuu }
    },
    routes: [
        {
            path: '/user/dao-tao/bao-luu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};