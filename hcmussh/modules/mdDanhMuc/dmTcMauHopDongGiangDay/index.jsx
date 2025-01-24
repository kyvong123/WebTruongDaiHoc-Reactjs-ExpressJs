//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTcMauHopDongGiangDay from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTcMauHopDongGiangDay }
    },
    routes: [
        {
            path: '/user/category/mau-hop-dong-giang-day',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};