//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDinhMuc from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDinhMuc }
    },
    routes: [
        {
            path: '/user/finance/dinh-muc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/finance/dinh-muc/:namHoc/:hocKy/:namTuyenSinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};