//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmMonHocKhongTinhPhi from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmMonHocKhongTinhPhi }
    },
    routes: [
        {
            path: '/user/dao-tao/mon-hoc-khong-tinh-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};