//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmDotTrungTuyen from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmDotTrungTuyen }
    },
    routes: [
        {
            path: '/user/dao-tao/dot-trung-tuyen',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};