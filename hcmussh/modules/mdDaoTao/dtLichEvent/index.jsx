//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtLichEvent from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtLichEvent }
    },
    routes: [
        {
            path: '/user/dao-tao/lich-event',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/lich-event/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};