//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'daoTao',
        reducers: {}
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/assign-role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/tinh-trang-diem',
            component: Loadable({ loading: Loading, loader: () => import('./tinhtrangDiemPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/import-ty-le',
            component: Loadable({ loading: Loading, loader: () => import('./importPage') })
        }
    ],
};