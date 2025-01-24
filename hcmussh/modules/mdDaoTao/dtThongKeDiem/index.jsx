//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThongKeDiem from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThongKeDiem }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/thong-ke-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};