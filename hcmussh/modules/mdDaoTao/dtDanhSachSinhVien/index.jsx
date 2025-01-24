//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import manageSinhVien from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { manageSinhVien }
    },
    routes: [
        {
            path: '/user/dao-tao/manage-student',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
