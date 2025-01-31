//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChuDeBlackbox from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChuDeBlackbox }
    },
    routes: [
        {
            path: '/user/category/chu-de-chat/blackbox',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/category/chu-de-chat/blackbox/don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./donViAdminPage') })
        },
    ],
};