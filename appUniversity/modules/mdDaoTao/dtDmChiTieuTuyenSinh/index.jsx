//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmChiTieuTuyenSinh from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmChiTieuTuyenSinh }
    },
    routes: [
        {
            path: '/user/dao-tao/tuyen-sinh/chi-tieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/tuyen-sinh/chi-tieu/:namTuyenSinh/:dot',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};
