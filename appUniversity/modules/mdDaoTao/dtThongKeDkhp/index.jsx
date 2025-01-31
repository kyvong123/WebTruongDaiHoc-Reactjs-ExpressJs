//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDangKyHocPhan from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import dtThongKeDkhp from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDangKyHocPhan, dtThongKeDkhp }
    },
    routes: [
        {
            path: '/user/dao-tao/thong-ke-dkhp',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};