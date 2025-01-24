//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmTinhTrangHocPhan from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmTinhTrangHocPhan }
    },
    routes: [
        {
            path: '/user/dao-tao/data-dictionary/tinh-trang-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};