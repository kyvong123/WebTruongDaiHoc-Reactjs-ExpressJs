//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import loaiDiem from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { loaiDiem }
    },
    routes: [
        {
            path: '/user/dao-tao/loai-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};