//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtKhoaDaoTao from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtKhoaDaoTao }
    },
    routes: [
        {
            path: '/user/dao-tao/data-dictionary/khoa-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};