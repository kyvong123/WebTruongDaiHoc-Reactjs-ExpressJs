//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThongKe from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThongKe }
    },
    routes: [
        {
            path: '/user/dao-tao/thong-ke',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/thong-ke-dang-ky/detail',
            component: Loadable({ loading: Loading, loader: () => import('./section/SinhVienDangKyHocPhan') })
        },
        {
            path: '/user/dao-tao/thong-ke-hoc-lai-cai-thien/detail',
            component: Loadable({ loading: Loading, loader: () => import('./section/SinhVienHocLaiHocCaiThien') })
        },
        {
            path: '/user/dao-tao/thong-ke-hoc-phi/detail',
            component: Loadable({ loading: Loading, loader: () => import('./section/SinhVienDongHocPhi') })
        }
    ],
};