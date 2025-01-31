//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtSvCtdt from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtSvCtdt }
    },
    routes: [
        {
            path: '/user/dao-tao/svChuongTrinhDaoTao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};