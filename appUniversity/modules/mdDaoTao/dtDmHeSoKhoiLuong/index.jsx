//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmHeSoKhoiLuong from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmHeSoKhoiLuong }
    },
    routes: [
        {
            path: '/user/dao-tao/he-so-khoi-luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};