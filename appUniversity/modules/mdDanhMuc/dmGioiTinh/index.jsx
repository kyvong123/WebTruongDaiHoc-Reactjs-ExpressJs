//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmGioiTinh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmGioiTinh, }
    },
    routes: [
        {
            path: '/user/category/gioi-tinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};