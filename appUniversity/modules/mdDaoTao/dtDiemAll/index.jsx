//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemAll from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiemAll }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/data',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/data/import',
            component: Loadable({ loading: Loading, loader: () => import('./importPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/nhap-diem',
            component: Loadable({ loading: Loading, loader: () => import('./nhapDiemPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/nhap-diem/:maHocPhan',
            component: Loadable({ loading: Loading, loader: () => import('./section/nhapDiemHocPhanPage') })
        },
    ],
};