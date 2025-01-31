//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmChungChiTinHoc from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmChungChiTinHoc }
    },
    routes: [
        {
            path: '/user/dao-tao/chung-chi-khac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};