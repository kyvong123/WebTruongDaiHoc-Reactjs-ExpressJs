//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtNgoaiNguKC from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtNgoaiNguKC }
    },
    routes: [
        {
            path: '/user/dao-tao/ngoai-ngu-khong-chuyen',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/ngoai-ngu-khong-chuyen/item',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetailPage') })
        },
        {
            path: '/user/dao-tao/ngoai-ngu-khong-chuyen/tinh-trang',
            component: Loadable({ loading: Loading, loader: () => import('./adminTinhTrangPage') })
        },
    ],
};