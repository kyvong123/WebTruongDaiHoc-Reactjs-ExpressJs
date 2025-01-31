//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangPhong from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dmTinhTrangPhong }
    },
    routes: [
        {
            path: '/user/dao-tao/tinh-trang-phong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};