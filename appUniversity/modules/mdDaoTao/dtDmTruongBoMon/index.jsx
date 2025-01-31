//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmTruongBoMon from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmTruongBoMon }
    },
    routes: [
        {
            path: '/user/dao-tao/truong-bo-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};