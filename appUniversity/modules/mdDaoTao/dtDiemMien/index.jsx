//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import diemMien from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { diemMien }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/diem-mien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};