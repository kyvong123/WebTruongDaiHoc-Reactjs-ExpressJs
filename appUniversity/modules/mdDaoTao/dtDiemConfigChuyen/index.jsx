//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import diemChuyen from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { diemChuyen }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/thang-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/thang-diem/:khoaSV',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
    ],
};