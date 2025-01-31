//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThuLaoGiangDay from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThuLaoGiangDay }
    },
    routes: [
        {
            path: '/user/dao-tao/thu-lao-giang-day',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};