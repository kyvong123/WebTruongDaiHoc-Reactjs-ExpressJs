//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangThietBi from './redux';
export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangThietBi }
    },
    routes: [
        {
            path: '/user/category/tinh-trang-thiet-bi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};