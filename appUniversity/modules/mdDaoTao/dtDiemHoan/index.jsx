//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import diemHoan from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { diemHoan }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/diem-hoan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};