//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtAdminDaiLy from './redux';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtAdminDaiLy }
    },
    routes: [
        {
            path: '/user/tmdt/y-shop/admin/dai-ly-manage',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
