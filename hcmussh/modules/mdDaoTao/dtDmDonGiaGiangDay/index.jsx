//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmDonGiaGiangDay from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmDonGiaGiangDay }
    },
    routes: [
        {
            path: '/user/dao-tao/don-gia-giang-day',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};