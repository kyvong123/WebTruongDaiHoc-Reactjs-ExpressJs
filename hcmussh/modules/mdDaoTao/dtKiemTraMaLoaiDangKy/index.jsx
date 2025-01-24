//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtKiemTraMaLoaiDangKy from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtKiemTraMaLoaiDangKy }
    },
    routes: [
        {
            path: '/user/dao-tao/kiem-tra-ma-loai-dky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};