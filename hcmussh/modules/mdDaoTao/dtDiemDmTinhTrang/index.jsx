//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemDmTinhTrang from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiemDmTinhTrang }
    },
    routes: [
        {
            path: '/user/dao-tao/tinh-trang-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};